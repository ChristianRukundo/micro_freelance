import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForms } from '@/components/forms/AuthForms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MoveRightIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Register - Micro Freelance Marketplace',
  description: 'Create a new account on Micro Freelance Marketplace to start posting tasks or finding work.',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard border-neutral-200">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-h2 font-bold text-neutral-800">Join Our Community</CardTitle>
          <CardDescription className="text-body-md text-neutral-600">
            Create an account to connect with clients or showcase your skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForms formType="register" />
          <Separator className="my-6 bg-neutral-200" />
          <p className="text-center text-body-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 font-medium hover:underline flex items-center justify-center mt-2">
              Log In Here <MoveRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}