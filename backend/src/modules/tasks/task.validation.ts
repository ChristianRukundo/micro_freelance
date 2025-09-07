import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const attachmentSchema = z.object({
  url: z.string().url('Attachment URL must be a valid URL'),
  fileName: z.string().min(1, 'Attachment file name is required'),
  fileType: z.string().min(1, 'Attachment file type is required'),
});

export const createTaskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters long'),
  skills: z.array(z.string().min(1)).optional(),
  budget: z.number().min(10, 'Budget must be at least 10').max(1000000, 'Budget cannot exceed 1,000,000'),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Deadline must be a valid date-time string',
    })
    .optional(),
  categoryId: z.cuid('Invalid category ID'),
  attachments: z.array(attachmentSchema).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z.string().min(20, 'Description must be at least 20 characters long').optional(),
  skills: z.array(z.string().min(1)).optional(),
  budget: z.number().min(10, 'Budget must be at least 10').max(1_000_000, 'Budget cannot exceed 1,000,000').optional(),
  deadline: z
    .string()
    .pipe(z.coerce.date({ error: 'Deadline must be a valid date-time string' }))
    .optional(),
  categoryId: z.string().cuid('Invalid category ID').optional(),
  status: z
    .enum(Object.values(TaskStatus) as [string, ...string[]], {
      error: 'Invalid task status specified',
    })
    .optional(),
  attachments: z.array(attachmentSchema).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const getTasksQuerySchema = z.object({
  page: z.preprocess(Number, z.number().int().positive().default(1)).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(100).default(10)).optional(),
  categoryId: z.cuid('Invalid category ID').optional(),
  minBudget: z.preprocess(Number, z.number().min(0)).optional(),
  maxBudget: z.preprocess(Number, z.number().min(0)).optional(),
  status: z
    .enum(Object.values(TaskStatus) as [string, ...string[]], {
      error: 'Invalid task status specified',
    })
    .optional(),
  q: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'budget', 'deadline'], {
      error: 'Invalid sortBy field',
    })
    .default('createdAt')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type GetTasksQueryInput = z.infer<typeof getTasksQuerySchema>;

export const taskIdSchema = z.object({
  id: z.string().cuid("Invalid task ID format"),
});

export type TaskIdInput = z.infer<typeof taskIdSchema>;