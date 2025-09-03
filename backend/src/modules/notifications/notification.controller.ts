import { Request, Response, NextFunction } from 'express';
import notificationService from './notification.service';
import { notificationIdSchema, getNotificationsQuerySchema } from './notification.validation';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';

class NotificationController {
  public async getNotifications(
    req: Request<unknown, unknown, unknown, z.infer<typeof getNotificationsQuerySchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { isRead, type, page, limit } = req.query;
      const notificationsData = await notificationService.getNotifications(req.user!.id, isRead, type as NotificationType, page, limit);
      res.status(200).json({ success: true, data: notificationsData });
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request<z.infer<typeof notificationIdSchema>>, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const notification = await notificationService.markNotificationAsRead(req.user!.id, notificationId);
      res.status(200).json({ success: true, message: 'Notification marked as read.', data: notification });
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllNotificationsAsRead(req.user!.id);
      res.status(200).json({ success: true, message: `${result.count} notifications marked as read.` });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
