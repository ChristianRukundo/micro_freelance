import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Milestone, PaginatedResponse, MilestoneStatus } from '@/lib/types';
import { toast } from 'sonner';
import * as actions from '@/lib/actions';
import { createMultipleMilestonesSchema, requestRevisionSchema } from '@/lib/schemas';
import { z } from "zod";

interface MilestonesPaginatedResponse extends PaginatedResponse<Milestone> {
  milestones: Milestone[];
}

export function useMilestones(taskId?: string) {
  const queryClient = useQueryClient();

  // Query for all milestones of a task (no infinite scroll usually, as all shown)
  const {
    data: milestones,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<MilestonesPaginatedResponse, Error>({
    queryKey: ['milestones', taskId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!taskId) throw new Error('Task ID is required for fetching milestones.');
      const response = await api.get(`/tasks/${taskId}/milestones`, { params: { page: pageParam, limit: 50 } }); // Fetch all or a reasonable amount
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
        // Milestones might not always be paginated if they're few per task
        if (lastPage.currentPage < lastPage.totalPages) {
            return lastPage.currentPage + 1;
        }
        return undefined;
    },
    initialPageParam: 1,
    enabled: !!taskId,
    select: (data) => ({
        ...data,
        pages: data.pages.map(page => ({
            ...page,
            milestones: page.milestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        }))
    })
  });

  const allMilestones = milestones?.pages.flatMap((page) => page.milestones) || [];


  // Mutation for creating new milestones
  const createMilestonesMutation = useMutation({
    mutationFn: (values: z.infer<typeof createMultipleMilestonesSchema>) => {
      if (!taskId) throw new Error('Task ID is required to create milestones.');
      return actions.createMilestonesAction(taskId, values);
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] }); // Task might update progress/status
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Generic mutation for updating milestone status
  const updateMilestoneStatusMutation = (
    action: (milestoneId: string, values?: any) => Promise<any>,
    status: MilestoneStatus,
    successMessage: string,
    errorMessage: string,
  ) => {
    return useMutation({
      mutationFn: ({ milestoneId, values }: { milestoneId: string; values?: any }) => action(milestoneId, values),
      onMutate: async ({ milestoneId }) => {
        await queryClient.cancelQueries({ queryKey: ['milestones', taskId] });
        const previousMilestones = queryClient.getQueryData<MilestonesPaginatedResponse>(['milestones', taskId]);

        queryClient.setQueryData<MilestonesPaginatedResponse>(['milestones', taskId], (old) => {
          if (!old) return old;
          const newPages = (old as any).pages.map((page: any) => ({
            ...page,
            milestones: page.milestones.map((m: any) => (m.id === milestoneId ? { ...m, status: status } : m)),
          }));
          return { ...old, pages: newPages };
        });
        return { previousMilestones };
      },
      onSuccess: (response) => {
        if (response.success) {
          queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
          queryClient.invalidateQueries({ queryKey: ['task', taskId] });
          toast.success(successMessage);
        } else {
          toast.error(response.message);
        }
      },
      onError: (error, _variables, context) => {
        toast.error(errorMessage);
        queryClient.setQueryData(['milestones', taskId], context?.previousMilestones);
      },
    });
  };

  const submitMilestoneMutation = updateMilestoneStatusMutation(
    actions.submitMilestoneAction,
    MilestoneStatus.SUBMITTED,
    'Milestone submitted for review!',
    'Failed to submit milestone.',
  );

  const requestMilestoneRevisionMutation = updateMilestoneStatusMutation(
    actions.requestMilestoneRevisionAction,
    MilestoneStatus.REVISION_REQUESTED,
    'Revision requested for milestone!',
    'Failed to request revision.',
  );

  const approveMilestoneMutation = updateMilestoneStatusMutation(
    actions.approveMilestoneAction,
    MilestoneStatus.APPROVED,
    'Milestone approved and payment released!',
    'Failed to approve milestone.',
  );

  return {
    milestones: allMilestones,
    isLoadingMilestones: isLoading,
    isErrorMilestones: isError,
    errorMilestones: error,
    refetchMilestones: refetch,
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