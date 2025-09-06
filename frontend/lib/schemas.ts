import { z } from "zod";
import { UserRole } from "./types";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.nativeEnum(UserRole, { message: "Please select a role" }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updateBidSchema = z
  .object({
    proposal: z
      .string()
      .min(50, "Proposal must be at least 50 characters.")
      .optional(),
    amount: z.number().min(1, "Amount must be at least $1.").optional(),
  })
  .refine((data) => data.proposal || data.amount, {
    message:
      "Either a new proposal or a new amount must be provided to update.",
  });

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string().min(1)).optional(),
  portfolioLinks: z.array(z.string().url()).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  });

export const attachmentSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
});

export const createTaskSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  budget: z.number().min(10).max(1000000),
  deadline: z.string().datetime(),
  categoryId: z.string(),
  attachments: z.array(attachmentSchema).optional(),
});

export const submitBidSchema = z.object({
  proposal: z.string().min(50),
  amount: z.number().min(1),
});

export const createMilestoneSchema = z.object({
  description: z.string().min(20),
  dueDate: z.string().datetime(),
  amount: z.number().min(0.01),
});

export const createMultipleMilestonesSchema = z.object({
  milestones: z.array(createMilestoneSchema),
});

export const requestRevisionSchema = z.object({
  comments: z.string().min(10).max(500),
});

export const createStripeConnectAccountSchema = z.object({
  returnUrl: z.string().url().optional(),
  refreshUrl: z.string().url().optional(),
});

export const fundTaskBodySchema = z.object({
  amount: z.number().min(0.01),
});

export const updateUserStatusSchema = z.object({
  isSuspended: z.boolean(),
});

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
