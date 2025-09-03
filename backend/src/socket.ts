import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '@shared/utils/jwt';
import config from '@config/index';
import prisma from '@shared/database/prisma';
import { NotificationType } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';
import AppError from '@shared/utils/appError';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN,
      credentials: true,
    },
    cookie: true, // Enable cookie parsing for auth
  });

  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    let token: string | undefined;

    // Try to get accessToken from handshake headers or cookies
    // Frontend should send it via 'Authorization: Bearer <token>' for WebSocket or as cookie
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    } else if (socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      token = cookies.accessToken;
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = verifyToken(token, config.JWT_SECRET);
      if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
        return next(new Error('Authentication error: Invalid token.'));
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isSuspended: true },
      });

      if (!currentUser || currentUser.isSuspended) {
        return next(new Error('Authentication error: User not found or suspended.'));
      }

      socket.data.user = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      };
      next();
    } catch (error: any) {
      console.error('Socket authentication failed:', error.message);
      next(new Error('Authentication error: Token verification failed.'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.email} (${user.id})`);

    // Event to join a task-specific chat room
    socket.on('join_room', async (taskId: string) => {
      // Ensure user is authorized to join this room
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task || (task.clientId !== user.id && task.freelancerId !== user.id)) {
        console.warn(`User ${user.id} attempted to join unauthorized room ${taskId}`);
        socket.emit('error', 'Unauthorized to join this chat room.');
        return;
      }

      socket.join(taskId);
      console.log(`User ${user.email} joined room: ${taskId}`);
      socket.emit('joined_room', taskId);
    });

    // Event to send a message
    socket.on('send_message', async ({ taskId, content }: { taskId: string; content: string }) => {
      try {
        if (!user) {
          throw new AppError('User not authenticated for socket operations.', 401);
        }

        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { client: true, freelancer: true },
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

        // Emit message to all users in the task room
        io.to(taskId).emit('receive_message', newMessage);
        console.log(`Message sent in room ${taskId} by ${user.email}`);

        // Create notifications for the other party in the chat
        const recipientId = user.id === task.clientId ? task.freelancerId : task.clientId;
        if (recipientId) {
          await createNotification(
            recipientId,
            NotificationType.NEW_MESSAGE,
            `${user.profile?.firstName || user.email} sent a new message in task "${task.title}"`,
            `/dashboard/tasks/${taskId}/chat`,
            taskId,
          );
          // Emit notification via Socket.IO if the recipient is also connected
          io.to(recipientId).emit('new_notification', {
            message: `${user.profile?.firstName || user.email} sent a new message`,
            taskId,
          });
        }
      } catch (error: any) {
        console.error('Error sending message:', error);
        socket.emit('error', `Failed to send message: ${error.message}`);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (taskId: string) => {
      socket.to(taskId).emit('typing_start', { userId: user.id, taskId: taskId });
    });

    socket.on('typing_stop', (taskId: string) => {
      socket.to(taskId).emit('typing_stop', { userId: user.id, taskId: taskId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email} (${user.id})`);
    });
  });

  return io;
};

// Export io instance to allow emitting events from other parts of the application
export const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket(httpServer) first.');
  }
  return io;
};