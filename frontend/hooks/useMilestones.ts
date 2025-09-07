import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Milestone, MilestoneStatus } from "@/lib/types";
import { toast } from "sonner";
import * as actions from "@/lib/actions";
import {
  createMultipleMilestonesSchema,
  requestRevisionSchema,
  submitMilestoneSchema,
  addAttachmentCommentSchema,
} from "@/lib/schemas";
import { z } from "zod";

export function useMilestones(taskId?: string) {
  const queryClient = useQueryClient();

  const {
    data: milestones = [],
    isLoading: isLoadingMilestones,
    isError: isErrorMilestones,
    error: errorMilestones,
    refetch: refetchMilestones,
  } = useQuery<Milestone[], Error>({
    queryKey: ["milestones", taskId],
    queryFn: async () => {
      if (!taskId)
        throw new Error("Task ID is required for fetching milestones.");
      const response = await api.get(`/tasks/${taskId}/milestones`);
      return response.data.data;
    },
    select: (data) =>
      data.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    enabled: !!taskId,
  });

  const createMilestonesMutation = useMutation({
    mutationFn: (values: z.infer<typeof createMultipleMilestonesSchema>) => {
      if (!taskId) throw new Error("Task ID is required to create milestones.");
      return actions.createMilestonesAction(taskId, values);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      } else {
        toast.error(response.message || "Failed to create milestones.");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

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
        queryClient.setQueryData<Milestone[]>(
          ["milestones", taskId],
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((m) =>
              m.id === milestoneId
                ? {
                    ...m,
                    status: optimisticStatus,
                    ...(values?.comments && { revisionNotes: values.comments }),
                    ...(values?.attachments && {
                      attachments: values.attachments,
                    }),
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
        queryClient.setQueryData(
          ["milestones", taskId],
          context?.previousMilestones
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
        queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      },
    });
  };

  const submitMilestoneMutation = useMutation({
    mutationFn: ({
      milestoneId,
      values,
    }: {
      milestoneId: string;
      values: z.infer<typeof submitMilestoneSchema>;
    }) => actions.submitMilestoneAction(milestoneId, values),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Milestone submitted for review!");
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  const requestMilestoneRevisionMutation = updateMilestoneStatusMutation(
    actions.requestMilestoneRevisionAction,
    MilestoneStatus.REVISION_REQUESTED,
    "Revision requested for milestone!"
  );
  const approveMilestoneMutation = updateMilestoneStatusMutation(
    actions.approveMilestoneAction,
    MilestoneStatus.APPROVED,
    "Milestone approved!"
  );

  // ADDED: Mutation for adding attachment comments
  const addAttachmentCommentMutation = useMutation({
    mutationFn: ({
      attachmentId,
      values,
    }: {
      attachmentId: string;
      values: z.infer<typeof addAttachmentCommentSchema>;
    }) => actions.addAttachmentCommentAction(attachmentId, values),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    milestones,
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
    addAttachmentComment: addAttachmentCommentMutation.mutateAsync,
    isAddingAttachmentComment: addAttachmentCommentMutation.isPending,
  };
}
