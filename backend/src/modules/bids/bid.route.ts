import { Router } from 'express';
import bidController from './bids.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { submitBidSchema, taskIdParamSchema, bidIdSchema } from './bid.validation';
import { UserRole } from '@prisma/client';

const router = Router();

// Freelancer submits a bid for a task
router.post(
  '/tasks/:taskId/bids',
  protect,
  authorize(UserRole.FREELANCER),
  validateRequest({ params: taskIdParamSchema, body: submitBidSchema }),
  bidController.submitBid,
);

// Client views all bids for their task
router.get(
  '/tasks/:taskId/bids',
  protect,
  authorize(UserRole.CLIENT),
  validateRequest({ params: taskIdParamSchema }),
  bidController.getBidsForTask,
);

// Client accepts a bid
router.post(
  '/bids/:bidId/accept',
  protect,
  authorize(UserRole.CLIENT),
  validateRequest({ params: bidIdSchema }),
  bidController.acceptBid,
);

export default router;