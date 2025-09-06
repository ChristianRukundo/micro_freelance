import { Router } from 'express';
import taskController from './task.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { createTaskSchema, getTasksQuerySchema, updateTaskSchema, taskIdSchema } from './task.validation';
import { UserRole } from '@prisma/client';
import bidsController from '@modules/bids/bids.controller';
import { submitBidSchema, taskIdParamSchema as bidTaskIdParamSchema } from '@modules/bids/bid.validation';
import milestoneController from '@modules/milestones/milestone.controller';
import {
  createMultipleMilestonesSchema,
  taskIdParamSchema as milestoneTaskIdParamSchema,
} from '@modules/milestones/milestone.validation';
const router = Router();

router.get('/', validateRequest({ query: getTasksQuerySchema }), taskController.getTasks);
router.get('/:id', protect, validateRequest({ params: taskIdSchema }), taskController.getTaskById);

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

router.post(
  '/:taskId/bids',
  authorize(UserRole.FREELANCER),
  validateRequest({ params: bidTaskIdParamSchema, body: submitBidSchema }),
  bidsController.submitBid,
);

router.get(
  '/:taskId/bids',
  authorize(UserRole.CLIENT, UserRole.FREELANCER),
  validateRequest({ params: bidTaskIdParamSchema }),
  bidsController.getBidsForTask,
);

router.post(
  '/:taskId/milestones',
  authorize(UserRole.CLIENT),
  validateRequest({ params: milestoneTaskIdParamSchema, body: createMultipleMilestonesSchema }),
  milestoneController.createMilestones,
);

// This route will now correctly resolve to GET /api/tasks/:taskId/milestones
router.get(
  '/:taskId/milestones',
  // Accessible by both Client and the assigned Freelancer
  validateRequest({ params: milestoneTaskIdParamSchema }),
  milestoneController.getMilestonesForTask,
);

export default router;
