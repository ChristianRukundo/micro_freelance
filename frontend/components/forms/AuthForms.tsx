"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/zustand";

import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schemas";
import { UserRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EyeIcon, EyeOffIcon, RefreshCcwIcon } from "lucide-react";
import React, { useState } from "react";
import { Input } from "../ui/input";
import api from "@/lib/api";

// Schemas imported from non-server module

type LoginFormInput = z.infer<typeof loginSchema>;
type RegisterFormInput = z.infer<typeof registerSchema>;
type VerifyEmailFormInput = z.infer<typeof verifyEmailSchema>;
type ForgotPasswordFormInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;

interface AuthFormsProps {
  formType:
    | "login"
    | "register"
    | "verify-email"
    | "forgot-password"
    | "reset-password";
  initialEmail?: string; // For pre-filling email in verify/reset forms
}

export function AuthForms({ formType, initialEmail }: AuthFormsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { login: authStoreLogin } = useAuthStore();

  // Determine form schema based on type
  let formSchema: z.ZodSchema<any>;
  let defaultValues: any = { email: initialEmail || "" };

  switch (formType) {
    case "login":
      formSchema = loginSchema;
      defaultValues = { email: initialEmail || "", password: "" };
      break;
    case "register":
      formSchema = registerSchema;
      defaultValues = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: UserRole.CLIENT,
      };
      break;
    case "verify-email":
      formSchema = verifyEmailSchema;
      defaultValues = { email: initialEmail || "", otp: "" };
      break;
    case "forgot-password":
      formSchema = forgotPasswordSchema;
      defaultValues = { email: initialEmail || "" };
      break;
    case "reset-password":
      formSchema = resetPasswordSchema;
      defaultValues = {
        email: initialEmail || "",
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      };
      break;
    default:
      throw new Error("Invalid form type");
  }

  type FormInput = z.infer<typeof formSchema>;

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // --- Mutations ---
  const { mutate: submitLogin, isPending: isLoginPending } = useMutation({
    mutationFn: async (data: LoginFormInput) => {
      const res = await (
        await import("@/lib/api")
      ).default.post("/auth/login", data);
      return {
        success: true,
        message: "Logged in successfully!",
        data: res.data.data,
      } as const;
    },
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        authStoreLogin(response.data.user);
        toast.success(response.message || "Logged in successfully!");
        switch (response.data.user.role) {
          case UserRole.CLIENT:
            router.push("/dashboard/client");
            break;
          case UserRole.FREELANCER:
            router.push("/dashboard/freelancer");
            break;
          case UserRole.ADMIN:
            router.push("/admin/users");
            break;
          default:
            router.push("/dashboard");
            break;
        }
      } else {
        toast.error(response.message || "Login failed.");
      }
    },
    onError: (error: any) => {
      // Error is handled by the axios interceptor
    },
  });

  const { mutate: submitRegister, isPending: isRegisterPending } = useMutation({
    mutationFn: async (data: RegisterFormInput) => {
      const res = await api.post("/auth/register", data);
      return {
        success: true,
        message: "Registration successful. Please verify your email.",
        data: res.data.data,
      } as const;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Registration successful. Please verify your email.");
        router.push(`/verify-email?email=${form.getValues("email")}`);
      } else {
        toast.error(response.message || "Registration failed.");
      }
    },
    onError: (error: any) => {
      // Error is handled by the axios interceptor
    },
  });
  
  // --- VERIFY EMAIL ---
  const { mutate: submitVerifyEmail, isPending: isVerifyEmailPending } =
    useMutation({
      mutationFn: async (data: VerifyEmailFormInput) => {
        await api.post("/auth/verify-email", data);
        return {
          success: true,
          message: "Email verified successfully!",
        } as const;
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message || "Email verified successfully!");
          router.push("/login");
        } else {
          toast.error(response.message || "Email verification failed.");
        }
      },
      onError: (error: any) => {
        // Error is handled by the axios interceptor
      },
    });

  // --- RESEND OTP ---
  const { mutate: submitResendOtp, isPending: isResendOtpPending } =
    useMutation({
      mutationFn: async (email: string) => {
        await api.post("/auth/resend-verification-email", { email });
        return {
          success: true,
          message: "New verification OTP sent to your email.",
        } as const;
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message || "New verification OTP sent to your email.");
        } else {
          toast.error(response.message || "Failed to resend OTP.");
        }
      },
      onError: (error: any) => {
        // Error is handled by the axios interceptor
      },
    });

  // --- FORGOT PASSWORD ---
  const { mutate: submitForgotPassword, isPending: isForgotPasswordPending } =
    useMutation({
      mutationFn: async (data: ForgotPasswordFormInput) => {
        await api.post("/auth/forgot-password", data);
        return {
          success: true,
          message:
            "If an account with that email exists, a password reset OTP has been sent.",
        } as const;
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message || "If an account with that email exists, a password reset OTP has been sent.");
          router.push(`/reset-password?email=${form.getValues("email")}`);
        } else {
          toast.error(response.message || "Password reset request failed.");
        }
      },
      onError: (error: any) => {
        // Error is handled by the axios interceptor
      },
    });

  // --- RESET PASSWORD ---
  const { mutate: submitResetPassword, isPending: isResetPasswordPending } =
    useMutation({
      mutationFn: async (data: ResetPasswordFormInput) => {
        await api.post("/auth/reset-password", data);
        return {
          success: true,
          message: "Password has been reset successfully!",
        } as const;
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message);
          router.push("/login");
        } else {
          toast.error(response.message || "Password reset failed.");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Password reset failed.");
      },
    });

  const onSubmit = (values: FormInput) => {
    switch (formType) {
      case "login":
        submitLogin(values as LoginFormInput);
        break;
      case "register":
        submitRegister(values as RegisterFormInput);
        break;
      case "verify-email":
        submitVerifyEmail(values as VerifyEmailFormInput);
        break;
      case "forgot-password":
        submitForgotPassword(values as ForgotPasswordFormInput);
        break;
      case "reset-password":
        submitResetPassword(values as ResetPasswordFormInput);
        break;
      default:
        break;
    }
  };

  const isPending =
    isLoginPending ||
    isRegisterPending ||
    isVerifyEmailPending ||
    isForgotPasswordPending ||
    isResetPasswordPending ||
    isResendOtpPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {formType === "register" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
        {formType !== "reset-password" && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    disabled={isPending || formType === "verify-email"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(formType === "login" ||
          formType === "register" ||
          formType === "reset-password") && (
          <FormField
            control={form.control}
            name={formType === "reset-password" ? "newPassword" : "password"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {formType === "reset-password" ? "New Password" : "Password"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      className="pr-10" // Add padding to make space for the icon
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(formType === "verify-email" || formType === "reset-password") && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OTP (One-Time Password)</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {formType === "reset-password" && (
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      disabled={isPending}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {formType === "register" && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am a...</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UserRole.CLIENT}>
                      Client (Hire Freelancers)
                    </SelectItem>
                    <SelectItem value={UserRole.FREELANCER}>
                      Freelancer (Find Work)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          className="w-full text-body-md shadow-primary dark:shadow-primary-dark group cursor-pointer"
          aria-busy={isPending}
          aria-live="polite"
          disabled={isPending}
        >
          {isPending && (
            <LoadingSpinner
              size="sm"
              color="text-primary-foreground"
              className="mr-2"
            />
          )}
          {formType === "login" && "Log In"}
          {formType === "register" && "Create Account"}
          {formType === "verify-email" && "Verify Email"}
          {formType === "forgot-password" && "Send Reset OTP"}
          {formType === "reset-password" && "Reset Password"}
        </Button>

        {formType === "verify-email" && (
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 text-body-md"
            onClick={() => submitResendOtp(form.getValues("email") as string)}
            disabled={isResendOtpPending || isPending}
          >
            {isResendOtpPending && (
              <LoadingSpinner size="sm" className="mr-2" />
            )}
            <RefreshCcwIcon className="mr-2 h-4 w-4" /> Resend OTP
          </Button>
        )}
      </form>
    </Form>
  );
}

// Helper to convert form data to FormData for server actions
function convertToFormData(data: any): FormData {
  const formData = new FormData();
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      formData.append(key, data[key]);
    }
  }
  return formData;
}
