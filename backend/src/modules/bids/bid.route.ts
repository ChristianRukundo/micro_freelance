import { Router } from 'express';
import bidController from './bids.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import {  bidIdSchema, updateBidSchema } from './bid.validation';
import { UserRole } from '@prisma/client';

const router = Router();



// Client accepts a bid
router.post(
  '/bids/:bidId/accept',
  protect,
  authorize(UserRole.CLIENT),
  validateRequest({ params: bidIdSchema }),
  bidController.acceptBid,
);

router.put(
  '/:bidId',
  authorize(UserRole.FREELANCER),
  validateRequest({ params: bidIdSchema, body: updateBidSchema }),
  bidController.updateBid
);

// --- NEW: Withdraw a Bid (Freelancer only) ---
router.delete(
  '/:bidId',
  authorize(UserRole.FREELANCER),
  validateRequest({ params: bidIdSchema }),
  bidController.withdrawBid
);



export default router;
