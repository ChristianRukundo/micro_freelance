import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, PaginatedResponse, UserRole } from '@/lib/types';
import { toast } from 'sonner';

import { createTaskSchema } from '@/lib/schemas';
import { z } from "zod";
import { TaskStatus } from "@/lib/types";

interface TaskQueryFilters {
  q?: string;
  categoryId?: string;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TasksPaginatedResponse extends PaginatedResponse<Task> {
  tasks: Task[];
}

export function useTasks(filters?: TaskQueryFilters) {
  const queryClient = useQueryClient();

  // Infinite query for listing tasks with filters
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<TasksPaginatedResponse, Error>({
    queryKey: ['tasks', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...filters, page: pageParam, limit: 10 };
      const response = await api.get('/tasks', { params });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const tasks = data?.pages.flatMap((page) => page.tasks) || [];

  // Query for a single task
  const {
    data: taskDetails,
    isLoading: isLoadingTaskDetails,
    isError: isErrorTaskDetails,
    error: errorTaskDetails,
  } = useQuery<Task, Error>({
    queryKey: ['task', filters?.q], // Assuming q might be taskId here or a separate hook for single task
    queryFn: async () => {
      if (!filters?.q) throw new Error('Task ID is required'); // Adjust if this hook is for single task
      const response = await api.get(`/tasks/${filters.q}`);
      return response.data.data;
    },
    enabled: !!filters?.q, // Only run if taskId is provided
  });

  // Mutation for creating a new task
  const createTaskMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createTaskSchema>) => {
      const response = await api.post("/tasks", values);
      return response.data;
    },
    onMutate: async (newTask) => {
      // Optimistic update (optional, but good for instant feedback)
      // For infinite queries, this can be complex. Simpler to invalidate.
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      // const previousTasks = queryClient.getQueryData(['tasks']);
      // queryClient.setQueryData(['tasks'], (old: any) => {
      //   return { ...old, pages: [{ tasks: [newTask, ...old.pages[0].tasks], ...old.pages[0] }, ...old.pages.slice(1)] };
      // });
      // return { previousTasks };
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Invalidate to refetch actual data
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(error.message);
      // Rollback optimistic update
      // queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
  });

  // Mutation for updating an existing task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, values }: { taskId: string; values: Partial<z.infer<typeof createTaskSchema>> }) => {
      const response = await api.put(`/tasks/${taskId}`, values);
      return response.data;
    },
    onMutate: async ({ taskId, values }) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });
      const previousTask = queryClient.getQueryData<Task>(['task', taskId]);
      queryClient.setQueryData<Task>(['task', taskId], (old) => {
        if (!old) return old as any;
        const updated: Task = {
          ...old,
          ...values as any,
          deadline: (values as any).deadline ? new Date((values as any).deadline) : old.deadline,
          attachments: old.attachments, // keep existing typed attachments
        };
        return updated;
      });
      return { previousTask };
    },
    onSuccess: (response, { taskId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, { taskId }, context) => {
      toast.error(error.message);
      queryClient.setQueryData(['task', taskId], context?.previousTask);
    },
  });

  // Mutation for deleting a task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      queryClient.setQueryData(['tasks'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          tasks: page.tasks.filter((task: Task) => task.id !== taskId),
        })),
      }));
      return { previousTasks };
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, taskId, context) => {
      toast.error(error.message);
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
  });

  // Mutation for canceling a task
  const cancelTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(`/tasks/${taskId}/cancel`);
      return response.data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });
      const previousTask = queryClient.getQueryData<Task>(['task', taskId]);
      queryClient.setQueryData<Task>(['task', taskId], (old) => (old ? { ...old, status: TaskStatus.CANCELLED } : old));
      return { previousTask };
    },
    onSuccess: (response, taskId) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, taskId, context) => {
      toast.error(error.message);
      queryClient.setQueryData(['task', taskId], context?.previousTask);
    },
  });

  // Mutation for completing a task
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await api.patch(`/tasks/${taskId}/complete`);
      return response.data;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId] });
      const previousTask = queryClient.getQueryData<Task>(['task', taskId]);
      queryClient.setQueryData<Task>(['task', taskId], (old) => (old ? { ...old, status: TaskStatus.COMPLETED } : old));
      return { previousTask };
    },
    onSuccess: (response, taskId) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, taskId, context) => {
      toast.error(error.message);
      queryClient.setQueryData(['task', taskId], context?.previousTask);
    },
  });

  return {
    tasks,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    taskDetails,
    isLoadingTaskDetails,
    isErrorTaskDetails,
    errorTaskDetails,
    createTask: createTaskMutation.mutateAsync,
    isCreatingTask: createTaskMutation.isPending,
    updateTask: updateTaskMutation.mutateAsync,
    isUpdatingTask: updateTaskMutation.isPending,
    deleteTask: deleteTaskMutation.mutateAsync,
    isDeletingTask: deleteTaskMutation.isPending,
    cancelTask: cancelTaskMutation.mutateAsync,
    isCancelingTask: cancelTaskMutation.isPending,
    completeTask: completeTaskMutation.mutateAsync,
    isCompletingTask: completeTaskMutation.isPending,
  };
}


// --- CATEGORIES HOOK ---
export function useCategories() {
  const { data, isLoading, isError, error } = useQuery<any, Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data.data;
    },
    staleTime: Infinity, // Categories rarely change
  });

  return {
    categories: data || [],
    isLoadingCategories: isLoading,
    isErrorCategories: isError,
    errorCategories: error,
  };
}