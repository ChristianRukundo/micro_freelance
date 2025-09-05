import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import api from "@/lib/api";
import { Task, UserRole, Bid, Milestone } from "@/lib/types";
import { TaskDetailsOverview } from "@/components/dashboard/ProjectWorkspace"; // Client Components
import { TaskBidsSection } from "@/components/dashboard/ProjectWorkspace";
import { MilestoneManagement } from "@/components/dashboard/ProjectWorkspace";
import { ChatSection } from "@/components/dashboard/ProjectWorkspace";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/zustand"; // Client component for user role checks
import {
  Skeleton,
  TaskDetailsSkeleton,
} from "@/components/common/SkeletonLoaders";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlertIcon } from "lucide-react";

interface ProjectWorkspacePageProps {
  params: { id: string };
}

// Server Component to fetch initial task data
async function getTaskDetails(taskId: string): Promise<Task | null> {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch task ${taskId} details:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProjectWorkspacePageProps): Promise<Metadata> {
  const task = await getTaskDetails(params.id);
  if (!task) {
    return {
      title: "Project Not Found - Micro Freelance Marketplace",
      description: "The requested project could not be found.",
    };
  }
  return {
    title: `${task.title} - Project Workspace`,
    description: `Manage project "${task.title}" with milestones, bids, and real-time chat.`,
  };
}

export default async function ProjectWorkspacePage({
  params,
}: ProjectWorkspacePageProps) {
  const taskId = params.id;
  const queryClient = new QueryClient();

  // Prefetch task details on the server
  await queryClient.prefetchQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskDetails(taskId),
  });

  const initialTask = queryClient.getQueryData<Task>(["task", taskId]);

  if (!initialTask) {
    notFound(); // Next.js 404 page
  }

  return (
    <div className="flex flex-col space-y-8 py-8">
      <h1 className="text-display-md font-extrabold">Project Workspace</h1>
      <p className="text-body-md">
        Manage &quot;{initialTask.title}&quot; - track progress, communicate, and handle
        payments.
      </p>

      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" />
              <AlertTitle>Error loading project details</AlertTitle>
              <AlertDescription>
                There was an issue displaying the project overview. Please try
                refreshing.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense fallback={<TaskDetailsSkeleton />}>
            {/* Task Overview (Client/Server) */}
            <TaskDetailsOverview taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>

        <Separator className="my-6 bg-neutral-200" />

        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" />
              <AlertTitle>Error loading bids</AlertTitle>
              <AlertDescription>
                There was an issue displaying bids for this project.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense fallback={<TaskBidsSectionSkeleton />}>
            {/* Bids Section (Client Component) */}
            <TaskBidsSection taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>

        <Separator className="my-6 bg-neutral-200" />

        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" />
              <AlertTitle>Error loading milestones</AlertTitle>
              <AlertDescription>
                There was an issue displaying milestones for this project.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense fallback={<MilestoneManagementSkeleton />}>
            {/* Milestone Management (Client Component) */}
            <MilestoneManagement taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>

        <Separator className="my-6 bg-neutral-200" />

        <ErrorBoundary
          fallback={
            <Alert variant="destructive">
              <TriangleAlertIcon className="h-4 w-4" />
              <AlertTitle>Error loading chat</AlertTitle>
              <AlertDescription>
                There was an issue loading the project chat.
              </AlertDescription>
            </Alert>
          }
        >
          <Suspense fallback={<ChatSectionSkeleton />}>
            {/* Chat Section (Client Component) */}
            <ChatSection taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}

// Skeletons for the main sections of the workspace
const TaskBidsSectionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-1/4" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

const MilestoneManagementSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-1/4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const ChatSectionSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-1/4" />
    <Skeleton className="h-[400px] w-full" />
  </div>
);
