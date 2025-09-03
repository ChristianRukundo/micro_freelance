import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthForms } from '@/components/forms/AuthForms';
import Link from 'next/link';
import { MoveLeftIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password - Micro Freelance Marketplace',
  description: 'Reset your password using the OTP sent to your email.',
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard border-neutral-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">Reset Your Password</CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Enter the OTP and your new password to regain access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForms formType="reset-password" />
          <Separator className="my-6 bg-neutral-200" />
          <p className="text-center text-body-sm text-neutral-600">
            <Link href="/login" className="text-primary-500 font-medium hover:underline flex items-center justify-center mt-2">
              <MoveLeftIcon className="mr-1 h-4 w-4" /> Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}