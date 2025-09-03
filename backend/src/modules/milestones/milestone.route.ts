import { Router } from 'express';
import milestoneController from './milestone.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import {
  createMultipleMilestonesSchema,
  taskIdParamSchema,
  milestoneIdParamSchema,
  requestRevisionSchema,
} from './milestone.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(protect);

router.post(
  '/tasks/:taskId/milestones',
  authorize(UserRole.CLIENT),
  validateRequest({ params: taskIdParamSchema, body: createMultipleMilestonesSchema }),
  milestoneController.createMilestones,
);

router.get(
  '/tasks/:taskId/milestones',
  validateRequest({ params: taskIdParamSchema }),
  milestoneController.getMilestonesForTask,
);

router.patch(
  '/:milestoneId/submit',
  authorize(UserRole.FREELANCER),
  validateRequest({ params: milestoneIdParamSchema }),
  milestoneController.submitMilestone,
);

router.patch(
  '/:milestoneId/request-revision',
  authorize(UserRole.CLIENT),
  validateRequest({ params: milestoneIdParamSchema, body: requestRevisionSchema }),
  milestoneController.requestMilestoneRevision,
);

router.patch(
  '/:milestoneId/approve',
  authorize(UserRole.CLIENT),
  validateRequest({ params: milestoneIdParamSchema }),
  milestoneController.approveMilestone,
);

export default router;
