"use server";

import { getApiWithAuth } from "./api-server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  UserRole,
  TaskStatus,
  StripeCustomerData,
  Task as TaskType,
  User as UserType,
  TaskStats,
  ClientDashboardStats,
  FreelancerDashboardStats,
} from "./types";
import { logger } from "./utils";
import { isRedirectError } from "next/dist/client/components/redirect-error";
// Import schemas from a non-server module to avoid exporting objects from a "use server" file
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  createTaskSchema,
  submitBidSchema,
  createMilestoneSchema,
  createMultipleMilestonesSchema,
  requestRevisionSchema,
  createStripeConnectAccountSchema,
  fundTaskBodySchema,
  updateUserStatusSchema,
  newsletterSchema,
  updateBidSchema,
  addAttachmentCommentSchema,
  submitMilestoneSchema,
} from "./schemas";

// --- Server Actions Implementations ---

interface ServerActionResponse<T> {
  success: boolean;
  message?: string;
  errors?: { path: string; message: string }[];
  data?: T;
}

const handleServerActionError = (error: any): ServerActionResponse<any> => {
  if (isRedirectError(error)) {
    throw error;
  }

  // Use server-side logger for errors
  logger.error("Server Action Error:", {
    message: error.message,
    statusCode: error.response?.status,
    details: error.response?.data,
    stack: error.stack,
  });

  const errorMessage =
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred.";
  const statusCode = error.response?.status || 500;

  try {
    const errorDetails = JSON.parse(errorMessage);
    if (Array.isArray(errorDetails)) {
      return {
        success: false,
        errors: errorDetails,
        message: "Validation failed.",
      };
    }
  } catch (e) {
    // Not a JSON error
  }

  return { success: false, message: `Error (${statusCode}): ${errorMessage}` };
};

// Re-export schemas for client-side validation
// Do not re-export non-function values from a server file to satisfy Next.js rules
export { loginSchema, registerSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema, createTaskSchema, submitBidSchema, createMilestoneSchema, createMultipleMilestonesSchema, requestRevisionSchema, createStripeConnectAccountSchema, fundTaskBodySchema, updateUserStatusSchema, newsletterSchema, updateBidSchema, addAttachmentCommentSchema, submitMilestoneSchema };
