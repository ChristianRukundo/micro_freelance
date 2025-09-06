// frontend/hooks/useBids.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as actions from "@/lib/actions";
import { z } from "zod";
import { submitBidSchema, updateBidSchema } from "@/lib/schemas";


export function useBids(taskId?: string) {
  const queryClient = useQueryClient();

  const submitBidMutation = useMutation({
    mutationFn: (values: z.infer<typeof submitBidSchema>) => {
      if (!taskId) throw new Error("Task ID is required to submit a bid.");
      return actions.submitBidAction(taskId, values);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        // Invalidate the main task query to refetch it with the new bid included
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to submit bid.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const updateBidMutation = useMutation({
    mutationFn: ({
      bidId,
      values,
    }: {
      bidId: string;
      values: z.infer<typeof updateBidSchema>;
    }) => actions.updateBidAction(bidId, values),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to update bid.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const withdrawBidMutation = useMutation({
    mutationFn: (bidId: string) => actions.withdrawBidAction(bidId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to withdraw bid.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  const acceptBidMutation = useMutation({
    mutationFn: (bidId: string) => actions.acceptBidAction(bidId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to accept bid.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  return {
    submitBid: submitBidMutation.mutateAsync,
    isSubmittingBid: submitBidMutation.isPending,
    updateBid: updateBidMutation.mutateAsync,
    isUpdatingBid: updateBidMutation.isPending,
    withdrawBid: withdrawBidMutation.mutateAsync,
    isWithdrawingBid: withdrawBidMutation.isPending,
    acceptBid: acceptBidMutation.mutateAsync,
    isAcceptingBid: acceptBidMutation.isPending,
  };
}
