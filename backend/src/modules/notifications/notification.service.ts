import prisma from '@shared/database/prisma';
import AppError from '@shared/utils/appError';
import { Notification, NotificationType } from '@prisma/client';
import { getSocketIO } from '../../socket'; // Corrected path to socket.ts
import logger from '@shared/utils/logger'; // Import logger

export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  url: string,
  taskId?: string,
  bidId?: string,
  milestoneId?: string,
): Promise<Notification> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        url,
        taskId,
        bidId,
        milestoneId,
      },
    });

    // Attempt to emit real-time notification via Socket.IO
    try {
      const io = getSocketIO();
      if (io) {
        // Check if Socket.IO is initialized
        // Emitting to a specific user's socket ID or a room named after their ID
        io.to(userId).emit('new_notification', notification);
        logger.debug(`Socket.IO: Emitted '${type}' notification to user ${userId}.`, {
          userId,
          type,
          message: notification.message,
        });
      } else {
        logger.warn(`Socket.IO: Not initialized. Could not emit notification to user ${userId}.`, {
          userId,
          type,
          message,
        });
      }
    } catch (socketError: any) {
      // Log the socket error but DO NOT re-throw,
      // as the database notification has already been created.
      logger.error(`Socket.IO: Failed to emit notification to user ${userId}: ${socketError.message}`, {
        userId,
        type,
        message,
        socketError: socketError instanceof Error ? socketError.message : String(socketError),
        stack: socketError instanceof Error ? socketError.stack : undefined,
      });
    }

    return notification;
  } catch (error: any) {
    logger.error(`Failed to create database notification for user ${userId}: ${error.message}`, {
      userId,
      type,
      message,
      errorDetails: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new AppError(`Failed to create notification: ${error.message}`, 500);
  }
}

class NotificationService {
  public async getNotifications(userId: string, isRead?: boolean, type?: NotificationType, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }

    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalNotifications = await prisma.notification.count({ where });

    return {
      notifications,
      totalNotifications,
      page,
      limit,
      totalPages: Math.ceil(totalNotifications / limit),
    };
  }

  public async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }
    if (notification.userId !== userId) {
      throw new AppError('You are not authorized to access this notification.', 403);
    }
    if (notification.isRead) {
      return notification; // Already read, no update needed
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  public async markAllNotificationsAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }
}

export default new NotificationService();
