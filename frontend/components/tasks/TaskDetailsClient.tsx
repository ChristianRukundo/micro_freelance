// frontend/components/tasks/TaskDetailsClient.tsx

"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Task, UserRole, Bid, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DollarSignIcon,
  ClockIcon,
  HammerIcon,
  CheckCircle2Icon,
  XCircleIcon,
  FileTextIcon,
  MessageSquareTextIcon,
  TriangleAlertIcon,
  PencilIcon,
  Trash2Icon,
  TagIcon,
} from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { TaskDetailsSkeleton } from "@/components/common/SkeletonLoaders";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { BidCard } from "@/components/cards/BidCard"; // FIX: Corrected import
import { BidForm } from "@/components/forms/BidForm";
import { MyBidCard } from "@/components/cards/MyBidCard";
import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Image from "next/image";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ChatWindow } from "../chat/ChatWindow";
import { MilestoneManagement } from "./MilestoneManagement";

interface TaskDetailsClientProps {
  taskId: string;
  initialTask: Task;
}

// FIX: Correctly typed Framer Motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function TaskDetailsClient({
  taskId,
  initialTask,
}: TaskDetailsClientProps) {
  const { user, isFreelancer, isAdmin } = useAuth();
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
  console.log(task);

  if (isLoadingTaskDetails && !task) return <TaskDetailsSkeleton />;
  if (isErrorTaskDetails)
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error Loading Task</AlertTitle>
        <AlertDescription>{errorTaskDetails?.message}</AlertDescription>
      </Alert>
    );
  if (!task) return null; // Should be caught by notFound in page.tsx, but as a safeguard.

  const bids: Bid[] = (task as any)?.bids || [];
  const myBid = user
    ? bids.find((bid) => bid.freelancerId === user.id)
    : undefined;
  const isTaskOwner = user?.id === task.clientId;
  const canBid = isFreelancer && task.status === TaskStatus.OPEN;
  const imageAttachments =
    task.attachments?.filter((a) => a.fileType.startsWith("image/")) || [];
  const otherAttachments =
    task.attachments?.filter((a) => !a.fileType.startsWith("image/")) || [];

  // FIX: Added correct handler functions
  const handleCancelTask = async () => {
    if (
      window.confirm(
        "Are you sure you want to cancel this task? This action cannot be undone."
      )
    ) {
      await cancelTask(taskId).catch(() => {});
    }
  };
  const handleDeleteTask = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this task? This will remove all associated data."
      )
    ) {
      await deleteTask(taskId).catch(() => {});
    }
  };
  const handleCompleteTask = async () => {
    if (
      window.confirm(
        "Marking this task as completed will finalize the project. Are you sure?"
      )
    ) {
      await completeTask(taskId).catch(() => {});
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 lg:flex-row lg:items-start"
    >
      <motion.div
        variants={itemVariants}
        className="flex-1 space-y-6 lg:max-w-4xl"
      >
        <Card className="overflow-hidden shadow-lg dark:shadow-black/20">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <h1 className="text-display-sm font-extrabold">{task.title}</h1>
              <Badge
                variant="outline"
                className="text-body-md font-semibold px-4 py-2 flex-shrink-0"
              >
                {task.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <Card className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm">
                <div className="flex items-center" title="Budget">
                  <DollarSignIcon className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-semibold">
                    ${task.budget.toLocaleString()}
                  </span>
                </div>
                {task.deadline && (
                  <div className="flex items-center" title="Deadline">
                    <ClockIcon className="mr-2 h-4 w-4 text-primary" />
                    <span>Due by {formatDate(task.deadline)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Badge variant="secondary">
                    {task.category?.name || "Uncategorized"}
                  </Badge>
                </div>
                {task.skills && task.skills.length > 0 && (
                  <div
                    className="flex items-center flex-wrap gap-2"
                    title="Required Skills"
                  >
                    <TagIcon className="mr-1 h-4 w-4 text-primary" />
                    {task.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-body-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-h4 font-bold mb-3">Project Details</h3>
              <ReactMarkdown>{task.description}</ReactMarkdown>
            </article>
            {imageAttachments.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-h4 font-bold mb-4">Visuals</h3>
                <Carousel className="w-full rounded-lg overflow-hidden border shadow-soft dark:shadow-soft-dark">
                  <CarouselContent>
                    {imageAttachments.map((att) => (
                      <CarouselItem key={att.id}>
                        <Card className="border-0 shadow-none">
                          <CardContent className="flex aspect-video items-center justify-center p-0 relative">
                            <Image
                              src={att.url}
                              alt={att.fileName}
                              layout="fill"
                              objectFit="contain"
                              className="rounded-lg"
                            />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </motion.div>
            )}
            {otherAttachments.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-h4 font-bold mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {otherAttachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 rounded-md border p-3 hover:bg-muted transition-colors"
                    >
                      <FileTextIcon className="h-5 w-5 text-primary" />
                      <span className="text-body-sm font-medium truncate">
                        {att.fileName}
                      </span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
            <div className="!mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      task.client?.profile?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${task.client?.email || "C"}`
                    }
                  />
                  <AvatarFallback>
                    {(task.client?.profile?.firstName || "C").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  Posted by{" "}
                  <Link
                    href={`/users/${task.clientId}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {task.client?.profile?.firstName || "Client"}
                  </Link>{" "}
                  {formatRelativeTime(task.createdAt)}
                </span>
              </div>
              {task.freelancer && (
                <div className="flex items-center space-x-2">
                  <HammerIcon className="h-4 w-4 text-primary" />
                  <span>
                    Assigned to{" "}
                    <Link
                      href={`/freelancers/${task.freelancerId}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {task.freelancer.profile?.firstName || "Freelancer"}
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {(isTaskOwner || user?.id === task.freelancerId) &&
          task.status === TaskStatus.IN_PROGRESS && (
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg dark:shadow-black/20 p-6 md:p-8">
                <MilestoneManagement taskId={taskId} initialTask={task} />
              </Card>
            </motion.div>
          )}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
          {(isTaskOwner || isAdmin) && (
            <>
              {isTaskOwner && task.status === TaskStatus.OPEN && (
                <Link href={`/tasks/${taskId}/edit`} passHref>
                  <Button variant="outline">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit Task
                  </Button>
                </Link>
              )}
              {(task.status === TaskStatus.OPEN ||
                task.status === TaskStatus.IN_PROGRESS) && (
                <Button
                  variant="destructive-outline"
                  onClick={handleCancelTask}
                  disabled={isCancelingTask}
                >
                  {isCancelingTask ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <XCircleIcon className="mr-2 h-4 w-4" />
                  )}
                  Cancel Task
                </Button>
              )}
              {task.status === TaskStatus.OPEN && (
                <Button
                  variant="destructive-outline"
                  onClick={handleDeleteTask}
                  disabled={isDeletingTask}
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
                  onClick={handleCompleteTask}
                  disabled={isCompletingTask}
                  className="bg-success-500 hover:bg-success-600"
                >
                  {isCompletingTask ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  )}
                  Mark as Completed
                </Button>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 space-y-8"
      >
        <Card id="bid" className="shadow-lg dark:shadow-black/20">
          <CardContent className="p-6">
            <h3 className="text-h4 font-bold mb-4">
              Bids ({task._count?.bids || 0})
            </h3>
            {canBid && !myBid && <BidForm taskId={taskId} />}
            {myBid && <MyBidCard bid={myBid} />}
            {isTaskOwner && bids.length > 0 && (
              <div className="space-y-4 pt-4 border-t mt-4">
                {bids.map((bid) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    isTaskOwner={isTaskOwner}
                    taskId={taskId}
                  />
                ))}
              </div>
            )}
            {isTaskOwner && bids.length === 0 && (
              <p className="text-body-md text-center py-4 text-muted-foreground">
                No bids submitted yet.
              </p>
            )}
            {!isTaskOwner && !myBid && task.status !== TaskStatus.OPEN && (
              <Alert>
                <AlertTitle>Bidding Closed</AlertTitle>
                <AlertDescription>
                  This project is no longer accepting new bids.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        {(isTaskOwner || user?.id === task.freelancerId) && (
          <Card className="shadow-lg dark:shadow-black/20">
            <CardContent className="p-6">
              <h3 className="text-h4 font-bold mb-4 flex items-center">
                <MessageSquareTextIcon className="mr-2 h-5 w-5 text-primary" />{" "}
                Project Chat
              </h3>
              <ChatWindow taskId={taskId} />
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
