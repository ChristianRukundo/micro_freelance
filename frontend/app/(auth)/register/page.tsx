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
import { MoveLeftIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Register - MicroFreelane",
  description: "Create a new account to start your journey.",
};

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md shadow-hard border-neutral-200 dark:bg-neutral-900/50 dark:backdrop-blur-lg dark:border-neutral-700/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-h1 dark:text-neutral-100">
          Join Our Community
        </CardTitle>
        <CardDescription className="text-body-md pt-2 dark:text-neutral-400">
          Create an account to connect with clients or showcase your skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForms formType="register" />
        <Separator className="my-6 bg-neutral-200 dark:bg-neutral-700" />
        <p className="text-center text-body-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Log In Here <MoveLeftIcon className="inline-block ml-1 h-4 w-4" />
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
