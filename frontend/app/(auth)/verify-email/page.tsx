import { AuthForms } from "@/components/forms/AuthForms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { MoveRightIcon } from "lucide-react";
import { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/common/SkeletonLoaders";

export const metadata: Metadata = {
  title: "Verify Email - MicroFreelance",
  description: "Verify your email to activate your account.",
};

function VerifyEmailContent({ email }: { email?: string }) {
  return (
    <Card className="w-full max-w-md shadow-hard border-neutral-200 dark:bg-neutral-900/50 dark:backdrop-blur-lg dark:border-neutral-700/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-h1 dark:text-neutral-100">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-body-md pt-2 dark:text-neutral-400">
          Please enter the 6-digit OTP sent to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthForms formType="verify-email" initialEmail={email} />
        <Separator className="my-6 bg-neutral-200 dark:bg-neutral-700" />
        <p className="text-center text-body-sm text-neutral-600 dark:text-neutral-400">
          Didn&apos;t receive the OTP?{" "}
          <button className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            Resend OTP <MoveRightIcon className="inline-block ml-1 h-4 w-4" />
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-md p-6 space-y-6 dark:bg-neutral-900/50 dark:backdrop-blur-lg dark:border-neutral-700/80">
      <Skeleton className="h-10 w-3/4 mx-auto" />
      <Skeleton className="h-6 w-1/2 mx-auto" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full mt-2" />
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </Card>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { email: emailQuery } = await searchParams;
  const email = typeof emailQuery === "string" ? emailQuery : undefined;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <VerifyEmailContent email={email} />
    </Suspense>
  );
}
