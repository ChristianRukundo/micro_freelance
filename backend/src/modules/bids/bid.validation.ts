import { z } from 'zod';

export const submitBidSchema = z.object({
  proposal: z.string().min(50, 'Proposal must be at least 50 characters long'),
  amount: z.number().min(1, 'Bid amount must be at least 1'),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;

export const bidIdSchema = z.object({
  bidId: z.string().cuid('Invalid bid ID format'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
});
