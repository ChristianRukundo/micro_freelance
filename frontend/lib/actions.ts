"use server";

import api from "./api";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  UserRole,
  TaskStatus,
  StripeCustomerData,
  Task as TaskType,
  User as UserType,
} from "./types";
import { cookies } from "next/headers";
import { toast } from "sonner"; // Server actions can't directly use client-side toast
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

// --- AUTH ACTIONS ---
export async function loginAction(
  formData: FormData
): Promise<ServerActionResponse<{ user: any }>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = loginSchema.parse(data);
    const response = await api.post("/auth/login", validatedData);
    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Logged in successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function registerAction(
  formData: FormData
): Promise<ServerActionResponse<{ userId: string; email: string }>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.parse(data);
    const response = await api.post("/auth/register", validatedData);
    return {
      success: true,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function verifyEmailAction(
  formData: FormData
): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = verifyEmailSchema.parse(data);
    await api.post("/auth/verify-email", validatedData);
    return { success: true, message: "Email verified successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function resendVerificationEmailAction(
  formData: FormData
): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const email = z.object({ email: z.string().email() }).parse(data).email;
    await api.post("/auth/resend-verification-email", { email });
    return {
      success: true,
      message: "New verification OTP sent to your email.",
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function forgotPasswordAction(
  formData: FormData
): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = forgotPasswordSchema.parse(data);
    await api.post("/auth/forgot-password", validatedData);
    return {
      success: true,
      message:
        "If an account with that email exists, a password reset OTP has been sent.",
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function resetPasswordAction(
  formData: FormData
): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = resetPasswordSchema.parse(data);
    await api.post("/auth/reset-password", validatedData);
    return { success: true, message: "Password has been reset successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- USER PROFILE ACTIONS ---
export async function updateProfileInfoAction(
  userId: string,
  values: z.infer<typeof updateProfileSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = updateProfileSchema.parse(values);
    const response = await api.put("/users/me", validatedData);
    revalidatePath("/dashboard/profile");
    return {
      success: true,
      message: "Profile updated successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function changePasswordAction(
  userId: string,
  values: z.infer<typeof changePasswordSchema>
): Promise<ServerActionResponse<void>> {
  try {
    const validatedData = changePasswordSchema.parse(values);
    await api.patch("/users/me/change-password", validatedData);
    return { success: true, message: "Password changed successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- TASK ACTIONS ---
export async function createTaskAction(
  values: z.infer<typeof createTaskSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createTaskSchema.parse(values);
    const response = await api.post("/tasks", validatedData);
    revalidatePath("/tasks");
    revalidatePath("/dashboard/client");
    return {
      success: true,
      message: "Task created successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function updateTaskAction(
  taskId: string,
  values: Partial<z.infer<typeof createTaskSchema>>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createTaskSchema.partial().parse(values);
    const response = await api.put(`/tasks/${taskId}`, validatedData);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard/client");
    return {
      success: true,
      message: "Task updated successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function deleteTaskAction(
  taskId: string
): Promise<ServerActionResponse<void>> {
  try {
    await api.delete(`/tasks/${taskId}`);
    revalidatePath("/tasks");
    revalidatePath("/dashboard/client");
    return { success: true, message: "Task deleted successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function cancelTaskAction(
  taskId: string
): Promise<ServerActionResponse<void>> {
  try {
    await api.patch(`/tasks/${taskId}/cancel`);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/freelancer");
    return { success: true, message: "Task cancelled successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function completeTaskAction(
  taskId: string
): Promise<ServerActionResponse<void>> {
  try {
    await api.patch(`/tasks/${taskId}/complete`);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/freelancer");
    return { success: true, message: "Task marked as completed!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- BID ACTIONS ---
export async function submitBidAction(
  taskId: string,
  values: z.infer<typeof submitBidSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = submitBidSchema.parse(values);
    const response = await api.post(`/tasks/${taskId}/bids`, validatedData);
    revalidatePath(`/tasks/${taskId}`);
    return {
      success: true,
      message: "Bid submitted successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function acceptBidAction(
  bidId: string
): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.post(`/bids/${bidId}/accept`);
    revalidatePath("/tasks");
    revalidatePath("/dashboard/client");
    revalidatePath("/dashboard/freelancer");
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return {
      success: true,
      message: "Bid accepted successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- MILESTONE ACTIONS ---
export async function createMilestonesAction(
  taskId: string,
  values: z.infer<typeof createMultipleMilestonesSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createMultipleMilestonesSchema.parse(values);
    const response = await api.post(
      `/tasks/${taskId}/milestones`,
      validatedData
    );
    revalidatePath(`/dashboard/projects/${taskId}`);
    revalidatePath(`/tasks/${taskId}`);
    return {
      success: true,
      message: "Milestones created successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function submitMilestoneAction(
  milestoneId: string,
  values?: any
): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.patch(`/milestones/${milestoneId}/submit`);
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return {
      success: true,
      message: "Milestone submitted for review!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function requestMilestoneRevisionAction(
  milestoneId: string,
  values: z.infer<typeof requestRevisionSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = requestRevisionSchema.parse(values);
    const response = await api.patch(
      `/milestones/${milestoneId}/request-revision`,
      validatedData
    );
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return {
      success: true,
      message: "Revision requested for milestone!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function approveMilestoneAction(
  milestoneId: string
): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.patch(`/milestones/${milestoneId}/approve`);
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return {
      success: true,
      message: "Milestone approved and payment released!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- PAYMENT ACTIONS ---
export async function createStripeConnectAccountAction(
  values: z.infer<typeof createStripeConnectAccountSchema>
): Promise<ServerActionResponse<StripeCustomerData>> {
  try {
    const validatedData = createStripeConnectAccountSchema.parse(values);
    const response = await api.post(
      "/payments/stripe/connect-account",
      validatedData
    );
    revalidatePath("/dashboard/payouts");
    return {
      success: true,
      message: "Stripe onboarding link created!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function createPaymentIntentAction(
  taskId: string,
  values: z.infer<typeof fundTaskBodySchema>
): Promise<ServerActionResponse<StripeCustomerData>> {
  try {
    const validatedData = fundTaskBodySchema.parse(values);
    const response = await api.post(
      `/payments/tasks/${taskId}/create-payment-intent`,
      validatedData
    );
    revalidatePath(`/tasks/${taskId}`);
    return {
      success: true,
      message: "Payment intent created!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- ADMIN ACTIONS ---
export async function adminUpdateUserStatusAction(
  userId: string,
  values: z.infer<typeof updateUserStatusSchema>
): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = updateUserStatusSchema.parse(values);
    const response = await api.patch(
      `/admin/users/${userId}/status`,
      validatedData
    );
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User status updated successfully!",
      data: response.data.data,
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function adminDeleteUserAction(
  userId: string
): Promise<ServerActionResponse<void>> {
  try {
    await api.delete(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully!" };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- HOMEPAGE ACTIONS (Server-side data fetching) ---

// Server Action to fetch popular tasks for the homepage
export async function fetchPopularTasks(): Promise<
  ServerActionResponse<TaskType[]>
> {
  try {
    // Fetch top 3-6 tasks, e.g., with most bids or recent activity
    const response = await api.get("/tasks", {
      params: {
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
        status: TaskStatus.OPEN,
      },
    });
    console.log(response.data);
    return { success: true, data: response.data.data.tasks };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// Server Action to fetch top freelancers for the homepage
export async function fetchTopFreelancers(): Promise<
  ServerActionResponse<UserType[]>
> {
  try {
    // Fetch top 3-6 freelancers from the public users endpoint
    const response = await api.get("/users", {
      params: {
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
        role: UserRole.FREELANCER,
      },
    });
    return { success: true, data: response.data.data.users };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// Server Action for Newsletter subscription
export async function newsletterSubscribeAction(
  formData: FormData
): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = newsletterSchema.parse(data);

    // Simulate API call to a newsletter service or your backend
    logger.info("Newsletter subscription attempt:", validatedData);
    // await api.post('/newsletter/subscribe', validatedData); // Placeholder backend endpoint
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    return {
      success: true,
      message: "Thanks for subscribing to our newsletter!",
    };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// Server Action to fetch categories
export async function getCategoriesAction(): Promise<
  ServerActionResponse<any[]>
> {
  try {
    const response = await api.get("/categories");
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// Re-export schemas for client-side validation
// Do not re-export non-function values from a server file to satisfy Next.js rules
