"use client";

import React from "react";
import {
  Task,
  Bid,
  Milestone,
  TaskStatus,
  UserRole,
  MilestoneStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  HammerIcon,
  CheckCircle2Icon,
  XCircleIcon,
  CalendarIcon,
  PlusCircleIcon,
  PencilIcon,
  Trash2Icon,
  MoveRightIcon,
  ListChecksIcon,
  RotateCcwIcon,
  AwardIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { formatRelativeTime, formatDate, isPastDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  Skeleton,
  TaskDetailsSkeleton,
} from "@/components/common/SkeletonLoaders";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth"; // CORRECTED IMPORT
import { useTasks } from "@/hooks/useTasks";
import { useBids } from "@/hooks/useBids";
import { BidCard } from "@/components/cards/BidCard";
import { BidForm } from "@/components/forms/BidForm";
import { useMilestones } from "@/hooks/useMilestones";
import { MilestoneForm } from "@/components/forms/MilestoneForm";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Progress } from "@/components/ui/progress";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as actions from "@/lib/actions";
import { requestRevisionSchema } from "@/lib/schemas";
import { toast } from "sonner";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "../ui/form";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useChat } from "@/hooks/useChat";
import { MyBidCard } from "../cards/MyBidCard";

interface ProjectSectionProps {
  taskId: string;
  initialTask: Task;
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// --- Task Details Overview Section ---
export function TaskDetailsOverview({
  taskId,
  initialTask,
}: ProjectSectionProps) {
  // CORRECTED: Using useAuth() hook
  const { user, isAdmin } = useAuth();
  const {
    taskDetails,
    isLoadingTaskDetails,
    isErrorTaskDetails,
    errorTaskDetails,
    cancelTask,
    isCancelingTask,
    completeTask,
    isCompletingTask,
    deleteTask,
    isDeletingTask,
  } = useTasks({ q: taskId });

  const task = taskDetails || initialTask;

  const isTaskOwner = user?.id === task.clientId;

  const handleCancelTask = async () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this task? This action cannot be undone."
      )
    ) {
      try {
        await cancelTask(taskId);
        toast.success("Task cancelled successfully!");
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const handleDeleteTask = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this task? This will remove all associated data."
      )
    ) {
      try {
        await deleteTask(taskId);
        toast.success("Task deleted successfully!");
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const handleCompleteTask = async () => {
    if (
      window.confirm(
        "Marking this task as completed will finalize the project. Are you sure?"
      )
    ) {
      try {
        await completeTask(taskId);
        toast.success("Task marked as completed!");
      } catch (error) {
        // Error toast handled by useTasks hook
      }
    }
  };

  const avatarSeed =
    task.client?.profile?.firstName || task.client?.email || "Client";

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border bg-card shadow-medium p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-display-md font-bold">{task.title}</h2>
        <Badge
          variant="outline"
          className={`text-body-md font-semibold px-4 py-2 ${
            task.status === TaskStatus.OPEN
              ? "bg-success-50 text-success-600 border-success-200"
              : task.status === TaskStatus.IN_PROGRESS
                ? "bg-warning-50 text-warning-600 border-warning-200"
                : task.status === TaskStatus.IN_REVIEW
                  ? "bg-blue-50 text-blue-600 border-blue-200" // Custom blue for in-review
                  : task.status === TaskStatus.COMPLETED
                    ? "bg-neutral-100 border-neutral-300"
                    : "bg-neutral-100 border-neutral-300"
          }`}
        >
          {task.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-body-sm">
        <div className="flex items-center">
          <DollarSignIcon className="mr-2 h-4 w-4 text-primary-500" />
          <span className="font-semibold">${task.budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="mr-2 h-4 w-4 text-primary-500" />
          <span>
            Due by {formatDate(task.deadline)} (
            {formatRelativeTime(task.deadline)})
          </span>
        </div>
        <div className="flex items-center">
          <Badge variant="secondary" className="bg-primary-50 text-primary-600">
            {task.category?.name || "Uncategorized"}
          </Badge>
        </div>
      </div>

      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h3 className="text-h4 font-bold mb-3">Description</h3>
        <ReactMarkdown>{task.description}</ReactMarkdown>
      </article>

      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-8">
          <h3 className="text-h4 font-bold mb-3">Attachments</h3>
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
                <span className="text-body-sm font-medium">
                  {attachment.fileName}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                task.client?.profile?.avatarUrl ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`
              }
              alt={avatarSeed}
            />
            <AvatarFallback>
              {avatarSeed.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>
            Posted by{" "}
            <Link
              href={`/freelancers/${task.clientId}`}
              className="font-semibold text-primary-500 hover:underline"
            >
              {task.client?.profile?.firstName || "Client"}
            </Link>{" "}
            {formatRelativeTime(task.createdAt)}
          </span>
        </div>
        {task.freelancer && (
          <div className="flex items-center space-x-2">
            <HammerIcon className="h-4 w-4 text-primary-500" />
            <span>
              Assigned to{" "}
              <Link
                href={`/freelancers/${task.freelancerId}`}
                className="font-semibold text-primary-500 hover:underline"
              >
                {task.freelancer.profile?.firstName || "Freelancer"}
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons for Task Owner (Client/Admin) */}
      {(isTaskOwner || isAdmin) &&
        (task.status === TaskStatus.OPEN ||
          task.status === TaskStatus.IN_REVIEW) && (
          <div className="flex flex-wrap gap-4 mt-8">
            {isTaskOwner && task.status === TaskStatus.OPEN && (
              <Link href={`/tasks/edit/${taskId}`} passHref>
                <Button
                  variant="outline"
                  className="group shadow-soft dark:shadow-soft-dark"
                >
                  <PencilIcon className="mr-2 h-4 w-4" /> Edit Task
                </Button>
              </Link>
            )}
            {(isTaskOwner || isAdmin) && task.status === TaskStatus.OPEN && (
              <Button
                variant="gradient"
                onClick={handleCancelTask}
                disabled={isCancelingTask}
                className="shadow-medium dark:shadow-medium-dark group"
              >
                {isCancelingTask ? (
                  <LoadingSpinner
                    size="sm"
                    color="text-destructive-foreground"
                    className="mr-2"
                  />
                ) : (
                  <XCircleIcon className="mr-2 h-4 w-4" />
                )}
                Cancel Task
              </Button>
            )}
            {(isTaskOwner || isAdmin) && task.status === TaskStatus.OPEN && (
              <Button
                variant="outline"
                onClick={handleDeleteTask}
                disabled={isDeletingTask}
                className="shadow-soft dark:shadow-soft-dark group text-destructive-500 hover:bg-destructive-50"
              >
                {isDeletingTask ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2Icon className="mr-2 h-4 w-4" />
                )}
                Delete Task
              </Button>
            )}
            {isTaskOwner && task.status === TaskStatus.IN_REVIEW && (
              <Button
                variant="default"
                onClick={handleCompleteTask}
                disabled={isCompletingTask}
                className="bg-success-500 hover:bg-success-600 shadow-primary dark:shadow-primary-dark group"
              >
                {isCompletingTask ? (
                  <LoadingSpinner
                    size="sm"
                    color="text-primary-foreground"
                    className="mr-2"
                  />
                ) : (
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                )}
                Mark as Completed
              </Button>
            )}
          </div>
        )}
    </motion.div>
  );
}
export function TaskBidsSection({ taskId, initialTask }: ProjectSectionProps) {
  const { user, isFreelancer } = useAuth();
  const { taskDetails } = useTasks({ q: taskId });
  const task = taskDetails || initialTask;
  const bids: Bid[] = (task as any)?.bids || [];
  const myBid = user
    ? bids.find((bid) => bid.freelancerId === user.id)
    : undefined;
  const isTaskOwner = user?.id === task.clientId;
  const canBid = isFreelancer && task.status === TaskStatus.OPEN;

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border bg-card shadow-medium p-6"
    >
      <h3 className="text-h4 font-bold mb-4">
        Bids ({task._count?.bids || 0})
      </h3>
      {canBid && !myBid && <BidForm taskId={taskId} />}
      {myBid && <MyBidCard bid={myBid} />}
      {isTaskOwner &&
        bids.map((bid: Bid) => (
          <BidCard
            key={bid.id}
            bid={bid}
            isTaskOwner={isTaskOwner}
            taskId={taskId}
          />
        ))}
      {isTaskOwner && bids.length === 0 && (
        <p className="text-body-md text-center py-4">No bids submitted yet.</p>
      )}
    </motion.div>
  );
}

const BidCardSkeleton = () => (
  <Card className="h-56 w-full rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark">
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


export function ChatSection({ taskId, initialTask }: ProjectSectionProps) {
  const { user, isLoading } = useAuth(); // <--- isLoading is crucial
  // <--- CRITICAL: Get isSocketConnecting and isSocketConnected from useChat hook
  const { isSocketConnecting, isSocketConnected } = useChat(taskId);

  const isTaskOwner = user?.id === initialTask.clientId;
  const isAssignedFreelancer = user?.id === initialTask.freelancerId;

  // 1. Show loading for AuthProvider's initial check
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6 flex justify-center items-center h-[300px]"
      >
        <LoadingSpinner size="md" className="mr-2" /> Loading chat
        authorization...
      </motion.div>
    );
  }

  // 2. Show Unauthorized if user is not client/freelancer for this task AFTER auth loads
  if (!isTaskOwner && !isAssignedFreelancer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6"
      >
        <Alert variant="default">
          <MessageSquareTextIcon className="h-4 w-4" />
          <AlertTitle>Chat Unavailable</AlertTitle>
          <AlertDescription>
            You must be the client or the assigned freelancer to access the
            project chat.
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
      className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6"
    >
      <h3 className="text-h4 font-bold mb-4 flex items-center">
        <MessageSquareTextIcon className="mr-2 h-5 w-5 text-primary-500" />{" "}
        Project Chat
      </h3>
      <ChatWindow taskId={taskId} />
    </motion.div>
  );
}
