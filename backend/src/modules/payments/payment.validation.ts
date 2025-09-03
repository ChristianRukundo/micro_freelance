import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const stripeWebhookSchema = z.object({
  // Stripe webhook payload varies widely, typically we just ensure it's a JSON object
  // and validate the signature separately. No strict Zod schema for the entire payload here.
});

// For Stripe Connect onboarding, a return_url might be passed in body if dynamic
export const createConnectAccountSchema = z.object({
  returnUrl: z.string().url('Return URL must be a valid URL').optional(), // If client wants to override config
  refreshUrl: z.string().url('Refresh URL must be a valid URL').optional(), // If client wants to override config
});
export type CreateConnectAccountInput = z.infer<typeof createConnectAccountSchema>;
