// File: app/(auth)/login/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { AuthForms } from "@/components/forms/AuthForms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MoveRightIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Login - MicroFreelance",
  description: "Log in to your MicroFreelance account.",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-hard border-neutral-200 dark:bg-neutral-900/50 dark:backdrop-blur-lg dark:border-neutral-700/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-h1 dark:text-neutral-100">
          Welcome Back!
        </CardTitle>
        <CardDescription className="text-body-md pt-2 dark:text-neutral-400">
          Log in to access your projects and opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForms formType="login" />
        <div className="flex justify-between items-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            Forgot Password?
          </Link>
          <Link
            href="/reset-password"
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            Reset Password?
          </Link>
        </div>
        <Separator className="my-6 bg-neutral-200 dark:bg-neutral-700" />
        <p className="text-center text-body-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Sign Up Now <MoveRightIcon className="inline-block ml-1 h-4 w-4" />
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}