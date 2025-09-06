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

export const updateBidSchema = z.object({
  proposal: z.string().min(50, 'Proposal must be at least 50 characters.').optional(),
  amount: z.number().min(1, 'Amount must be at least $1.').optional(),
}).refine(data => data.proposal || data.amount, {
  message: 'Either a new proposal or a new amount must be provided to update.',
});
 
