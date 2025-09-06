import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Milestone, MilestoneStatus } from "@/lib/types";
import { toast } from "sonner";
import * as actions from "@/lib/actions";
import {
  createMultipleMilestonesSchema,
  requestRevisionSchema,
} from "@/lib/schemas";
import { z } from "zod";

/**
 * Custom hook to manage milestones for a specific task.
 * It handles fetching, creating, and updating the status of milestones.
 *
 * @param taskId The ID of the task whose milestones are being managed.
 */
export function useMilestones(taskId?: string) {
  const queryClient = useQueryClient();

  // --- DATA FETCHING ---
  const {
    data: milestones,
    isLoading: isLoadingMilestones,
    isError: isErrorMilestones,
    error: errorMilestones,
    refetch: refetchMilestones,
  } = useQuery<Milestone[], Error>({
    queryKey: ["milestones", taskId],
    queryFn: async () => {
      if (!taskId)
        throw new Error("Task ID is required for fetching milestones.");
      // The backend should return all milestones for a task in a single array.
      const response = await api.get(`/tasks/${taskId}/milestones`);
      return response.data.data;
    },
    // Sort the milestones by due date once fetched.
    select: (data) =>
      data.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    enabled: !!taskId, // Only run the query if taskId is provided.
  });

  // --- MUTATIONS ---

  // Mutation for creating new milestones
  const createMilestonesMutation = useMutation({
    mutationFn: (values: z.infer<typeof createMultipleMilestonesSchema>) => {
      if (!taskId) throw new Error("Task ID is required to create milestones.");
      return actions.createMilestonesAction(taskId, values);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        // Invalidate both milestones and the parent task queries to refetch fresh data.
        queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to create milestones.");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Generic factory for updating a milestone's status with optimistic updates.
  const updateMilestoneStatusMutation = (
    action: (milestoneId: string, values?: any) => Promise<any>,
    optimisticStatus: MilestoneStatus,
    successMessage: string
  ) => {
    return useMutation({
      mutationFn: ({
        milestoneId,
        values,
      }: {
        milestoneId: string;
        values?: any;
      }) => action(milestoneId, values),
      onMutate: async ({ milestoneId, values }) => {
        await queryClient.cancelQueries({ queryKey: ["milestones", taskId] });
        const previousMilestones = queryClient.getQueryData<Milestone[]>([
          "milestones",
          taskId,
        ]);

        // Optimistically update the milestone in the cache.
        queryClient.setQueryData<Milestone[]>(
          ["milestones", taskId],
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((m) =>
              m.id === milestoneId
                ? {
                    ...m,
                    status: optimisticStatus,
                    // If revision comments are provided, add them optimistically.
                    ...(values?.comments && { comments: values.comments }),
                  }
                : m
            );
          }
        );
        return { previousMilestones };
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(successMessage);
        } else {
          toast.error(response.message || "Milestone update failed.");
        }
      },
      onError: (error: Error, _variables, context) => {
        toast.error(error.message || "An error occurred.");
        // Roll back to the previous state on error.
        queryClient.setQueryData(
          ["milestones", taskId],
          context?.previousMilestones
        );
      },
      onSettled: () => {
        // Always refetch after mutation is settled to ensure data consistency.
        queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      },
    });
  };

  const submitMilestoneMutation = updateMilestoneStatusMutation(
    actions.submitMilestoneAction,
    MilestoneStatus.SUBMITTED,
    "Milestone submitted for review!"
  );

  const requestMilestoneRevisionMutation = updateMilestoneStatusMutation(
    actions.requestMilestoneRevisionAction,
    MilestoneStatus.REVISION_REQUESTED,
    "Revision requested for milestone!"
  );

  const approveMilestoneMutation = updateMilestoneStatusMutation(
    actions.approveMilestoneAction,
    MilestoneStatus.APPROVED,
    "Milestone approved and payment released!"
  );

  return {
    milestones: milestones || [],
    isLoadingMilestones,
    isErrorMilestones,
    errorMilestones,
    refetchMilestones,
    createMilestones: createMilestonesMutation.mutateAsync,
    isCreatingMilestones: createMilestonesMutation.isPending,
    submitMilestone: submitMilestoneMutation.mutateAsync,
    isSubmittingMilestone: submitMilestoneMutation.isPending,
    requestMilestoneRevision: requestMilestoneRevisionMutation.mutateAsync,
    isRequestingMilestoneRevision: requestMilestoneRevisionMutation.isPending,
    approveMilestone: approveMilestoneMutation.mutateAsync,
    isApprovingMilestone: approveMilestoneMutation.isPending,
  };
}
