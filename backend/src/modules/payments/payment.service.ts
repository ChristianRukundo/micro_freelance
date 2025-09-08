import stripe from './stripe.config';
import prisma from '@shared/database/prisma';
import config from '@config/index';
import AppError from '@shared/utils/appError';
import { TransactionStatus, TransactionType, MilestoneStatus, NotificationType } from '@prisma/client';
import { createNotification } from '@modules/notifications/notification.service';
import { getSocketIO } from 'socket';
import Stripe from 'stripe'; // Import Stripe namespace

class PaymentService {
  /**
   * Creates a Stripe Connect account for a freelancer and generates an onboarding link.
   * @param userId The ID of the freelancer.
   * @param email The freelancer's email.
   * @param returnUrl Optional: URL for Stripe to redirect to upon successful onboarding.
   * @param refreshUrl Optional: URL for Stripe to redirect to if onboarding needs to be refreshed.
   * @returns The Stripe account link URL.
   */
  public async createStripeConnectAccount(
    userId: string,
    email: string,
    returnUrl?: string,
    refreshUrl?: string,
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeAccountId: true, emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      throw new AppError('User not found or email not verified.', 400);
    }

    let accountId = user.stripeAccountId;

    if (!accountId) {
      // Create a new Stripe Connect account if one doesn't exist
      const account = await stripe.accounts.create({
        type: 'express', // Express accounts are ideal for platforms like this
        country: 'US', // Or dynamically set based on user's country
        email: email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual', // Or 'company' if applicable
        settings: {
          payouts: {
            schedule: { interval: 'manual' }, // Platform controls payouts
          },
        },
      });
      accountId = account.id;

      await prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId: accountId },
      });
    }

    // Generate an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${config.FRONTEND_URL}/dashboard/payouts?status=refresh`,
      return_url: returnUrl || config.STRIPE_CONNECT_RETURN_URL,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  /**
   * Retrieves the status of a Stripe Connect account.
   * @param stripeAccountId The Stripe Connect account ID.
   * @returns An object indicating if the account onboarding is completed.
   */
  public async getStripeAccountStatus(stripeAccountId: string): Promise<{ stripeAccountCompleted: boolean }> {
    try {
      const account = await stripe.accounts.retrieve(stripeAccountId);
      // Check if the account has finished onboarding and can receive payouts
      const stripeAccountCompleted = account.details_submitted && account.charges_enabled && account.payouts_enabled;
      return { stripeAccountCompleted };
    } catch (error: any) {
      console.error('Error retrieving Stripe account status:', error);
      throw new AppError('Failed to retrieve Stripe account status.', 500);
    }
  }

  /**
   * Creates a Stripe Payment Intent for a client to fund an escrow for a task.
   * @param amount The total amount to be paid (e.g., total task budget).
   * @param taskId The ID of the task.
   * @param userId The ID of the client.
   * @returns The client secret and payment intent ID.
   */
  public async createPaymentIntent(
    amount: number,
    taskId: string,
    userId: string,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, budget: true, title: true },
    });

    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    if (task.clientId !== userId) {
      throw new AppError('You are not authorized to create a payment intent for this task.', 403);
    }
    if (amount <= 0 || amount > task.budget + 0.01) {
      // Allow slight variance for floating point, or enforce exact budget
      throw new AppError('Invalid payment amount.', 400);
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: 'usd', // Or dynamically set
        automatic_payment_methods: { enabled: true },
        metadata: {
          taskId: taskId,
          clientId: userId,
          type: TransactionType.ESCROW_FUNDING, // Custom metadata for webhook processing
        },
      });

      // Optionally, record a pending transaction in your DB now
      await prisma.transaction.create({
        data: {
          userId,
          taskId,
          amount,
          type: TransactionType.ESCROW_FUNDING,
          status: TransactionStatus.PENDING,
          stripeChargeId: paymentIntent.id, // Use PaymentIntent ID as a temporary reference
        },
      });

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      console.error('Error creating Stripe Payment Intent:', error);
      throw new AppError(`Failed to create payment intent: ${error.message}`, 500);
    }
  }

  /**
   * Processes a payout to the freelancer for an approved milestone.
   * @param milestoneId The ID of the approved milestone.
   * @returns The created Stripe transfer ID.
   */
  public async processMilestonePayout(milestoneId: string): Promise<string> {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            clientId: true,
            freelancerId: true,
            freelancer: { select: { stripeAccountId: true, email: true } },
          },
        },
      },
    });

    if (!milestone) {
      throw new AppError('Milestone not found.', 404);
    }
    if (milestone.status !== MilestoneStatus.APPROVED) {
      throw new AppError('Milestone is not approved for payout.', 400);
    }
    if (!milestone.task.freelancerId || !milestone.task.freelancer?.stripeAccountId) {
      throw new AppError('Freelancer or their Stripe account not found for payout.', 400);
    }

    const payoutAmount = milestone.amount;
    const platformFee = (payoutAmount * config.PLATFORM_COMMISSION_PERCENTAGE) / 100;
    const amountToFreelancer = payoutAmount - platformFee;

    if (amountToFreelancer <= 0) {
      throw new AppError('Payout amount must be positive after platform fee.', 400);
    }

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amountToFreelancer * 100), 
        currency: 'usd',
        destination: milestone.task.freelancer.stripeAccountId,
        metadata: {
          milestoneId: milestone.id,
          taskId: milestone.task.id,
          freelancerId: milestone.task.freelancerId,
          clientId: milestone.task.clientId,
          platformFee: platformFee.toFixed(2),
        },
      });

      // Record platform fee transaction
      await prisma.transaction.create({
        data: {
          userId: milestone.task.clientId, // Client is indirectly paying the fee
          taskId: milestone.task.id,
          milestoneId: milestone.id,
          amount: platformFee,
          type: TransactionType.PLATFORM_FEE,
          status: TransactionStatus.SUCCEEDED,
          stripeTransferId: transfer.id, // Can link to the transfer that originated the fee
          platformFee: platformFee,
        },
      });

      // Record payout transaction for the freelancer
      await prisma.transaction.create({
        data: {
          userId: milestone.task.freelancerId,
          taskId: milestone.task.id,
          milestoneId: milestone.id,
          amount: amountToFreelancer,
          type: TransactionType.PAYOUT,
          status: TransactionStatus.SUCCEEDED,
          stripeTransferId: transfer.id,
        },
      });

      return transfer.id;
    } catch (error: any) {
      console.error('Error processing milestone payout:', error);
      throw new AppError(`Failed to process payout for milestone: ${error.message}`, 500);
    }
  }

  /**
   * Handles Stripe webhook events.
   * @param event The Stripe event object.
   */
  public async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const io = getSocketIO();
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const taskId = paymentIntent.metadata?.taskId;
        const clientId = paymentIntent.metadata?.clientId;

        console.log(`Payment Intent Succeeded: ${paymentIntent.id} for Task ${taskId}`);

        // Update the transaction record and potentially associated task
        await prisma.transaction.updateMany({
          where: { stripeChargeId: paymentIntent.id, status: TransactionStatus.PENDING },
          data: { status: TransactionStatus.SUCCEEDED },
        });

        // If it was escrow funding, mark task as having funds (optional, but good for tracking)
        // In a real system, you'd likely move funds to a holding account balance on your platform.
        // For simplicity, we assume PaymentIntent success implies funds are available for transfer later.

        if (clientId && taskId) {
          await createNotification(
            clientId,
            NotificationType.PAYMENT_SUCCEEDED,
            `Your payment for task "${taskId}" was successful!`,
            `/dashboard/tasks/${taskId}`,
            taskId,
          );
          if (io) {
            io.to(clientId).emit('new_notification', {
              message: `Payment successful for task "${taskId}"`,
              type: NotificationType.PAYMENT_SUCCEEDED,
              url: `/dashboard/tasks/${taskId}`,
            });
          }
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log(`Stripe Account Updated: ${account.id}`);

        const user = await prisma.user.findUnique({
          where: { stripeAccountId: account.id },
          select: { id: true, email: true, profile: { select: { firstName: true } }, stripeAccountCompleted: true },
        });

        if (user) {
          const newStripeAccountCompleted =
            account.details_submitted && account.charges_enabled && account.payouts_enabled;

          if (user.stripeAccountCompleted !== newStripeAccountCompleted) {
            await prisma.user.update({
              where: { id: user.id },
              data: { stripeAccountCompleted: newStripeAccountCompleted },
            });

            if (newStripeAccountCompleted) {
              await createNotification(
                user.id,
                NotificationType.STRIPE_ACCOUNT_UPDATED,
                `Your Stripe Connect account onboarding is complete! You can now receive payouts.`,
                `/dashboard/payouts`,
              );
              if (io) {
                io.to(user.id).emit('new_notification', {
                  message: `Stripe account onboarding complete!`,
                  type: NotificationType.STRIPE_ACCOUNT_UPDATED,
                  url: `/dashboard/payouts`,
                });
              }
            }
          }
        }
        break;
      }
      // Handle other relevant Stripe events (e.g., payout.succeeded, charge.refunded)
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}

export default new PaymentService();
