// File: backend/src/modules/messaging/message.service.ts
import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { NotificationType } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';
import { logger } from '@shared/utils/logger';

class MessageService {
  public async getMessagesForTask(
    requesterId: string,
    taskId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: any[]; totalMessages: number; currentPage: number; limit: number; totalPages: number }> {
    // <--- Return type updated for currentPage/limit
    logger.debug(`MessageService: Attempting to fetch messages for taskId: ${taskId} by requesterId: ${requesterId}.`, {
      taskId,
      requesterId,
    });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, freelancerId: true, title: true },
    });

    if (!task) {
      logger.warn(`MessageService: Task not found for ID: ${taskId} when fetching messages.`, { taskId, requesterId });
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== requesterId && task.freelancerId !== requesterId) {
      logger.warn(
        `MessageService: Unauthorized access to messages for taskId: ${taskId} by requesterId: ${requesterId}.`,
        {
          taskId,
          requesterId,
          clientId: task.clientId,
          freelancerId: task.freelancerId,
        },
      );
      throw new AppError('You are not authorized to view messages for this task.', 403);
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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

    const totalMessages = await prisma.message.count({ where: { taskId } });
    const totalPages = Math.ceil(totalMessages / limit);

    logger.debug(`MessageService: Successfully fetched ${messages.length} messages for task ${taskId}.`, {
      totalMessages,
      currentPage: page,
      totalPages,
      limit,
    });
    return {
      messages: messages.reverse(),
      totalMessages,
      currentPage: page, // <--- Corrected field name for consistency
      limit, // <--- Corrected field name for consistency
      totalPages,
    };
  }

  public async createMessage(senderId: string, taskId: string, content: string): Promise<any> {
    logger.debug(`MessageService: Attempting to create message for taskId: ${taskId} from senderId: ${senderId}.`, {
      taskId,
      senderId,
      contentPreview: content.substring(0, 50),
    });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        client: { select: { id: true, email: true, profile: true } },
        freelancer: { select: { id: true, email: true, profile: true } },
      },
    });

    if (!task) {
      logger.warn(`MessageService: Task not found for ID: ${taskId} during message creation.`, { taskId, senderId });
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== senderId && task.freelancerId !== senderId) {
      logger.warn(`MessageService: Unauthorized to send message in task ${taskId} by senderId: ${senderId}.`, {
        taskId,
        senderId,
        clientId: task.clientId,
        freelancerId: task.freelancerId,
      });
      throw new AppError('You are not authorized to send messages in this task chat.', 403);
    }

    const newMessage = await prisma.message.create({
      data: {
        taskId,
        senderId,
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

    logger.info(`MessageService: Message created successfully for task ${taskId} by ${senderId}.`, {
      messageId: newMessage.id,
    });

    const recipientId = senderId === task.clientId ? task.freelancerId : task.clientId;
    if (recipientId) {
      const senderName = newMessage.sender.profile?.firstName || newMessage.sender.email;
      const notificationMessage = `${senderName} sent a new message in task "${task.title}".`;
      const notificationUrl = `/dashboard/projects/${taskId}`;

      await createNotification(recipientId, NotificationType.NEW_MESSAGE, notificationMessage, notificationUrl, taskId);
      logger.debug(
        `MessageService: Notification scheduled for ${recipientId} regarding new message in task ${taskId}.`,
      );
    }

    return newMessage;
  }
}

export default new MessageService();
