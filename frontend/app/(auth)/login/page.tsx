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
  title: "Login - Micro Freelance Marketplace",
  description: "Log in to your Micro Freelance Marketplace account.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard dark:shadow-hard-dark border-neutral-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Log in to access your projects and opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForms formType="login" />
          <Separator className="my-6 bg-neutral-200" />
          <p className="text-center text-body-sm text-neutral-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary-500 font-medium hover:underline flex items-center justify-center mt-2 cursor-pointer"
              aria-label="Go to register page"
            >
              Sign Up Now <MoveRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
