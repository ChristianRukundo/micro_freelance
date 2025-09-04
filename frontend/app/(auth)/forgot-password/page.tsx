import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AuthForms } from "@/components/forms/AuthForms";
import Link from "next/link";
import { MoveLeftIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot Password - Micro Freelance Marketplace",
  description: "Request a password reset for your account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard dark:shadow-hard-dark border-neutral-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">
            Forgot Password?
          </CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Enter your email address to receive a password reset OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForms formType="forgot-password" />
          <Separator className="my-6 bg-neutral-200" />
          <p className="text-center text-body-sm text-neutral-600">
            <Link
              href="/login"
              className="text-primary-500 font-medium hover:underline flex items-center justify-center mt-2"
            >
              <MoveLeftIcon className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
