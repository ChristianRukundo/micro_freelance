import { Router } from 'express';
import notificationController from './notification.controller';
import { protect } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { notificationIdSchema, getNotificationsQuerySchema } from './notification.validation';

const router = Router();

router.use(protect); // All routes below this require authentication

router.get('/', validateRequest({ query: getNotificationsQuerySchema }), notificationController.getNotifications);
router.patch(
  '/:notificationId/read',
  validateRequest({ params: notificationIdSchema }),
  notificationController.markAsRead,
);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
