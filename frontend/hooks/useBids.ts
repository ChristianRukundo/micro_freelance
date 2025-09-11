import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { submitBidSchema, updateBidSchema } from "@/lib/schemas";
import api from "@/lib/api";


export function useBids(taskId?: string) {
  const queryClient = useQueryClient();

  const submitBidMutation = useMutation({
    mutationFn: async (values: z.infer<typeof submitBidSchema>) => {
      if (!taskId) throw new Error("Task ID is required to submit a bid.");
      const response = await api.post(`/tasks/${taskId}/bids`, values);
      return response.data;
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
    mutationFn: async ({
      bidId,
      values,
    }: {
      bidId: string;
      values: z.infer<typeof updateBidSchema>;
    }) => {
      const response = await api.put(`/bids/${bidId}`, values);
      return response.data;
    },
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
    mutationFn: async (bidId: string) => {
      const response = await api.delete(`/bids/${bidId}`);
      return response.data;
    },
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
    mutationFn: async (bidId: string) => {
      const response = await api.post(`/bids/${bidId}/accept`);
      return response.data;
    },
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
