import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthForms } from '@/components/forms/AuthForms';
import Link from 'next/link';
import { MoveRightIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verify Email - Micro Freelance Marketplace',
  description: 'Verify your email address to activate your account.',
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard border-neutral-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">Verify Your Email</CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Please enter the 6-digit OTP sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForms formType="verify-email" />
          <Separator className="my-6 bg-neutral-200" />
          <p className="text-center text-body-sm text-neutral-600">
            Didn't receive the OTP?{' '}
            <Link href="/forgot-password" className="text-primary-500 font-medium hover:underline flex items-center justify-center mt-2">
              Resend OTP <MoveRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}