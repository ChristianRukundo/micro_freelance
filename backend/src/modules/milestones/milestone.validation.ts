import { z } from 'zod';
import { MilestoneStatus } from '@prisma/client';
import { attachmentSchema } from '@modules/tasks/task.validation';

export const createMilestoneSchema = z.object({
  description: z.string().min(20, 'Milestone description is required and must be at least 20 characters'),
  dueDate: z.string().datetime('Due date must be a valid date-time string'),
  amount: z.number().min(0.01, 'Milestone amount must be positive'),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export const createMultipleMilestonesSchema = z.object({
  milestones: z.array(createMilestoneSchema),
});

export type CreateMultipleMilestonesInput = z.infer<typeof createMultipleMilestonesSchema>;

export const submitMilestoneSchema = z.object({
  attachments: z.array(attachmentSchema).min(1, 'At least one attachment is required for submission.'),
  submissionNotes: z.string().max(2000, 'Submission notes cannot exceed 2000 characters.').optional(),
});
export type SubmitMilestoneInput = z.infer<typeof submitMilestoneSchema>;

export const updateMilestoneSchema = z.object({
  description: z.string().min(20, 'Milestone description is required and must be at least 20 characters').optional(),
  dueDate: z.string().datetime('Due date must be a valid date-time string').optional(),
  amount: z.number().min(0.01, 'Milestone amount must be positive').optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
  revisionNotes: z.string().optional().nullable(),
});

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().cuid('Invalid milestone ID format'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID format'),
});

export const requestRevisionSchema = z.object({
  comments: z
    .string()
    .min(10, 'Revision comments are required and must be at least 10 characters')
    .max(500, 'Comments cannot exceed 500 characters'),
});

export type RequestRevisionInput = z.infer<typeof requestRevisionSchema>;

export const attachmentIdParamSchema = z.object({
  attachmentId: z.string().cuid('Invalid attachment ID format'),
});

export const addAttachmentCommentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters'),
});
