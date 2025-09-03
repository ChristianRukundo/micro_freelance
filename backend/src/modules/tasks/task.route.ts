import { Router } from 'express';
import taskController from './task.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { createTaskSchema, getTasksQuerySchema, updateTaskSchema, taskIdSchema } from './task.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.get('/', validateRequest({ query: getTasksQuerySchema }), taskController.getTasks);
router.get('/:id', validateRequest({ params: taskIdSchema }), taskController.getTaskById);

router.use(protect); // All routes below this use authentication

router.post('/', authorize(UserRole.CLIENT), validateRequest({ body: createTaskSchema }), taskController.createTask);
router.put(
  '/:id',
  authorize(UserRole.CLIENT),
  validateRequest({ params: taskIdSchema, body: updateTaskSchema }),
  taskController.updateTask,
);
router.delete('/:id', authorize(UserRole.CLIENT), validateRequest({ params: taskIdSchema }), taskController.deleteTask);
router.patch(
  '/:id/cancel',
  authorize(UserRole.CLIENT, UserRole.ADMIN),
  validateRequest({ params: taskIdSchema }),
  taskController.cancelTask,
); // Allow client and admin to cancel

router.patch(
  '/:id/complete',
  authorize(UserRole.CLIENT),
  validateRequest({ params: taskIdSchema }),
  taskController.completeTask,
);

export default router;
