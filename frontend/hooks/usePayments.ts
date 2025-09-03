import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import * as actions from '@/lib/actions';
import { createStripeConnectAccountSchema, fundTaskBodySchema } from '@/lib/actions';
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
    mutationFn: (values: z.infer<typeof createStripeConnectAccountSchema>) =>
      actions.createStripeConnectAccountAction(values),
    onSuccess: (response) => {
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
    mutationFn: ({ taskId, amount }: { taskId: string; amount: number }) =>
      actions.createPaymentIntentAction(taskId, { amount }),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['task', response.data?.taskId] }); // Invalidate task if funding status is shown
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