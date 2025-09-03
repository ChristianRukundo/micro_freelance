import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import api from '@/lib/api';
import { Task, UserRole, Bid, Milestone, TaskStatus } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/zustand'; // Client component for user role checks
import { TaskDetailsSkeleton } from '@/components/common/SkeletonLoaders';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlertIcon, DollarSignIcon, ClockIcon, UsersIcon, FileTextIcon, MessageSquareTextIcon, HammerIcon, CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import Image from 'next/image';
import { formatRelativeTime, formatDate } from '@/lib/date';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BidForm } from '@/components/forms/BidForm';
import { useBids } from '@/hooks/useBids';
import { useTasks } from '@/hooks/useTasks';
import { BidCard } from '@/components/cards/BidCard';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface TaskDetailsPageProps {
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

export async function generateMetadata({ params }: TaskDetailsPageProps): Promise<Metadata> {
  const task = await getTaskDetails(params.id);
  if (!task) {
    return {
      title: 'Task Not Found - Micro Freelance Marketplace',
      description: 'The requested task could not be found.',
    };
  }
  return {
    title: `${task.title} - Micro Freelance Marketplace`,
    description: task.description.substring(0, 150) + '...',
  };
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const taskId = params.id;
  const queryClient = new QueryClient();

  // Prefetch task details on the server
  await queryClient.prefetchQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskDetails(taskId),
  });

  const initialTask = queryClient.getQueryData<Task>(['task', taskId]);

  if (!initialTask) {
    notFound(); // Next.js 404 page
  }

  return (
    <div className="container py-8">
      <h1 className="text-display-md font-extrabold text-neutral-800 hidden">Task Details</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={
          <Alert variant="destructive">
            <TriangleAlertIcon className="h-4 w-4" />
            <AlertTitle>Error loading task details</AlertTitle>
            <AlertDescription>
              There was an issue displaying the task. Please try refreshing.
            </AlertDescription>
          </Alert>
        }>
          <Suspense fallback={<TaskDetailsSkeleton />}>
            <TaskDetailsContent taskId={taskId} initialTask={initialTask} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}


// --- Client Component to handle interactivity and data fetching ---
interface TaskDetailsContentProps {
  taskId: string;
  initialTask: Task;
}

function TaskDetailsContent({ taskId, initialTask }: TaskDetailsContentProps) {
  const { user, isClient, isFreelancer } = useAuthStore();
  const { taskDetails, isLoadingTaskDetails, isErrorTaskDetails, errorTaskDetails, cancelTask, isCancelingTask, completeTask, isCompletingTask } = useTasks({ q: taskId });
  const { bids, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useBids(taskId);
  const { ref, inView } = useInView();

  const task = taskDetails || initialTask; // Use real-time data if available, fallback to initial

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoadingTaskDetails) return <TaskDetailsSkeleton />;
  if (isErrorTaskDetails) return (
    <Alert variant="destructive">
      <TriangleAlertIcon className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Failed to load task details: {errorTaskDetails?.message}</AlertDescription>
    </Alert>
  );

  const isTaskOwner = user?.id === task.clientId;
  const isAssignedFreelancer = user?.id === task.freelancerId;
  const canBid = isFreelancer && task.status === TaskStatus.OPEN;
  const hasBidded = bids.some(bid => bid.freelancerId === user?.id);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Left Column: Task Details */}
      <div className="flex-1 space-y-8">
        <div className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-display-md font-bold text-neutral-800">{task.title}</h2>
            <Badge variant="outline" className={`text-body-md font-semibold ${
              task.status === TaskStatus.OPEN ? 'bg-success-50 text-success-600 border-success-200' :
              task.status === TaskStatus.IN_PROGRESS ? 'bg-warning-50 text-warning-600 border-warning-200' :
              task.status === TaskStatus.COMPLETED ? 'bg-neutral-100 text-neutral-600 border-neutral-300' :
              'bg-neutral-100 text-neutral-500 border-neutral-300'
            }`}>
              {task.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-body-sm text-neutral-600 mb-6">
            <div className="flex items-center">
              <DollarSignIcon className="mr-2 h-4 w-4 text-primary-500" />
              <span className="font-semibold text-neutral-700">${task.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="mr-2 h-4 w-4 text-primary-500" />
              <span>Due by {formatDate(task.deadline)} ({formatRelativeTime(task.deadline)})</span>
            </div>
            <div className="flex items-center">
              <Badge variant="secondary" className="bg-primary-50 text-primary-600">
                {task.category?.name || 'Uncategorized'}
              </Badge>
            </div>
          </div>

          <article className="prose prose-sm dark:prose-invert max-w-none text-neutral-700">
            <h3 className="text-h4 font-bold text-neutral-800 mb-3">Description</h3>
            <ReactMarkdown>{task.description}</ReactMarkdown>
          </article>

          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-h4 font-bold text-neutral-800 mb-3">Attachments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 hover:bg-neutral-100 transition-colors"
                  >
                    <FileTextIcon className="h-5 w-5 text-primary-500" />
                    <span className="text-body-sm font-medium text-neutral-700">{attachment.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between text-body-sm text-neutral-600">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={task.client?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${task.client?.email || 'Client'}`} alt={task.client?.profile?.firstName || task.client?.email || 'Client'} />
                <AvatarFallback>{(task.client?.profile?.firstName || 'C').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>Posted by <Link href={`/freelancers/${task.clientId}`} className="font-semibold text-primary-500 hover:underline">{task.client?.profile?.firstName || 'Client'}</Link> {formatRelativeTime(task.createdAt)}</span>
            </div>
            {task.freelancer && (
              <div className="flex items-center space-x-2">
                <HammerIcon className="h-4 w-4 text-primary-500" />
                <span>Assigned to <Link href={`/freelancers/${task.freelancerId}`} className="font-semibold text-primary-500 hover:underline">{task.freelancer.profile?.firstName || 'Freelancer'}</Link></span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Task Owner (Client) */}
        {isTaskOwner && task.status === TaskStatus.OPEN && (
          <div className="flex space-x-4">
            <Link href={`/tasks/edit/${taskId}`} passHref>
              <Button variant="outline">Edit Task</Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => cancelTask(taskId)}
              disabled={isCancelingTask}
            >
              {isCancelingTask ? <LoadingSpinner size="sm" className="mr-2" /> : <XCircleIcon className="mr-2 h-4 w-4" />}
              Cancel Task
            </Button>
          </div>
        )}
        {isTaskOwner && task.status === TaskStatus.IN_REVIEW && (
          <div className="flex space-x-4">
            <Button
              variant="default"
              onClick={() => completeTask(taskId)}
              disabled={isCompletingTask}
              className="bg-success-500 hover:bg-success-600"
            >
              {isCompletingTask ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2Icon className="mr-2 h-4 w-4" />}
              Mark as Completed
            </Button>
          </div>
        )}

      </div>

      {/* Right Column: Bids & Chat (Conditional) */}
      <div className="w-full lg:w-[400px] space-y-8">
        {/* Bidding Section */}
        <div id="bids" className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6">
          <h3 className="text-h4 font-bold text-neutral-800 mb-4">Bids ({bids.length})</h3>
          {canBid && !hasBidded && (
            <>
              <p className="text-body-sm text-neutral-600 mb-4">Submit your proposal for this project:</p>
              <BidForm taskId={taskId} />
              <Separator className="my-6 bg-neutral-200" />
            </>
          )}

          {isFreelancer && hasBidded && (
            <Alert className="mb-6 bg-primary-50 text-primary-700 border-primary-200">
              <MessageSquareTextIcon className="h-4 w-4" />
              <AlertTitle>Bid Submitted</AlertTitle>
              <AlertDescription>You have already submitted a bid for this task.</AlertDescription>
            </Alert>
          )}

          {bids.length === 0 ? (
            <p className="text-body-md text-neutral-500 text-center py-4">No bids submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <BidCard key={bid.id} bid={bid} isTaskOwner={isTaskOwner} taskId={taskId} />
              ))}
              {hasNextPage && (
                <div ref={ref} className="mt-4 flex justify-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    variant="outline"
                    className="shadow-soft"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <LoadingSpinner size="sm" color="text-primary-500" className="mr-2" /> Loading more...
                      </>
                    ) : (
                      'Load More Bids'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Section */}
        {(isTaskOwner || isAssignedFreelancer) && (
          <div className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6">
            <h3 className="text-h4 font-bold text-neutral-800 mb-4 flex items-center">
              <MessageSquareTextIcon className="mr-2 h-5 w-5 text-primary-500" /> Project Chat
            </h3>
            <ChatWindow taskId={taskId} />
          </div>
        )}
      </div>
    </div>
  );
}