import { Router } from 'express';
import express from 'express';
import paymentController from './payment.controller';
import { protect, authorize } from '@shared/middleware/auth.middleware';
import { validateRequest } from '@shared/middleware/validateRequest';
import { UserRole } from '@prisma/client';
import { createConnectAccountSchema } from './payment.validation';
import { z } from 'zod';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook as any);

router.use(protect);

router.post(
  '/stripe/connect-account',
  authorize(UserRole.FREELANCER),
  validateRequest({ body: createConnectAccountSchema }),
  paymentController.createConnectAccount,
);

router.get('/stripe/account-status', authorize(UserRole.FREELANCER), paymentController.getConnectAccountStatus);

const fundTaskBodySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
});
const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
});

router.post(
  '/tasks/:taskId/create-payment-intent',
  authorize(UserRole.CLIENT),
  validateRequest({ params: taskIdParamSchema, body: fundTaskBodySchema }),
  paymentController.createPaymentIntent,
);

export default router;
