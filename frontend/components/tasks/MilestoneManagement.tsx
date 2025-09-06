"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Milestone, MilestoneStatus, Task, TaskStatus } from "@/lib/types";
import { requestRevisionSchema } from "@/lib/schemas";
import { useMilestones } from "@/hooks/useMilestones";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDate, isPastDate } from "@/lib/date";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/common/SkeletonLoaders";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MilestoneForm } from "@/components/forms/MilestoneForm";

import {
  PlusCircleIcon,
  ListChecksIcon,
  RotateCcwIcon,
  AwardIcon,
  CheckCircle2Icon,
  TriangleAlertIcon,
} from "lucide-react";

interface MilestoneSectionProps {
  taskId: string;
  initialTask: Task;
}

// --- Milestone Management Section ---
export function MilestoneManagement({ taskId, initialTask }: MilestoneSectionProps) {
  const { user } = useAuth();
  const {
    milestones,
    isLoadingMilestones,
    isErrorMilestones,
    errorMilestones,
  } = useMilestones(taskId);

  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = React.useState(false);

  const isTaskOwner = user?.id === initialTask.clientId;

  // Calculate progress percentage
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter(
    (m) => m.status === MilestoneStatus.APPROVED
  ).length;
  const progressPercentage =
    totalMilestones > 0
      ? Math.round((approvedMilestones / totalMilestones) * 100)
      : 0;

  if (isLoadingMilestones)
    return (
      <div className="space-y-4 p-6">
        <h3 className="text-h4 font-bold mb-4">
          <Skeleton className="h-8 w-1/3" />
        </h3>
        <Skeleton className="h-4 w-full" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border p-4 space-y-2"
          >
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

  if (isErrorMilestones)
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading milestones</AlertTitle>
        <AlertDescription>
          {errorMilestones?.message}
        </AlertDescription>
      </Alert>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-bold">Milestones ({totalMilestones})</h3>
        {isTaskOwner && initialTask.status === TaskStatus.IN_PROGRESS && (
          <Dialog
            open={isMilestoneFormOpen}
            onOpenChange={setIsMilestoneFormOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Create Milestones
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Project Milestones</DialogTitle>
                <DialogDescription>
                  Define measurable deliverables, due dates, and payment amounts.
                </DialogDescription>
              </DialogHeader>
              <MilestoneForm
                taskId={taskId}
                onSuccess={() => setIsMilestoneFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {milestones.length === 0 ? (
        <p className="text-body-md text-center py-4 text-muted-foreground">
          {isTaskOwner
            ? "No milestones defined yet. Click 'Create Milestones' to start."
            : "No milestones defined for this project."}
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-body-sm">
              <span>Progress:</span>
              <span className="font-medium">
                {progressPercentage}% Complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                isTaskOwner={isTaskOwner}
                isAssignedFreelancer={user?.id === initialTask.freelancerId}
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

function MilestoneCard({
  milestone,
  isTaskOwner,
  isAssignedFreelancer,
}: MilestoneCardProps) {
  const {
    submitMilestone,
    isSubmittingMilestone,
    requestMilestoneRevision,
    isRequestingMilestoneRevision,
    approveMilestone,
    isApprovingMilestone,
  } = useMilestones(milestone.taskId);

  const revisionForm = useForm<{ comments: string }>({
    resolver: zodResolver(requestRevisionSchema),
    defaultValues: { comments: milestone.comments || "" },
  });

  const handleAction = async (
    actionFn: (vars: { milestoneId: string; values?: any }) => Promise<any>,
    values?: any
  ) => {
    try {
      await actionFn({ milestoneId: milestone.id, values });
      toast.success("Milestone updated successfully!");
      if (values) {
        const dialogClose = document.getElementById(`close-revision-dialog-${milestone.id}`);
        dialogClose?.click();
      }
    } catch (error) {
      // Error toast is handled by the hook
    }
  };

  const isOverdue =
    milestone.status !== MilestoneStatus.COMPLETED &&
    milestone.status !== MilestoneStatus.APPROVED &&
    isPastDate(new Date(milestone.dueDate));

  return (
    <Card className="p-4 space-y-3 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h4 className="text-h6 font-semibold flex items-center">
          <ListChecksIcon className="h-5 w-5 mr-2 text-primary" />
          {milestone.description}
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              milestone.status === MilestoneStatus.APPROVED && "bg-success-100 text-success-800",
              milestone.status === MilestoneStatus.SUBMITTED && "bg-warning-100 text-warning-800",
              milestone.status === MilestoneStatus.REVISION_REQUESTED && "bg-error-100 text-error-800",
            )}
          >
            {milestone.status.replace(/_/g, " ")}
          </Badge>
          <span className={cn("text-body-sm", isOverdue && "text-destructive font-medium")}>
            Due: {formatDate(new Date(milestone.dueDate))} {isOverdue && "(Overdue)"}
          </span>
          <span className="text-body-sm font-semibold">
            ${milestone.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {milestone.status === MilestoneStatus.REVISION_REQUESTED && milestone.comments && (
        <Alert variant="destructive" className="ml-7">
          <RotateCcwIcon className="h-4 w-4" />
          <AlertTitle>Revision Requested</AlertTitle>
          <AlertDescription>{milestone.comments}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 justify-end">
        {isAssignedFreelancer &&
          (milestone.status === MilestoneStatus.PENDING ||
            milestone.status === MilestoneStatus.REVISION_REQUESTED) && (
            <Button
              size="sm"
              onClick={() => handleAction(submitMilestone)}
              disabled={isSubmittingMilestone}
            >
              {isSubmittingMilestone ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <CheckCircle2Icon className="mr-2 h-4 w-4" />
              )}
              Submit Work
            </Button>
          )}

        {isTaskOwner && milestone.status === MilestoneStatus.SUBMITTED && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <RotateCcwIcon className="mr-2 h-4 w-4" /> Request Revision
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Revision</DialogTitle>
                  <DialogDescription>
                    Provide detailed feedback for the revision.
                  </DialogDescription>
                </DialogHeader>
                <Form {...revisionForm}>
                  <form
                    onSubmit={revisionForm.handleSubmit((values) =>
                      handleAction(requestMilestoneRevision, values)
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={revisionForm.control}
                      name="comments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comments</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain what needs to be revised..."
                              {...field}
                              className="min-h-[100px]"
                              disabled={isRequestingMilestoneRevision}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild id={`close-revision-dialog-${milestone.id}`}>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isRequestingMilestoneRevision}>
                        {isRequestingMilestoneRevision && (
                          <LoadingSpinner size="sm" className="mr-2" />
                        )}
                        Submit Request
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
              className="bg-success hover:bg-success/90"
            >
              {isApprovingMilestone ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <AwardIcon className="mr-2 h-4 w-4" />
              )}
              Approve Milestone
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
