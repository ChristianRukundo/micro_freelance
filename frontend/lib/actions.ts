'use server';

import api from './api';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toast } from 'sonner'; // Use server-side toast if `sonner` supports it, or pass message back to client component
import { UserRole, TaskStatus, MilestoneStatus } from './types';
import { cookies } from 'next/headers';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { StripeCustomerData } from './types';
// --- Auth Schemas (mirroring backend validation) ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.nativeEnum(UserRole, { message: 'Please select a role' }),
});

const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

// --- User Profile Schemas ---
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty').optional(),
  avatarUrl: z.string().url('Avatar URL must be a valid URL').nullable().optional(),
  bio: z.string().nullable().optional(),
  skills: z.array(z.string().min(1)).optional(),
  portfolioLinks: z.array(z.string().url('Portfolio links must be valid URLs')).optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

// --- Task Schemas ---
const attachmentSchema = z.object({
  url: z.string().url('Attachment URL must be a valid URL'),
  fileName: z.string().min(1, 'Attachment file name is required'),
  fileType: z.string().min(1, 'Attachment file type is required'),
});

const createTaskSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  budget: z.number().min(10, 'Budget must be at least $10').max(1000000, 'Budget cannot exceed $1,000,000'),
  deadline: z.string().datetime('Deadline must be a valid date-time string'),
  categoryId: z.string().cuid('Please select a valid category.'),
  attachments: z.array(attachmentSchema).optional(),
});

// --- Bid Schemas ---
const submitBidSchema = z.object({
  proposal: z.string().min(50, 'Proposal must be at least 50 characters long'),
  amount: z.number().min(1, 'Bid amount must be at least 1'),
});

// --- Milestone Schemas ---
const createMilestoneSchema = z.object({
  description: z.string().min(20, 'Milestone description is required and must be at least 20 characters'),
  dueDate: z.string().datetime('Due date must be a valid date-time string'),
  amount: z.number().min(0.01, 'Milestone amount must be positive'),
});
const createMultipleMilestonesSchema = z.array(createMilestoneSchema);

const requestRevisionSchema = z.object({
  comments: z.string().min(10, 'Revision comments are required and must be at least 10 characters').max(500, 'Comments cannot exceed 500 characters'),
});

// --- Payment Schemas ---
const createStripeConnectAccountSchema = z.object({
  returnUrl: z.string().url('Return URL must be a valid URL').optional(),
  refreshUrl: z.string().url('Refresh URL must be a valid URL').optional(),
});

const fundTaskBodySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
});

// --- Admin Schemas ---
const updateUserStatusSchema = z.object({
  isSuspended: z.boolean('isSuspended must be a boolean'),
  role: z.nativeEnum(UserRole, {
    invalid_type_error: 'Invalid user role specified',
  }).optional(),
});


// --- Server Actions Implementations ---

interface ServerActionResponse<T> {
  success: boolean;
  message?: string;
  errors?: { path: string; message: string }[];
  data?: T;
}

const handleServerActionError = (error: any): ServerActionResponse<any> => {
  if (isRedirectError(error)) {
    throw error; // Re-throw Next.js redirects
  }

  const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
  const statusCode = error.response?.status || 500;

  // Attempt to parse validation errors from backend
  try {
    const errorDetails = JSON.parse(errorMessage);
    if (Array.isArray(errorDetails)) {
      return { success: false, errors: errorDetails, message: 'Validation failed.' };
    }
  } catch (e) {
    // Not a JSON error, proceed with general message
  }

  return { success: false, message: `Error (${statusCode}): ${errorMessage}` };
};

// --- AUTH ACTIONS ---
export async function loginAction(formData: FormData): Promise<ServerActionResponse<{ user: any }>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = loginSchema.parse(data);
    const response = await api.post('/auth/login', validatedData);
    revalidatePath('/dashboard'); // Revalidate paths after login
    return { success: true, message: 'Logged in successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function registerAction(formData: FormData): Promise<ServerActionResponse<{ userId: string; email: string }>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.parse(data);
    const response = await api.post('/auth/register', validatedData);
    return { success: true, message: 'Registration successful. Please check your email to verify your account.', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function verifyEmailAction(formData: FormData): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = verifyEmailSchema.parse(data);
    await api.post('/auth/verify-email', validatedData);
    return { success: true, message: 'Email verified successfully!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function resendVerificationEmailAction(formData: FormData): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const email = z.object({ email: z.string().email() }).parse(data).email;
    await api.post('/auth/resend-verification-email', { email });
    return { success: true, message: 'New verification OTP sent to your email.' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = forgotPasswordSchema.parse(data);
    await api.post('/auth/forgot-password', validatedData);
    return { success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function resetPasswordAction(formData: FormData): Promise<ServerActionResponse<void>> {
  try {
    const data = Object.fromEntries(formData.entries());
    const validatedData = resetPasswordSchema.parse(data);
    await api.post('/auth/reset-password', validatedData);
    return { success: true, message: 'Password has been reset successfully.' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- USER PROFILE ACTIONS ---
export async function updateProfileInfoAction(userId: string, values: z.infer<typeof updateProfileSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = updateProfileSchema.parse(values);
    const response = await api.put('/users/me', validatedData);
    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Profile updated successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function changePasswordAction(userId: string, values: z.infer<typeof changePasswordSchema>): Promise<ServerActionResponse<void>> {
  try {
    const validatedData = changePasswordSchema.parse(values);
    await api.patch('/users/me/change-password', validatedData);
    return { success: true, message: 'Password changed successfully!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- TASK ACTIONS ---
export async function createTaskAction(values: z.infer<typeof createTaskSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createTaskSchema.parse(values);
    const response = await api.post('/tasks', validatedData);
    revalidatePath('/tasks'); // Revalidate task list
    revalidatePath('/dashboard/client'); // Client dashboard might show their tasks
    return { success: true, message: 'Task created successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function updateTaskAction(taskId: string, values: Partial<z.infer<typeof createTaskSchema>>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createTaskSchema.partial().parse(values); // Use partial for updates
    const response = await api.put(`/tasks/${taskId}`, validatedData);
    revalidatePath(`/tasks/${taskId}`); // Revalidate specific task page
    revalidatePath('/dashboard/client');
    return { success: true, message: 'Task updated successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function deleteTaskAction(taskId: string): Promise<ServerActionResponse<void>> {
  try {
    await api.delete(`/tasks/${taskId}`);
    revalidatePath('/tasks');
    revalidatePath('/dashboard/client');
    return { success: true, message: 'Task deleted successfully!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function cancelTaskAction(taskId: string): Promise<ServerActionResponse<void>> {
  try {
    await api.patch(`/tasks/${taskId}/cancel`);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/freelancer');
    return { success: true, message: 'Task cancelled successfully!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function completeTaskAction(taskId: string): Promise<ServerActionResponse<void>> {
  try {
    await api.patch(`/tasks/${taskId}/complete`);
    revalidatePath(`/tasks/${taskId}`);
    revalidatePath('/dashboard/client');
    revalidatePath('/dashboard/freelancer'); // Freelancer might see task status change
    return { success: true, message: 'Task marked as completed!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}


// --- BID ACTIONS ---
export async function submitBidAction(taskId: string, values: z.infer<typeof submitBidSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = submitBidSchema.parse(values);
    const response = await api.post(`/tasks/${taskId}/bids`, validatedData);
    revalidatePath(`/tasks/${taskId}`); // Revalidate task bids section
    return { success: true, message: 'Bid submitted successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function acceptBidAction(bidId: string): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.post(`/bids/${bidId}/accept`);
    revalidatePath('/tasks'); // Task status might change
    revalidatePath('/dashboard/client'); // Client's tasks list
    revalidatePath('/dashboard/freelancer'); // Freelancer's accepted tasks
    revalidatePath(`/tasks/${response.data.data.taskId}`); // Task details page
    return { success: true, message: 'Bid accepted successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- MILESTONE ACTIONS ---
export async function createMilestonesAction(taskId: string, values: z.infer<typeof createMultipleMilestonesSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = createMultipleMilestonesSchema.parse(values);
    const response = await api.post(`/tasks/${taskId}/milestones`, validatedData);
    revalidatePath(`/dashboard/projects/${taskId}`);
    revalidatePath(`/tasks/${taskId}`);
    return { success: true, message: 'Milestones created successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function submitMilestoneAction(milestoneId: string): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.patch(`/milestones/${milestoneId}/submit`);
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return { success: true, message: 'Milestone submitted for review!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function requestMilestoneRevisionAction(milestoneId: string, values: z.infer<typeof requestRevisionSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = requestRevisionSchema.parse(values);
    const response = await api.patch(`/milestones/${milestoneId}/request-revision`, validatedData);
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return { success: true, message: 'Revision requested for milestone!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function approveMilestoneAction(milestoneId: string): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.patch(`/milestones/${milestoneId}/approve`);
    revalidatePath(`/dashboard/projects/${response.data.data.taskId}`);
    revalidatePath(`/tasks/${response.data.data.taskId}`);
    return { success: true, message: 'Milestone approved and payment released!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}


// --- PAYMENT ACTIONS ---
export async function createStripeConnectAccountAction(values: z.infer<typeof createStripeConnectAccountSchema>): Promise<ServerActionResponse<StripeCustomerData>> {
  try {
    const validatedData = createStripeConnectAccountSchema.parse(values);
    const response = await api.post('/payments/stripe/connect-account', validatedData);
    revalidatePath('/dashboard/payouts');
    return { success: true, message: 'Stripe onboarding link created!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}
export async function createPaymentIntentAction(taskId: string, values: z.infer<typeof fundTaskBodySchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = fundTaskBodySchema.parse(values);
    const response = await api.post(`/payments/tasks/${taskId}/create-payment-intent`, validatedData);
    revalidatePath(`/tasks/${taskId}`); // Update task if funding status is shown
    return { success: true, message: 'Payment intent created!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- ADMIN ACTIONS ---
export async function adminUpdateUserStatusAction(userId: string, values: z.infer<typeof updateUserStatusSchema>): Promise<ServerActionResponse<any>> {
  try {
    const validatedData = updateUserStatusSchema.parse(values);
    const response = await api.patch(`/admin/users/${userId}/status`, validatedData);
    revalidatePath('/admin/users');
    // Revalidate user's dashboard or profile if user is self
    return { success: true, message: 'User status updated successfully!', data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

export async function adminDeleteUserAction(userId: string): Promise<ServerActionResponse<void>> {
  try {
    await api.delete(`/admin/users/${userId}`);
    revalidatePath('/admin/users');
    return { success: true, message: 'User deleted successfully!' };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// --- Other Handlers ---
export async function getCategoriesAction(): Promise<ServerActionResponse<any>> {
  try {
    const response = await api.get('/categories');
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return handleServerActionError(error);
  }
}

// Re-export schemas for client-side validation
export {
  loginSchema, registerSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema,
  updateProfileSchema, changePasswordSchema, createTaskSchema, submitBidSchema,
  createMilestoneSchema, createMultipleMilestonesSchema, requestRevisionSchema,
  createStripeConnectAccountSchema, fundTaskBodySchema,
  updateUserStatusSchema,
};