'use client';

import React from 'react';
import { Task, Bid, Milestone, TaskStatus, UserRole, MilestoneStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DollarSignIcon, ClockIcon, UsersIcon, FileTextIcon, MessageSquareTextIcon, HammerIcon, CheckCircle2Icon, XCircleIcon, CalendarIcon, PlusCircleIcon, PencilIcon, Trash2Icon, MoveRightIcon, ListChecksIcon, RotateCcwIcon, AwardIcon, TriangleAlertIcon } from 'lucide-react';
import { formatRelativeTime, formatDate, isPastDate } from '@/lib/date';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {  Skeleton, TaskDetailsSkeleton } from '@/components/common/SkeletonLoaders';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuthStore } from '@/lib/zustand';
import { useTasks } from '@/hooks/useTasks';
import { useBids } from '@/hooks/useBids';
import { BidCard } from '@/components/cards/BidCard';
import { BidForm } from '@/components/forms/BidForm';
import { useMilestones } from '@/hooks/useMilestones';
import { MilestoneForm } from '@/components/forms/MilestoneForm';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as actions from '@/lib/actions';
import { toast } from 'sonner';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Separator } from '@radix-ui/react-dropdown-menu';


interface ProjectSectionProps {
  taskId: string;
  initialTask: Task;
}

// --- Task Details Overview Section ---
export function TaskDetailsOverview({ taskId, initialTask }: ProjectSectionProps) {
  const { user, isClient, isAdmin } = useAuthStore();
  const { taskDetails, isLoadingTaskDetails, isErrorTaskDetails, errorTaskDetails, cancelTask, isCancelingTask, completeTask, isCompletingTask, deleteTask, isDeletingTask } = useTasks({ q: taskId });

  const task = taskDetails || initialTask;

  const isTaskOwner = user?.id === task.clientId;

  const handleCancelTask = async () => {
    if (window.confirm('Are you sure you want to cancel this task? This action cannot be undone.')) {
      try {
        await cancelTask(taskId);
        toast.success('Task cancelled successfully!');
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This will remove all associated data.')) {
      try {
        await deleteTask(taskId);
        toast.success('Task deleted successfully!');
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const handleCompleteTask = async () => {
    if (window.confirm('Marking this task as completed will finalize the project. Are you sure?')) {
      try {
        await completeTask(taskId);
        toast.success('Task marked as completed!');
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const avatarSeed = task.client?.profile?.firstName || task.client?.email || 'Client';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-display-md font-bold text-neutral-800">{task.title}</h2>
        <Badge variant="outline" className={`text-body-md font-semibold px-4 py-2 ${
          task.status === TaskStatus.OPEN ? 'bg-success-50 text-success-600 border-success-200' :
          task.status === TaskStatus.IN_PROGRESS ? 'bg-warning-50 text-warning-600 border-warning-200' :
          task.status === TaskStatus.IN_REVIEW ? 'bg-blue-50 text-blue-600 border-blue-200' : // Custom blue for in-review
          task.status === TaskStatus.COMPLETED ? 'bg-neutral-100 text-neutral-600 border-neutral-300' :
          'bg-neutral-100 text-neutral-500 border-neutral-300'
        }`}>
          {task.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-body-sm text-neutral-600">
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

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm text-neutral-600">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={task.client?.profile?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`} alt={avatarSeed} />
            <AvatarFallback>{avatarSeed.charAt(0).toUpperCase()}</AvatarFallback>
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

      {/* Action Buttons for Task Owner (Client/Admin) */}
      {(isTaskOwner || isAdmin) && (task.status === TaskStatus.OPEN || task.status === TaskStatus.IN_REVIEW) && (
        <div className="flex flex-wrap gap-4 mt-8">
          {isTaskOwner && task.status === TaskStatus.OPEN && (
            <Link href={`/tasks/edit/${taskId}`} passHref>
              <Button variant="outline" className="group shadow-soft">
                <PencilIcon className="mr-2 h-4 w-4" /> Edit Task
              </Button>
            </Link>
          )}
          {(isTaskOwner || isAdmin) && task.status === TaskStatus.OPEN && (
            <Button
              variant="destructive"
              onClick={handleCancelTask}
              disabled={isCancelingTask}
              className="shadow-medium group"
            >
              {isCancelingTask ? <LoadingSpinner size="sm" color="text-destructive-foreground" className="mr-2" /> : <XCircleIcon className="mr-2 h-4 w-4" />}
              Cancel Task
            </Button>
          )}
          {(isTaskOwner || isAdmin) && task.status === TaskStatus.OPEN && (
            <Button
              variant="outline"
              onClick={handleDeleteTask}
              disabled={isDeletingTask}
              className="shadow-soft group text-destructive-500 hover:bg-destructive-50"
            >
              {isDeletingTask ? <LoadingSpinner size="sm" className="mr-2" /> : <Trash2Icon className="mr-2 h-4 w-4" />}
              Delete Task
            </Button>
          )}
          {isTaskOwner && task.status === TaskStatus.IN_REVIEW && (
            <Button
              variant="default"
              onClick={handleCompleteTask}
              disabled={isCompletingTask}
              className="bg-success-500 hover:bg-success-600 shadow-primary group"
            >
              {isCompletingTask ? <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" /> : <CheckCircle2Icon className="mr-2 h-4 w-4" />}
              Mark as Completed
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// --- Bids Section ---
export function TaskBidsSection({ taskId, initialTask }: ProjectSectionProps) {
  const { user, isClient, isFreelancer } = useAuthStore();
  const { bids, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useBids(taskId);
  const { ref, inView } = useInView();

  const isTaskOwner = user?.id === initialTask.clientId;
  const isAssignedFreelancer = user?.id === initialTask.freelancerId;
  const canBid = isFreelancer && initialTask.status === TaskStatus.OPEN;
  const hasBidded = bids.some(bid => bid.freelancerId === user?.id);

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);


  if (isError) return (
    <Alert variant="destructive">
      <TriangleAlertIcon className="h-4 w-4" />
      <AlertTitle>Error loading bids</AlertTitle>
      <AlertDescription>Failed to load bids: {error?.message}</AlertDescription>
    </Alert>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6"
    >
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

      {isLoading && bids.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <BidCardSkeleton key={i} />)}
        </div>
      ) : bids.length === 0 ? (
        <p className="text-body-md text-neutral-500 text-center py-4">No bids submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} isTaskOwner={isTaskOwner} taskId={taskId} />
          ))}
          {isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <LoadingSpinner size="md" className="mr-2" /> Loading more bids...
            </div>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div ref={ref} className="mt-4 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="shadow-soft group"
              >
                Load More <MoveRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

const BidCardSkeleton = () => (
  <Card className="h-56 w-full rounded-xl border border-neutral-200 bg-card shadow-soft">
    <CardHeader className="flex flex-row items-start justify-between p-6 pb-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </CardHeader>
    <CardContent className="p-6 pt-0 space-y-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
    <CardFooter className="p-6 pt-0 flex justify-end">
      <Skeleton className="h-10 w-32 rounded-lg" />
    </CardFooter>
  </Card>
);

// --- Milestone Management Section ---
export function MilestoneManagement({ taskId, initialTask }: ProjectSectionProps) {
  const { user, isClient, isFreelancer } = useAuthStore();
  const { milestones, isLoadingMilestones, isErrorMilestones, errorMilestones, refetchMilestones,
    submitMilestone, isSubmittingMilestone, requestMilestoneRevision, isRequestingMilestoneRevision,
    approveMilestone, isApprovingMilestone
  } = useMilestones(taskId);

  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = React.useState(false);

  const isTaskOwner = user?.id === initialTask.clientId;
  const isAssignedFreelancer = user?.id === initialTask.freelancerId;

  // Calculate progress percentage
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter(m => m.status === MilestoneStatus.APPROVED).length;
  const progressPercentage = totalMilestones > 0 ? Math.round((approvedMilestones / totalMilestones) * 100) : 0;

  if (isLoadingMilestones) return (
    <div className="space-y-4">
      <h3 className="text-h4 font-bold text-neutral-800 mb-4"><Skeleton className="h-6 w-1/3" /></h3>
      <Skeleton className="h-6 w-full" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-xl border border-neutral-200 bg-card shadow-soft p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-6 w-1/4 rounded-full" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex space-x-2 justify-end">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );

  if (isErrorMilestones) return (
    <Alert variant="destructive">
      <TriangleAlertIcon className="h-4 w-4" />
      <AlertTitle>Error loading milestones</AlertTitle>
      <AlertDescription>Failed to load milestones: {errorMilestones?.message}</AlertDescription>
    </Alert>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-bold text-neutral-800">Milestones ({totalMilestones})</h3>
        {isTaskOwner && initialTask.status === TaskStatus.IN_PROGRESS && (
          <Dialog open={isMilestoneFormOpen} onOpenChange={setIsMilestoneFormOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="shadow-primary group">
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Create Milestones
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Project Milestones</DialogTitle>
                <DialogDescription>
                  Define measurable deliverables, due dates, and payment amounts for each stage of the project.
                </DialogDescription>
              </DialogHeader>
              <MilestoneForm taskId={taskId} onSuccess={() => setIsMilestoneFormOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {milestones.length === 0 ? (
        <p className="text-body-md text-neutral-500 text-center py-4">
          {isTaskOwner ? "No milestones defined yet. Click 'Create Milestones' to start." : "No milestones defined for this project."}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-body-sm text-neutral-600">
              <span>Progress:</span>
              <span className="font-medium text-neutral-800">{progressPercentage}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-neutral-200" indicatorClassName="bg-primary-500" />
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                isTaskOwner={isTaskOwner}
                isAssignedFreelancer={isAssignedFreelancer}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}


interface MilestoneCardProps {
  milestone: Milestone;
  isTaskOwner: boolean;
  isAssignedFreelancer: boolean;
}

function MilestoneCard({ milestone, isTaskOwner, isAssignedFreelancer }: MilestoneCardProps) {
  const { submitMilestone, isSubmittingMilestone, requestMilestoneRevision, isRequestingMilestoneRevision, approveMilestone, isApprovingMilestone } = useMilestones(milestone.taskId);

  const [isRevisionDialogValid, setIsRevisionDialogValid] = React.useState(false);
  const revisionForm = useForm<{ comments: string }>({
    resolver: zodResolver(actions.requestRevisionSchema),
    defaultValues: { comments: milestone.comments || '' },
  });


  const handleAction = async (actionFn: (id: string, values?: any) => Promise<any>, values?: any) => {
    try {
      await actionFn(milestone.id, values);
      toast.success('Milestone updated successfully!');
    } catch (error) {
      // Toast handled by hook
    }
  };

  const isOverdue = milestone.status !== MilestoneStatus.COMPLETED && milestone.status !== MilestoneStatus.APPROVED && isPastDate(milestone.dueDate);

  return (
    <Card className="rounded-xl border border-neutral-200 bg-card shadow-soft p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h4 className="text-h6 font-semibold text-neutral-800 flex items-center">
          <ListChecksIcon className="h-5 w-5 mr-2 text-primary-500" /> {milestone.description}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`font-semibold ${
            milestone.status === MilestoneStatus.APPROVED ? 'bg-success-50 text-success-600 border-success-200' :
            milestone.status === MilestoneStatus.SUBMITTED ? 'bg-warning-50 text-warning-600 border-warning-200' :
            milestone.status === MilestoneStatus.REVISION_REQUESTED ? 'bg-error-50 text-error-600 border-error-200' :
            'bg-neutral-100 text-neutral-500 border-neutral-300'
          }`}>
            {milestone.status.replace(/_/g, ' ')}
          </Badge>
          <span className={cn(
            "text-body-sm text-neutral-600",
            isOverdue && "text-destructive-500 font-medium"
          )}>
            Due: {formatDate(milestone.dueDate)} {isOverdue && "(Overdue)"}
          </span>
          <span className="text-body-sm font-semibold text-neutral-800">${milestone.amount.toLocaleString()}</span>
        </div>
      </div>

      {milestone.status === MilestoneStatus.REVISION_REQUESTED && milestone.comments && (
        <Alert variant="destructive" className="ml-7 bg-error-50 text-error-700 border-error-200">
          <RotateCcwIcon className="h-4 w-4" />
          <AlertTitle>Revision Requested</AlertTitle>
          <AlertDescription>
            {milestone.comments}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        {/* Freelancer Actions */}
        {isAssignedFreelancer && (milestone.status === MilestoneStatus.PENDING || milestone.status === MilestoneStatus.REVISION_REQUESTED) && (
          <Button
            size="sm"
            onClick={() => handleAction(submitMilestone)}
            disabled={isSubmittingMilestone}
            className="shadow-soft group"
          >
            {isSubmittingMilestone ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2Icon className="mr-2 h-4 w-4" />}
            Submit Work
          </Button>
        )}

        {/* Client Actions */}
        {isTaskOwner && milestone.status === MilestoneStatus.SUBMITTED && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="shadow-soft group">
                  <RotateCcwIcon className="mr-2 h-4 w-4" /> Request Revision
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Revision</DialogTitle>
                  <DialogDescription>
                    Provide detailed feedback for why you're requesting a revision on this milestone.
                  </DialogDescription>
                </DialogHeader>
                <Form {...revisionForm}>
                  <form onSubmit={revisionForm.handleSubmit((values) => handleAction(requestMilestoneRevision, values))} className="space-y-4">
                    <FormField
                      control={revisionForm.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Explain what needs to be revised..." {...field} className="min-h-[100px]" disabled={isRequestingMilestoneRevision} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isRequestingMilestoneRevision}>
                        {isRequestingMilestoneRevision && <LoadingSpinner size="sm" className="mr-2" />}
                        Submit Revision Request
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button
              size="sm"
              onClick={() => handleAction(approveMilestone)}
              disabled={isApprovingMilestone}
              className="bg-success-500 hover:bg-success-600 shadow-primary group"
            >
              {isApprovingMilestone ? <LoadingSpinner size="sm" className="mr-2" /> : <AwardIcon className="mr-2 h-4 w-4" />}
              Approve Milestone
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}


// --- Chat Section ---
export function ChatSection({ taskId, initialTask }: ProjectSectionProps) {
  const { user } = useAuthStore();
  const isTaskOwner = user?.id === initialTask.clientId;
  const isAssignedFreelancer = user?.id === initialTask.freelancerId;

  if (!isTaskOwner && !isAssignedFreelancer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6"
      >
        <Alert variant="default">
          <MessageSquareTextIcon className="h-4 w-4" />
          <AlertTitle>Chat Unavailable</AlertTitle>
          <AlertDescription>
            You must be the client or the assigned freelancer to access the project chat.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-neutral-200 bg-card shadow-medium p-6"
    >
      <h3 className="text-h4 font-bold text-neutral-800 mb-4 flex items-center">
        <MessageSquareTextIcon className="mr-2 h-5 w-5 text-primary-500" /> Project Chat
      </h3>
      <ChatWindow taskId={taskId} />
    </motion.div>
  );
}