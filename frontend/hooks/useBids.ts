import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/api";
import { Bid, PaginatedResponse } from "@/lib/types";
import { toast } from "sonner";
import * as actions from "@/lib/actions";
import { z } from "zod";
import { submitBidSchema } from "@/lib/schemas";

interface BidsPaginatedResponse extends PaginatedResponse<Bid> {
  bids: Bid[];
}

export function useBids(taskId?: string) {
  const queryClient = useQueryClient();

  // Infinite query for bids on a specific task
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<BidsPaginatedResponse, Error>({
    queryKey: ["bids", taskId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!taskId) throw new Error("Task ID is required for fetching bids.");
      const params = { page: pageParam, limit: 10 };
      const response = await api.get(`/tasks/${taskId}/bids`, { params });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!taskId,
  });

  const bids = data?.pages.flatMap((page) => page.bids) || [];

  // Mutation for submitting a new bid
  const submitBidMutation = useMutation({
    mutationFn: (values: z.infer<typeof submitBidSchema>) => {
      if (!taskId) throw new Error("Task ID is required to submit a bid.");
      return actions.submitBidAction(taskId, values);
    },
    onMutate: async (newBid) => {
      await queryClient.cancelQueries({ queryKey: ["bids", taskId] });
      const previousBids = queryClient.getQueryData<BidsPaginatedResponse>([
        "bids",
        taskId,
      ]);

      // Optimistic update for adding a new bid
      queryClient.setQueryData<any>(
        ["bids", taskId],
        (old: any) => {
          if (!old) return previousBids; // Fallback if no old data

          const tempBid: Bid = {
            // Create a temporary bid object for optimistic update
            id: `temp-${Math.random()}`, // Temporary ID
            taskId: taskId!,
            freelancerId: "current-user-id", // Placeholder, replace with actual user ID from auth store
            proposal: newBid.proposal,
            amount: newBid.amount,
            createdAt: new Date(),
            status: "PENDING",
          };
          const newPages = (old as any).pages.map((page: any, index: number) => {
            if (index === 0) {
              return { ...page, bids: [tempBid, ...page.bids] }; // Add to first page
            }
            return page;
          });
          return { ...old, pages: newPages };
        }
      );
      return { previousBids };
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["bids", taskId] }); // Invalidate to refetch actual data
        queryClient.invalidateQueries({ queryKey: ["task", taskId] }); // Task bid count might change
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(error.message);
      queryClient.setQueryData(["bids", taskId], context?.previousBids); // Rollback
    },
  });

  // Mutation for accepting a bid
  const acceptBidMutation = useMutation({
    mutationFn: (bidId: string) => actions.acceptBidAction(bidId),
    onMutate: async (bidId) => {
      await queryClient.cancelQueries({ queryKey: ["bids", taskId] });
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });

      const previousBids = queryClient.getQueryData<BidsPaginatedResponse>([
        "bids",
        taskId,
      ]);
      const previousTask = queryClient.getQueryData<any>(["task", taskId]);

      // Optimistic update for bids: mark accepted, others rejected
      queryClient.setQueryData<any>(
        ["bids", taskId],
        (old: any) => {
          if (!old) return old;
          const newPages = (old as any).pages.map((page: any) => ({
            ...page,
            bids: page.bids.map((bid: any) => {
              if (bid.id === bidId) return { ...bid, status: "ACCEPTED" };
              if (bid.status === "PENDING")
                return { ...bid, status: "REJECTED" };
              return bid;
            }),
          }));
          return { ...old, pages: newPages };
        }
      );

      // Optimistic update for task status
      queryClient.setQueryData<any>(["task", taskId], (old: any) => {
        if (!old) return old;
        return { ...old, status: "IN_PROGRESS" };
      });

      return { previousBids, previousTask };
    },
    onSuccess: (response, bidId) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["bids", taskId] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(error.message);
      queryClient.setQueryData(["bids", taskId], context?.previousBids);
      queryClient.setQueryData(["task", taskId], context?.previousTask);
    },
  });

  return {
    bids,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    submitBid: submitBidMutation.mutateAsync,
    isSubmittingBid: submitBidMutation.isPending,
    acceptBid: acceptBidMutation.mutateAsync,
    isAcceptingBid: acceptBidMutation.isPending,
  };
}
