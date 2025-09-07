import { Router } from 'express';
import milestoneController from './milestone.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import {
  milestoneIdParamSchema,
  requestRevisionSchema,
  submitMilestoneSchema,
  attachmentIdParamSchema, // ADDED
  addAttachmentCommentSchema, // ADDED
} from './milestone.validation';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(protect);

router.patch(
  '/:milestoneId/submit',
  authorize(UserRole.FREELANCER),
  validateRequest({ params: milestoneIdParamSchema, body: submitMilestoneSchema }),
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

// ADDED: New route for commenting on an attachment
router.patch(
  '/attachments/:attachmentId/comment',
  authorize(UserRole.CLIENT),
  validateRequest({ params: attachmentIdParamSchema, body: addAttachmentCommentSchema }),
  milestoneController.addCommentToAttachment,
);

export default router;
