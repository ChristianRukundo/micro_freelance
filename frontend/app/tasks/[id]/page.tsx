// frontend/app/tasks/[id]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import api from "@/lib/api";
import { Task } from "@/lib/types";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";
import { TaskDetailsSkeleton } from "@/components/common/SkeletonLoaders";
import { TaskDetailsClient } from "@/components/tasks/TaskDetailsClient";

type Props = {
  params: Promise<{ id: string }>;
};

// Server Component function to fetch initial task data
async function getTaskDetails(taskId: string): Promise<Task | null> {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch task ${taskId} details:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskDetails(id);
  if (!task) {
    return {
      title: "Task Not Found - Micro Freelance Marketplace",
      description: "The requested task could not be found.",
    };
  }
  return {
    title: `${task.title} - Micro Freelance Marketplace`,
    description: task.description.substring(0, 150) + "...",
  };
}

export default async function TaskDetailsPage({ params }: Props) {
  const { id } = await params;
  const taskId = id;
  const queryClient = new QueryClient();

  // Prefetch task details on the server
  await queryClient.prefetchQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskDetails(taskId),
  });

  const initialTask = queryClient.getQueryData<Task>(["task", taskId]);

  if (!initialTask) {
    notFound();
  }

  return (
    <div className="container py-8">
      <h1 className="text-display-md font-extrabold hidden">Task Details</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" />
              <AlertTitle>Error loading task details</AlertTitle>
              <AlertDescription>
                There was an issue displaying the task. Please try refreshing.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense fallback={<TaskDetailsSkeleton />}>
            <TaskDetailsClient taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}
