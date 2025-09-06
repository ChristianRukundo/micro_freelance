// File: backend/src/socket.ts
import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '@shared/utils/jwt';
import config from '@config/index';
import prisma from '@shared/database/prisma';
import { NotificationType, UserRole, Profile } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';
import { logger } from '@shared/utils/logger';
import * as cookie from 'cookie';
import AppError from '@shared/utils/appError';

interface AuthenticatedSocketData {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isSuspended: boolean;
    profile: Profile | null;
  };
}

let io: SocketIOServer;

const getAccessTokenFromSocket = (socket: Socket): string | undefined => {
  // 1. Prioritize auth header (for non-browser clients or specific setups)
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'undefined') {
      return token;
    }
  }

  // 2. Fallback to parsing cookies (primary method for browsers)
  const cookies = socket.handshake.headers.cookie;

  // This check is still valid and important
  if (typeof cookies === 'string' && cookies.length > 0) {
    try {
      // The `cookie.parse` call will now work correctly
      const parsedCookies = cookie.parse(cookies);
      return parsedCookies.accessToken;
    } catch (error) {
      logger.error('Socket.IO: Failed to parse cookies.', { cookieHeader: cookies, error });
      return undefined;
    }
  }

  return undefined;
};

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = getAccessTokenFromSocket(socket);

    if (!token) {
      logger.warn('Socket.IO Auth: No access token found in handshake.', { socketId: socket.id });
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = verifyToken(token, config.JWT_SECRET);
      if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        logger.warn('Socket.IO Auth: Invalid token.', { socketId: socket.id });
        return next(new Error('Authentication error: Invalid token.'));
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isSuspended: true, profile: { select: { firstName: true } } },
      });

      if (!currentUser || currentUser.isSuspended) {
        logger.warn('Socket.IO Auth: User not found or suspended.', { userId: decoded.id });
        return next(new Error('Authentication error: User not found or suspended.'));
      }

      socket.data.user = currentUser;
      next();
    } catch (error: any) {
      logger.error('Socket.IO Auth: Token verification failed.', { error: error.message, socketId: socket.id });
      next(new Error('Authentication error: Token verification failed.'));
    }
  });

  io.on('connection', (socket: Socket & { data: AuthenticatedSocketData }) => {
    const user = socket.data.user;
    logger.info(`User connected: ${user.email} (${user.id})`, { socketId: socket.id });

    socket.join(user.id);
    logger.debug(`User ${user.id} joined personal notification room.`, { socketId: socket.id });

    socket.on('join_room', async (taskId: string) => {
      logger.debug(`User ${user.id} attempting to join task room: ${taskId}`, {
        socketId: socket.id,
        requestedTaskId: taskId,
      });
      try {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          select: { clientId: true, freelancerId: true, title: true },
        });

        if (!task) {
          logger.warn(`Socket.IO: Task not found for ID: ${taskId} when user ${user.id} tried to join room.`, {
            socketId: socket.id,
            taskId,
            userId: user.id,
          });
          socket.emit('chat_error', 'Chat room not found for this task.');
          return;
        }
        if (task.clientId !== user.id && task.freelancerId !== user.id) {
          logger.warn(`Socket.IO: User ${user.id} attempted to join unauthorized task room ${taskId}.`, {
            socketId: socket.id,
            taskId,
            userId: user.id,
            clientId: task.clientId,
            freelancerId: task.freelancerId,
          });
          socket.emit('chat_error', 'You are not authorized to join this chat room.');
          return;
        }

        socket.join(taskId);
        logger.info(`User ${user.email} joined task room: ${taskId}`, { socketId: socket.id });
        socket.emit('joined_room', taskId);
      } catch (error: any) {
        logger.error(`Socket.IO: Error joining task room ${taskId} for user ${user.id}.`, {
          socketId: socket.id,
          taskId,
          userId: user.id,
          error: error.message,
          stack: error.stack,
        });
        socket.emit('chat_error', `Failed to join chat: ${error.message}`);
      }
    });

    socket.on('send_message', async ({ taskId, content }: { taskId: string; content: string }) => {
      try {
        if (!user) throw new AppError('User not authenticated for socket operations.', 401);

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          select: { id: true, title: true, clientId: true, freelancerId: true },
        });

        if (!task || (task.clientId !== user.id && task.freelancerId !== user.id)) {
          throw new AppError('Unauthorized to send message in this task chat.', 403);
        }

        const newMessage = await prisma.message.create({
          data: {
            taskId,
            senderId: user.id,
            content,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
                profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        });

        // Broadcast the new message to EVERYONE in the room. This is the simplest and most reliable way.
        io.to(taskId).emit('receive_message', newMessage);
        logger.info(`Message sent and broadcasted in room ${taskId} by ${user.email}`);

        // Notify the OTHER party
        const recipientId = user.id === task.clientId ? task.freelancerId : task.clientId;
        if (recipientId) {
          const senderName = user.profile?.firstName || user.email.split('@')[0];
          await createNotification(
            recipientId,
            NotificationType.NEW_MESSAGE,
            `${senderName} sent a new message in task "${task.title}".`,
            `/dashboard/projects/${taskId}`,
          );
        }
      } catch (error: any) {
        logger.error('Error in send_message socket handler', { error: error.message, stack: error.stack });
        socket.emit('error', `Failed to send message: ${error.message}`);
      }
    });

    socket.on('typing_start', (taskId: string) => {
      logger.debug(`Socket.IO: User ${user.id} started typing in task ${taskId}.`, { socketId: socket.id, taskId });
      socket.to(taskId).emit('typing_start', { userId: user.id, taskId: taskId });
    });

    socket.on('typing_stop', (taskId: string) => {
      logger.debug(`Socket.IO: User ${user.id} stopped typing in task ${taskId}.`, { socketId: socket.id, taskId });
      socket.to(taskId).emit('typing_stop', { userId: user.id, taskId: taskId });
    });

    socket.on('disconnect', (reason: string) => {
      logger.info(`Socket.IO: User disconnected: ${user.email} (${user.id}) - Reason: ${reason}`, {
        socketId: socket.id,
      });
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  }
  return io;
};
