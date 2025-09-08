"use client";

import React from "react";
import { notFound } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Task, UserRole, Bid, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  CalendarIcon,
  ExternalLinkIcon,
  InfoIcon,
  UsersIcon,
  LinkIcon,
} from "lucide-react";
import { formatRelativeTime, formatDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { TaskDetailsSkeleton } from "@/components/common/SkeletonLoaders";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { BidCard } from "@/components/cards/BidCard";
import { BidForm } from "@/components/forms/BidForm";
import { MyBidCard } from "@/components/cards/MyBidCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { MilestoneManagement } from "@/components/tasks/MilestoneManagement";

interface TaskDetailsPageClientProps {
  taskId: string;
  isWorkspace: boolean;
}

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

// Reusable Action Dialog Component
const ActionDialog = ({
  triggerButton,
  title,
  description,
  onConfirm,
  isPending,
  actionLabel,
  actionVariant = "default",
}: {
  triggerButton: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  actionLabel: string;
  actionVariant?: "default" | "destructive";
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isPending}
          className={
            actionVariant === "destructive"
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              : ""
          }
        >
          {isPending && <LoadingSpinner size="sm" className="mr-2" />}
          {actionLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export function TaskDetailsPageClient({
  taskId,
  isWorkspace,
}: TaskDetailsPageClientProps) {
  const { user, isFreelancer, isAdmin } = useAuth();
  const {
    taskDetails: task,
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

  if (isLoadingTaskDetails) {
    return <TaskDetailsSkeleton />;
  }

  if (isErrorTaskDetails) {
    if (errorTaskDetails?.message.includes("404")) notFound();
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <TriangleAlertIcon className="h-4 w-4" />
          <AlertTitle>
            Error Loading {isWorkspace ? "Project" : "Task"}
          </AlertTitle>
          <AlertDescription>
            {errorTaskDetails?.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const bids: Bid[] = (task as any)?.bids || [];
  const myBid = user
    ? bids.find((bid) => bid.freelancerId === user.id)
    : undefined;
  const isTaskOwner = user?.id === task.clientId;
  const isAssignedFreelancer = task.freelancerId === user?.id;
  const canBid = isFreelancer && task.status === TaskStatus.OPEN;
  const imageAttachments =
    task.attachments?.filter((a) => a.fileType.startsWith("image/")) || [];
  const otherAttachments =
    task.attachments?.filter((a) => !a.fileType.startsWith("image/")) || [];
  const clientAvatarSeed =
    task.client?.profile?.firstName || task.client?.email || "Client";

  const TaskOverviewCard = (
    <Card className="overflow-hidden shadow-lg dark:shadow-black/20 bg-gradient-to-br from-card to-primary-50/10 dark:to-neutral-900/10 border-border/50">
      <CardContent className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 className="text-display-sm font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-300 dark:to-primary-500 drop-shadow-md">
            {task.title}
          </h1>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Badge
              variant="outline"
              className={`text-body-md font-semibold px-4 py-2 flex-shrink-0 border-2 ${task.status === TaskStatus.OPEN ? "bg-success-50 text-success-700 border-success-400" : task.status === TaskStatus.IN_PROGRESS ? "bg-warning-50 text-warning-700 border-warning-400" : task.status === TaskStatus.IN_REVIEW ? "bg-blue-50 text-blue-700 border-blue-400" : task.status === TaskStatus.COMPLETED ? "bg-neutral-100 text-neutral-700 border-neutral-400" : "bg-error-50 text-error-700 border-error-400"}`}
            >
              {task.status.replace(/_/g, " ")}
            </Badge>
          </motion.div>
        </div>
        <Card className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg border-dashed border-neutral-300 dark:border-neutral-700 shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-body-sm">
            <div
              className="flex items-center text-foreground font-medium"
              title="Budget"
            >
              <DollarSignIcon className="mr-2 h-5 w-5 text-green-500" />
              <span className="mr-1">Budget:</span>
              <span className="text-primary-600 dark:text-primary-400">
                ${task.budget.toLocaleString()}
              </span>
            </div>
            {task.deadline && (
              <div
                className="flex items-center text-foreground font-medium"
                title="Deadline"
              >
                <CalendarIcon className="mr-2 h-5 w-5 text-amber-500" />
                <span className="mr-1">Deadline:</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatDate(task.deadline)}
                </span>
              </div>
            )}
            <div
              className="flex items-center text-foreground font-medium"
              title="Category"
            >
              <LinkIcon className="mr-2 h-5 w-5 text-purple-500" />
              <span className="mr-1">Category:</span>
              <Badge
                variant="secondary"
                className="font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
              >
                {task.category?.name || "Uncategorized"}
              </Badge>
            </div>
            {task.skills && task.skills.length > 0 && (
              <div
                className="flex items-center flex-wrap gap-2 text-foreground font-medium sm:col-span-2 lg:col-span-3"
                title="Required Skills"
              >
                <TagIcon className="mr-1 h-5 w-5 text-cyan-500" />
                <span>Skills:</span>
                <div className="flex flex-wrap gap-2 ml-2">
                  {task.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-body-sm font-medium border-primary-200 text-primary-600 dark:border-primary-700 dark:text-primary-300"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
        <article className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
          <h3 className="text-h4 font-bold mb-3 text-foreground">
            Project Details
          </h3>
          <ReactMarkdown>{task.description}</ReactMarkdown>
        </article>
        {imageAttachments.length > 0 && (
          <motion.div variants={itemVariants}>
            <h3 className="text-h4 font-bold mb-4 text-foreground">
              Visual References
            </h3>
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
            <h3 className="text-h4 font-bold mb-4 text-foreground">
              Supporting Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherAttachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 rounded-lg border border-primary-200 p-3 bg-primary-50 hover:bg-primary-100 transition-colors shadow-sm"
                >
                  <FileTextIcon className="h-5 w-5 text-primary-600" />
                  <span className="text-body-sm font-medium truncate text-primary-800">
                    {att.fileName}
                  </span>
                  <ExternalLinkIcon className="h-4 w-4 text-primary-500 ml-auto" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
        <div className="!mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-body-sm">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50"
          >
            <Avatar className="h-9 w-9 border border-primary-300 shadow-sm">
              <AvatarImage
                src={
                  task.client?.profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${clientAvatarSeed}`
                }
              />
              <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold text-body-md">
                {clientAvatarSeed.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>
              Posted by{" "}
              <Link
                href={`/users/${task.clientId}`}
                className="font-semibold text-primary-600 hover:underline"
              >
                {task.client?.profile?.firstName || "Client"}
              </Link>{" "}
              <span className="text-muted-foreground">
                {formatRelativeTime(task.createdAt)}
              </span>
            </span>
          </motion.div>
          {task.freelancer && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex items-center space-x-2 p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50"
            >
              <HammerIcon className="h-5 w-5 text-primary-600" />
              <span>
                Assigned to{" "}
                <Link
                  href={`/freelancers/${task.freelancerId}`}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  {task.freelancer.profile?.firstName || "Freelancer"}
                </Link>
              </span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TaskActionButtons = (
    <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
      {(isTaskOwner || isAdmin) && (
        <>
          {isTaskOwner && task.status === TaskStatus.OPEN && (
            <Link href={`/tasks/${taskId}/edit`} passHref>
              <Button
                variant="outline"
                className="group shadow-soft dark:shadow-soft-dark border-primary-300 text-primary-600 hover:bg-primary-50"
              >
                <PencilIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Edit Task
              </Button>
            </Link>
          )}
          {(task.status === TaskStatus.OPEN ||
            task.status === TaskStatus.IN_PROGRESS ||
            task.status === TaskStatus.IN_REVIEW) && (
            <ActionDialog
              title="Are you sure you want to cancel this project?"
              description="This action cannot be undone. If a freelancer is already assigned, this may impact your platform rating. All milestones will be voided."
              onConfirm={() => cancelTask(taskId)}
              isPending={isCancelingTask}
              actionLabel="Yes, Cancel Project"
              actionVariant="destructive"
              triggerButton={
                <Button
                  variant="destructive-outline"
                  disabled={isCancelingTask}
                  className="group shadow-soft hover:bg-error-50 dark:hover:bg-error-900/20"
                >
                  <XCircleIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                  Cancel Task
                </Button>
              }
            />
          )}
          {isTaskOwner && task.status === TaskStatus.OPEN && (
            <ActionDialog
              title="Are you sure you want to delete this project?"
              description="This will permanently delete the project and all its associated data, including bids and attachments. This action cannot be undone."
              onConfirm={() => deleteTask(taskId)}
              isPending={isDeletingTask}
              actionLabel="Yes, Delete Permanently"
              actionVariant="destructive"
              triggerButton={
                <Button
                  variant="destructive-outline"
                  disabled={isDeletingTask}
                  className="group shadow-soft hover:bg-error-50 dark:hover:bg-error-900/20"
                >
                  <Trash2Icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Delete Task
                </Button>
              }
            />
          )}
          {isTaskOwner && task.status === TaskStatus.IN_REVIEW && (
            <ActionDialog
              title="Mark Project as Completed?"
              description="This will finalize the project, release the final payment to the freelancer (if applicable), and allow you to leave a review. Are you sure?"
              onConfirm={() => completeTask(taskId)}
              isPending={isCompletingTask}
              actionLabel="Yes, Mark as Completed"
              triggerButton={
                <Button
                  disabled={isCompletingTask}
                  className="bg-gradient-to-r from-success-500 to-success-600 text-primary-foreground shadow-md group"
                >
                  <CheckCircle2Icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Mark as Completed
                </Button>
              }
            />
          )}
        </>
      )}
    </motion.div>
  );

  const BidsSection = (
    <Card
      id="bid"
      className="shadow-lg dark:shadow-black/20 bg-gradient-to-br from-card to-primary-50/10 dark:to-neutral-900/10 border-border/50"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-h4 font-bold flex items-center gap-2 text-foreground">
          <UsersIcon className="h-5 w-5 text-primary-500" /> Bids (
          {task._count?.bids || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {canBid && !myBid && (
          <motion.div variants={itemVariants}>
            <BidForm taskId={taskId} />
          </motion.div>
        )}
        {myBid && (
          <motion.div variants={itemVariants}>
            <MyBidCard bid={myBid} />
          </motion.div>
        )}
        {isTaskOwner && bids.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border/30 mt-4">
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
  );

  const showWorkspacePanels = isTaskOwner || isAssignedFreelancer;

  return (
    <div className="container py-8">
      {isWorkspace && (
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-display-md font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-300 dark:to-primary-500 drop-shadow-md">
            Project Workspace
          </h1>
          <p className="text-body-lg text-muted-foreground mt-2 max-w-2xl">
            Manage &quot;{task.title}&quot; - track progress, communicate, and
            handle payments effectively.
          </p>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid grid-cols-1 gap-8 ${showWorkspacePanels ? "lg:grid-cols-3" : "lg:grid-cols-1"}`}
      >
        <motion.div
          variants={itemVariants}
          className={`space-y-6 ${showWorkspacePanels ? "lg:col-span-2" : "lg:col-span-1"}`}
        >
          {TaskOverviewCard}
          {(isTaskOwner || isAdmin) && TaskActionButtons}
        </motion.div>

        <div className="lg:col-span-1 space-y-8">
          <motion.div variants={itemVariants}>{BidsSection}</motion.div>
          {showWorkspacePanels && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg dark:shadow-black/20 bg-gradient-to-br from-card to-secondary-50/10 dark:to-neutral-900/10 border-border/50 p-6 md:p-8">
                  <MilestoneManagement taskId={taskId} initialTask={task} />
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg dark:shadow-black/20 bg-gradient-to-br from-card to-tertiary-50/10 dark:to-neutral-900/10 border-border/50 p-6 md:p-8">
                  <h3 className="text-h3 font-bold mb-4 flex items-center gap-2 text-foreground">
                    <MessageSquareTextIcon className="h-6 w-6 text-primary-500" />{" "}
                    Project Chat
                  </h3>
                  <ChatWindow taskId={taskId} />
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
