'use client';

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon, DollarSignIcon, ExternalLinkIcon, LinkIcon, XCircleIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/zustand';
import { usePayments } from '@/hooks/usePayments';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Metadata needs to be exported from a Server Component or a generateMetadata function
// export const metadata: Metadata = {
//   title: 'Payouts - Micro Freelance Marketplace',
//   description: 'Manage your Stripe Connect account for receiving payouts.',
// };

export default function PayoutsPage() {
  const { user } = useAuthStore();
  const {
    stripeAccountStatus,
    isLoadingStripeAccountStatus,
    isCreatingStripeConnectAccount,
    createStripeConnectAccount,
    refetchStripeAccountStatus,
    errorStripeAccountStatus
  } = usePayments();

  const handleConnectStripe = async () => {
    try {
      const response = await createStripeConnectAccount({});
      if (response.success && response.data?.onboardingUrl) {
        toast.info('Redirecting to Stripe to complete onboarding...');
        window.location.href = response.data.onboardingUrl;
      }
    } catch (error) {
      // toast is already handled by usePayments hook
    }
  };

  useEffect(() => {
    // Refetch status when returning from Stripe, or if error indicates need to retry
    if (errorStripeAccountStatus) {
      toast.error('Failed to load Stripe account status. Please try refreshing or connecting again.');
    }
    refetchStripeAccountStatus();
  }, [refetchStripeAccountStatus, errorStripeAccountStatus]);


  return (
    <div className="flex flex-col space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-display-md font-extrabold text-neutral-800"
      >
        Payout Settings
      </motion.h1>
      <p className="text-body-md text-neutral-600">
        Connect your Stripe account to receive secure and timely payouts for your completed projects.
      </p>

      <Card className="shadow-medium border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-h3 font-bold text-neutral-800">Stripe Connect Status</CardTitle>
          <LinkIcon className="h-6 w-6 text-neutral-500" />
        </CardHeader>
        <CardContent>
          {isLoadingStripeAccountStatus ? (
            <div className="flex items-center space-x-3 text-body-md text-neutral-600">
              <LoadingSpinner size="sm" /> <span>Loading Stripe account status...</span>
            </div>
          ) : stripeAccountStatus?.stripeAccountCompleted ? (
            <div className="flex items-center space-x-3 text-body-md text-success-600">
              <CheckCircle2Icon className="h-6 w-6" /> <span>Your Stripe account is connected and ready for payouts!</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 text-body-md text-error-600">
                <XCircleIcon className="h-6 w-6" /> <span>Stripe account not fully connected.</span>
              </div>
              <CardDescription className="text-body-sm text-neutral-600">
                Please connect or complete the onboarding process for your Stripe account to receive payments.
              </CardDescription>
              <Button
                onClick={handleConnectStripe}
                disabled={isCreatingStripeConnectAccount}
                className="w-fit shadow-primary group"
              >
                {isCreatingStripeConnectAccount ? (
                  <>
                    <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" /> Connecting...
                  </>
                ) : (
                  <>
                    Connect Stripe Account <ExternalLinkIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Recent Payouts */}
      <section className="space-y-6">
        <h2 className="text-h3 font-bold text-neutral-800">Recent Payouts</h2>
        <Card className="shadow-medium border-neutral-200">
          <CardContent className="p-6">
            <p className="text-body-md text-neutral-600">
              Your recent payouts will be listed here. This is a placeholder.
            </p>
            <Button variant="link" className="mt-4" onClick={() => toast.info('Payout history coming soon!')}>
              View All Payouts
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}