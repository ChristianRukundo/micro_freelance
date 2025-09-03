import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const notificationIdSchema = z.object({
  notificationId: z.string().cuid('Invalid notification ID format'),
});

export const getNotificationsQuerySchema = z.object({
  isRead: z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), z.boolean().optional()),
  type: z
    .enum(Object.values(NotificationType) as [string, ...string[]], {
      error: 'Invalid notification type specified',
    })
    .optional(),
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
});
