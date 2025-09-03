import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { NotificationType } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';

class MessageService {
  public async getMessagesForTask(
    requesterId: string,
    taskId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: any[]; totalMessages: number; page: number; limit: number; totalPages: number }> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, freelancerId: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== requesterId && task.freelancerId !== requesterId) {
      throw new AppError('You are not authorized to view messages for this task.', 403);
    }

    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }, // Get most recent messages first
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });

    const totalMessages = await prisma.message.count({ where: { taskId } });

    return {
      messages: messages.reverse(), // Return in chronological order
      totalMessages,
      page,
      limit,
      totalPages: Math.ceil(totalMessages / limit),
    };
  }

  // This method is now primarily called by Socket.IO for real-time,
  // but a REST endpoint could also use it for simple message sending.
  public async createMessage(senderId: string, taskId: string, content: string): Promise<any> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { client: true, freelancer: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== senderId && task.freelancerId !== senderId) {
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
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    });

    // Determine recipient for notification
    const recipientId = senderId === task.clientId ? task.freelancerId : task.clientId;
    if (recipientId) {
      const senderProfile = newMessage.sender.profile;
      const senderName = senderProfile?.firstName || newMessage.sender.email;
      await createNotification(
        recipientId,
        NotificationType.NEW_MESSAGE,
        `${senderName} sent a new message in task "${task.title}".`,
        `/dashboard/tasks/${taskId}/chat`,
        taskId,
      );
      // Real-time notification handled by socket.ts after creation
    }

    return newMessage;
  }
}

export default new MessageService();