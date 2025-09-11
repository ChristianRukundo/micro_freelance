import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

import { createStripeConnectAccountSchema, fundTaskBodySchema } from '@/lib/schemas';
import z from 'zod';

interface StripeAccountStatus {
  stripeAccountCompleted: boolean;
}

export function usePayments() {
  const queryClient = useQueryClient();

  // Query to get Stripe Connect account status
  const {
    data: stripeAccountStatus,
    isLoading: isLoadingStripeAccountStatus,
    isError: isErrorStripeAccountStatus,
    error: errorStripeAccountStatus,
    refetch: refetchStripeAccountStatus,
  } = useQuery<StripeAccountStatus, Error>({
    queryKey: ['stripeAccountStatus'],
    queryFn: async () => {
      const response = await api.get('/payments/stripe/account-status');
      return response.data.data;
    },
    retry: false, // Don't retry if account isn't linked
  });

  // Mutation to create/onboard Stripe Connect account
  const createStripeConnectAccountMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createStripeConnectAccountSchema>) => {
      const response = await api.post("/payments/stripe/connect-account", values);
      return response.data;
    },
    onSuccess: (response: { success: boolean; message: string; data?: { onboardingUrl: string } }) => {
      if (response.success) {
        toast.success(response.message);
        if (response.data?.onboardingUrl) {
          window.location.href = response.data.onboardingUrl; // Redirect to Stripe for onboarding
        }
        queryClient.invalidateQueries({ queryKey: ['stripeAccountStatus'] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation to create a Payment Intent for task funding (escrow)
  const createPaymentIntentMutation = useMutation({
    mutationFn: async ({ taskId, amount }: { taskId: string; amount: number }) => {
      const response = await api.post(
        `/payments/tasks/${taskId}/create-payment-intent`,
        { amount }
      );
      return response.data;
    },
    onSuccess: (response: { success: boolean; message: string; }, variables) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    stripeAccountStatus,
    isLoadingStripeAccountStatus,
    isErrorStripeAccountStatus,
    errorStripeAccountStatus,
    refetchStripeAccountStatus,
    createStripeConnectAccount: createStripeConnectAccountMutation.mutateAsync,
    isCreatingStripeConnectAccount: createStripeConnectAccountMutation.isPending,
    createPaymentIntent: createPaymentIntentMutation.mutateAsync,
    isCreatingPaymentIntent: createPaymentIntentMutation.isPending,
  };
}