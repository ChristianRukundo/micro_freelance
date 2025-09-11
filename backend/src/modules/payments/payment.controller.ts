import { Request, Response, NextFunction } from 'express';
import paymentService from './payment.service';
import stripe from './stripe.config';
import config from '@config/index';
import AppError from '@shared/utils/appError';
import { CreateConnectAccountInput } from './payment.validation';
import { z } from 'zod';
import Stripe from 'stripe';
import logger from '@shared/utils/logger';

const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
});

const fundTaskBodySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
});

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

class PaymentController {
  /**
   * @route POST /api/payments/stripe/connect-account
   * @desc Create or onboard a Stripe Connect account for a freelancer
   * @access Private (Freelancer)
   */
  public async createConnectAccount(
    req: Request<unknown, unknown, CreateConnectAccountInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated.', 401);
      }
      const { returnUrl, refreshUrl } = req.body;
      const accountLinkUrl = await paymentService.createStripeConnectAccount(
        req.user.id,
        req.user.email,
        returnUrl,
        refreshUrl,
      );
      return res.status(200).json({ success: true, data: { onboardingUrl: accountLinkUrl } });
    } catch (error) {
      logger.error('Error creating Stripe Connect account link', { userId: req.user?.id, error });

      return next(error);
    }
  }

  /**
   * @route GET /api/payments/stripe/account-status
   * @desc Get the onboarding status of the freelancer's Stripe Connect account
   * @access Private (Freelancer)
   */
  public async getConnectAccountStatus(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.stripeAccountId) {
        throw new AppError('Stripe account not linked for this user or user not authenticated.', 404);
      }
      const status = await paymentService.getStripeAccountStatus(req.user.stripeAccountId);
      return res.status(200).json({ success: true, data: status });
    } catch (error) {
      logger.error('Error getting Stripe Connect account status', {
        userId: req.user?.id,
        stripeAccountId: req.user?.stripeAccountId,
        error,
      });

      return next(error);
    }
  }

  /**
   * @route POST /api/payments/tasks/:taskId/create-payment-intent
   * @desc Client creates a Stripe Payment Intent to fund a task (escrow)
   * @access Private (Client)
   * @body {number} amount
   * @params {string} taskId
   */
  public async createPaymentIntent(
    req: Request<z.infer<typeof taskIdParamSchema>, unknown, z.infer<typeof fundTaskBodySchema>>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated.', 401);
      }
      const { taskId } = req.params;
      const { amount } = req.body;
      const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(amount, taskId, req.user.id);
      return res.status(201).json({ success: true, data: { clientSecret, paymentIntentId } });
    } catch (error) {
      logger.error('Error creating Payment Intent for task', {
        userId: req.user?.id,
        taskId: req.params.taskId,
        amount: req.body.amount,
        error,
      });

      return next(error);
    }
  }

  /**
   * @route POST /api/payments/webhook
   * @desc Stripe webhook endpoint for event notifications
   * @access Public (Stripe)
   * This endpoint must use the raw body, handled in app.ts for specific path.
   */
  public async stripeWebhook(req: RequestWithRawBody, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, config.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      logger.warn(`Stripe Webhook signature verification failed: ${err.message}`, { signature: sig });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await paymentService.handleWebhookEvent(event);
      return res.json({ received: true });
    } catch (error) {
      logger.error('Error processing Stripe webhook event internally', {
        eventId: event.id,
        eventType: event.type,
        error,
      });
      return res
        .status(200)
        .json({ received: true, message: 'Event processed with internal error. Check logs for details.' });
    }
  }
}

export default new PaymentController();
