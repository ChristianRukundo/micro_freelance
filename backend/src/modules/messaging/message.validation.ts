import { z } from 'zod';

export const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
});

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(1000, 'Message cannot exceed 1000 characters'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const getMessagesQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(50)).optional(),
});

export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;
