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
  title: "Forgot Password - MicroFreelance",
  description: "Request a password reset for your account.",
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md shadow-hard border-neutral-200 dark:bg-neutral-900/50 dark:backdrop-blur-lg dark:border-neutral-700/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-h1 dark:text-neutral-100">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-body-md pt-2 dark:text-neutral-400">
          Enter your email to receive a password reset OTP. No worries, it
          happens!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForms formType="forgot-password" />
        <Separator className="my-6 bg-neutral-200 dark:bg-neutral-700" />
        <p className="text-center text-body-sm text-neutral-600 dark:text-neutral-400">
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400 flex items-center justify-center mt-2"
          >
            <MoveLeftIcon className="mr-1 h-4 w-4" /> Back to Login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
