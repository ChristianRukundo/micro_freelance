"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Import z from zod
import { toast } from "sonner";
import Image from "next/image";

import {
  Milestone,
  MilestoneStatus,
  Task,
  TaskStatus,
  MilestoneAttachment,
} from "@/lib/types";
import {
  requestRevisionSchema,
  submitMilestoneSchema,
  addAttachmentCommentSchema,
} from "@/lib/schemas";
import { useMilestones } from "@/hooks/useMilestones";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { formatDate, isPastDate } from "@/lib/date";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useUpload } from "@/hooks/useUpload";
import { useDropzone } from "react-dropzone";

import {
  PlusCircleIcon,
  ListChecksIcon,
  RotateCcwIcon,
  AwardIcon,
  CheckCircle2Icon,
  TriangleAlertIcon,
  UploadCloudIcon,
  FileTextIcon,
  Trash2Icon,
  XIcon,
  MessageCircleIcon,
  EyeIcon,
  FileWarningIcon,
  InfoIcon,
  CalendarIcon,
} from "lucide-react";
import { Label } from "../ui/label";

interface MilestoneSectionProps {
  taskId: string;
  initialTask: Task;
}

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10, duration: 0.5 },
  },
};

export function MilestoneManagement({
  taskId,
  initialTask,
}: MilestoneSectionProps) {
  const { user } = useAuth();
  const {
    milestones,
    isLoadingMilestones,
    isErrorMilestones,
    errorMilestones,
  } = useMilestones(taskId);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);

  const isTaskOwner = user?.id === initialTask.clientId;
  const isAssignedFreelancer = user?.id === initialTask.freelancerId;

  // Calculate progress percentage
  const totalMilestones = milestones.length;
  const approvedMilestones = milestones.filter(
    (m) => m.status === MilestoneStatus.APPROVED
  ).length;
  const progressPercentage =
    totalMilestones > 0
      ? Math.round((approvedMilestones / totalMilestones) * 100)
      : 0;

  if (isLoadingMilestones) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="space-y-4 p-6"
      >
        <h3 className="text-h4 font-bold mb-4">
          <Skeleton className="h-8 w-1/3" />
        </h3>
        <Skeleton className="h-4 w-full" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="rounded-xl border p-4 space-y-2">
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
      </motion.div>
    );
  }

  if (isErrorMilestones) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon className="h-4 w-4" />
        <AlertTitle>Error loading milestones</AlertTitle>
        <AlertDescription>{errorMilestones?.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-h4 font-bold">
          Project Milestones ({totalMilestones})
        </h3>
        {isTaskOwner && initialTask.status === TaskStatus.IN_PROGRESS && (
          <Dialog
            open={isMilestoneFormOpen}
            onOpenChange={setIsMilestoneFormOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="gradient"
                className="shadow-primary dark:shadow-primary-dark group"
              >
                <PlusCircleIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />{" "}
                Create Milestones
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Define Project Milestones</DialogTitle>
                <DialogDescription>
                  Break down the project into clear, manageable stages with
                  deliverables and payment.
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
        <Alert className="text-center py-8">
          <InfoIcon className="h-10 w-10 mx-auto text-muted-foreground" />
          <AlertTitle className="text-h4 mt-4">
            No Milestones Defined Yet
          </AlertTitle>
          <AlertDescription className="text-body-md mt-2">
            {isTaskOwner
              ? "As the client, you can create milestones to structure the project for your freelancer."
              : "The client has not yet defined any milestones for this project."}
          </AlertDescription>
          {isTaskOwner && initialTask.status === TaskStatus.IN_PROGRESS && (
            <Button
              onClick={() => setIsMilestoneFormOpen(true)}
              className="mt-6 group"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />{" "}
              Start Defining Milestones
            </Button>
          )}
        </Alert>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex justify-between text-body-sm font-semibold text-muted-foreground">
              <span>Overall Progress:</span>
              <span>{progressPercentage}% Completed</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2.5 rounded-full"
              indicatorClassName="bg-gradient-to-r from-primary-500 to-success-500"
            />
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  isTaskOwner={isTaskOwner}
                  isAssignedFreelancer={isAssignedFreelancer}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
}

// --- SUB-COMPONENTS FOR MILESTONE INTERACTION ---

// Freelancer's Submit Work Dialog
function SubmitWorkDialog({
  milestone,
  children,
}: {
  milestone: Milestone;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { submitMilestone, isSubmittingMilestone } = useMilestones(
    milestone.taskId
  );
  const { isUploading, uploadFiles } = useUpload();
  const [uploadedAttachments, setUploadedAttachments] = useState<
    z.infer<typeof submitMilestoneSchema>["attachments"]
  >([]);
  const [submissionNotes, setSubmissionNotes] = useState(
    milestone.submissionNotes || ""
  );

  const onFileDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error("No files selected or invalid file type.");
        return;
      }
      try {
        // Filter out files that already exist in uploadedAttachments to prevent duplicates
        const uniqueFiles = acceptedFiles.filter(
          (newFile) =>
            !uploadedAttachments.some(
              (existing) => existing.fileName === newFile.name
            )
        );

        if (uniqueFiles.length < acceptedFiles.length) {
          toast.warning("Some files were duplicates and not added.");
        }
        if (uniqueFiles.length === 0) return;

        const results = await uploadFiles(uniqueFiles, "milestone-submissions");
        const newAttachments = results.map((r) => ({
          url: r.url,
          fileName: r.fileName,
          fileType: r.fileType,
        }));
        setUploadedAttachments((prev) => [...prev, ...newAttachments]);
        toast.success(`${newAttachments.length} file(s) ready for submission.`);
      } catch (error) {
        // toast is handled by useUpload hook
      }
    },
    [uploadFiles, uploadedAttachments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
    disabled: isUploading || isSubmittingMilestone,
    maxSize: 20 * 1024 * 1024,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/zip": [],
      "text/*": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
  });

  // Dropzone root props
  const { ref, ...allProps } = getRootProps();

  const {
    onDrag,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    ...rootProps
  } = allProps;

  const handleRemoveFile = (url: string) => {
    setUploadedAttachments((prev) => prev.filter((att) => att.url !== url));
    toast.info("Attachment removed from submission list.");
  };

  const handleSubmit = async () => {
    if (uploadedAttachments.length === 0) {
      toast.error("Please upload at least one file as proof of work.");
      return;
    }
    try {
      await submitMilestone({
        milestoneId: milestone.id,
        values: { attachments: uploadedAttachments, submissionNotes },
      });
      setIsOpen(false);
      setUploadedAttachments([]); // Clear attachments after successful submission
      setSubmissionNotes(""); // Clear notes
    } catch (error) {
      // toast handled by hook
    }
  };

  useEffect(() => {
    if (isOpen) {
      // When dialog opens, initialize attachments with current milestone attachments if any
      setUploadedAttachments(milestone.attachments || []);
      setSubmissionNotes(milestone.submissionNotes || "");
    }
  }, [isOpen, milestone.attachments, milestone.submissionNotes]);

  const fileDropzoneText = isUploading ? (
    <>
      <LoadingSpinner className="mr-2" /> Uploading files...
    </>
  ) : isDragActive ? (
    "Drop your files here..."
  ) : (
    "Drag & drop files here, or click to select"
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-card to-muted/10 shadow-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-h3 font-bold text-primary-700 dark:text-primary-300">
            Submit Work for Review
          </DialogTitle>
          <DialogDescription className="text-body-md text-muted-foreground">
            Upload your completed files and add any final notes for milestone: "
            <span className="font-semibold text-foreground">
              {milestone.description}
            </span>
            "
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* File Dropzone */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            aria-disabled={isUploading || isSubmittingMilestone}
            className="w-full"
          >
            <div
              ref={ref}
              {...rootProps}
              className={cn(
                "flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer",
                "bg-background/80 hover:bg-primary-50 dark:hover:bg-neutral-800",
                isDragActive
                  ? "border-primary-500 bg-primary-100 dark:bg-neutral-800"
                  : "border-neutral-300 dark:border-neutral-700",
                (isUploading || isSubmittingMilestone) &&
                  "opacity-60 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <UploadCloudIcon className="h-10 w-10 text-primary-500/80 dark:text-primary-300/80 mb-2" />
              <p className="text-body-md font-medium text-foreground">
                {fileDropzoneText}
              </p>
              <p className="text-caption text-muted-foreground mt-1">
                Max 20MB per file. Common file types accepted.
              </p>
            </div>
          </motion.div>
          {/* Uploaded Attachments Preview */}
          {uploadedAttachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <h4 className="font-semibold text-h6 text-foreground flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-primary-500" /> Files for
                Submission ({uploadedAttachments.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uploadedAttachments.map((att) => (
                  <motion.div
                    key={att.url}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 bg-neutral-50/70 dark:bg-neutral-800/70 shadow-sm">
                      <div className="flex items-center gap-3 truncate">
                        <FileTextIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                        <span className="truncate text-body-sm font-medium">
                          {att.fileName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive-500 hover:bg-destructive-50"
                        onClick={() => handleRemoveFile(att.url)}
                        disabled={isSubmittingMilestone}
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Submission Notes */}
          <div>
            <Label
              htmlFor="submission-notes"
              className="text-h6 font-semibold flex items-center gap-2"
            >
              <MessageCircleIcon className="h-5 w-5 text-primary-500" />{" "}
              Submission Notes (Optional)
            </Label>
            <Textarea
              id="submission-notes"
              placeholder="Add any specific notes or instructions about your submitted work..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="min-h-[120px] mt-2 shadow-soft dark:shadow-soft-dark"
              disabled={isUploading || isSubmittingMilestone}
            />
          </div>
        </div>
        <DialogFooter className="bg-gradient-to-t from-background/50 to-transparent pt-4 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={isSubmittingMilestone}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isUploading ||
              isSubmittingMilestone ||
              uploadedAttachments.length === 0
            }
            className="bg-gradient-to-r from-primary-600 to-primary-500 text-primary-foreground shadow-primary dark:shadow-primary-dark group"
          >
            {isSubmittingMilestone ? (
              <LoadingSpinner
                size="sm"
                color="text-primary-foreground"
                className="mr-2"
              />
            ) : (
              <CheckCircle2Icon className="mr-2 h-4 w-4" />
            )}
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Client's Attachment Viewer with Commenting
function AttachmentViewer({ milestone }: { milestone: Milestone }) {
  const [selectedAttachment, setSelectedAttachment] =
    useState<MilestoneAttachment | null>(null);
  const { addAttachmentComment, isAddingAttachmentComment } = useMilestones(
    milestone.taskId
  );
  const { user } = useAuth();
  const isTaskOwner = user?.id === milestone.task?.clientId;

  const form = useForm<{ comment: string }>({
    resolver: zodResolver(addAttachmentCommentSchema),
    defaultValues: { comment: selectedAttachment?.comments || "" },
    values: { comment: selectedAttachment?.comments || "" }, // Keep form synced with selected attachment
  });

  // Reset form when selectedAttachment changes
  useEffect(() => {
    form.reset({ comment: selectedAttachment?.comments || "" });
  }, [selectedAttachment, form]);

  const handleCommentSubmit = async (values: { comment: string }) => {
    if (!selectedAttachment) return;
    try {
      await addAttachmentComment({
        attachmentId: selectedAttachment.id,
        values,
      });
      // Update the local state of the selected attachment
      setSelectedAttachment((prev) =>
        prev ? { ...prev, comments: values.comment } : null
      );
      toast.success("Comment saved!");
      form.reset({ comment: values.comment }); // Update form to show new comment
    } catch (error) {}
  };

  return (
    <>
      <div className="pl-7 pt-2">
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
          <FileWarningIcon className="h-5 w-5 text-amber-500" /> Submitted Files
          for Review ({milestone.attachments?.length || 0})
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {milestone.attachments?.map((att) => (
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              key={att.id}
            >
              <button
                onClick={() => setSelectedAttachment(att)}
                className="w-full text-left flex items-center gap-3 rounded-lg border border-neutral-200 p-3 bg-neutral-50 hover:bg-primary-50 transition-colors shadow-sm"
              >
                <FileTextIcon className="h-5 w-5 text-primary-600 flex-shrink-0" />
                <div className="truncate flex-1">
                  <p className="text-sm font-medium truncate">{att.fileName}</p>
                  {att.comments && (
                    <p className="text-xs text-amber-600 truncate flex items-center gap-1">
                      <MessageCircleIcon className="h-3 w-3" /> Client commented
                    </p>
                  )}
                </div>
                <EyeIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedAttachment}
        onOpenChange={(open) => !open && setSelectedAttachment(null)}
      >
        <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-card to-muted/10 shadow-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-h3 font-bold text-primary-700 dark:text-primary-300">
              Review Attachment:{" "}
              <span className="text-foreground">
                {selectedAttachment?.fileName}
              </span>
            </DialogTitle>
            <DialogDescription className="text-body-md text-muted-foreground">
              Provide feedback or download the file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* File Preview Area */}
            <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-200 shadow-inner">
              {selectedAttachment?.fileType.startsWith("image/") ? (
                <Image
                  src={selectedAttachment.url}
                  alt={selectedAttachment.fileName}
                  layout="fill"
                  objectFit="contain"
                  className="object-center"
                />
              ) : (
                <div className="text-center p-4">
                  <FileWarningIcon className="h-20 w-20 mx-auto text-muted-foreground/50" />
                  <p className="mt-4 text-body-md font-medium text-foreground">
                    File preview not available.
                  </p>
                  <p className="text-caption text-muted-foreground">
                    This file type cannot be displayed directly.
                  </p>
                  <a
                    href={selectedAttachment?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="sm"
                      className="mt-6 group bg-gradient-to-r from-primary-500 to-primary-600 shadow-md"
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" /> Download File
                    </Button>
                  </a>
                </div>
              )}
            </div>
            {/* Commenting Section */}
            <div className="space-y-4">
              <h4 className="text-h5 font-semibold flex items-center gap-2 text-foreground">
                <MessageCircleIcon className="h-5 w-5 text-primary-500" />{" "}
                Client Comments
              </h4>
              {selectedAttachment?.comments ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-body-sm border-l-4 border-amber-500 pl-4 py-2 bg-amber-50/50 dark:bg-amber-900/30 rounded-r-lg shadow-inner text-amber-800 dark:text-amber-200"
                >
                  {selectedAttachment.comments}
                </motion.p>
              ) : (
                <p className="text-body-sm text-muted-foreground">
                  No comments added for this file yet.
                </p>
              )}

              {isTaskOwner && (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleCommentSubmit)}
                    className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                  >
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Add / Edit Feedback
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed feedback on this specific file..."
                              {...field}
                              disabled={isAddingAttachmentComment}
                              className="min-h-[90px] shadow-soft dark:shadow-soft-dark"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isAddingAttachmentComment}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm group"
                    >
                      {isAddingAttachmentComment ? (
                        <LoadingSpinner
                          size="sm"
                          color="text-primary-foreground"
                          className="mr-2"
                        />
                      ) : (
                        <CheckCircle2Icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      )}
                      Save Feedback
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface MilestoneCardProps {
  milestone: Milestone;
  isTaskOwner: boolean;
  isAssignedFreelancer: boolean;
}

// Individual Milestone Card
function MilestoneCard({
  milestone,
  isTaskOwner,
  isAssignedFreelancer,
}: MilestoneCardProps) {
  const {
    requestMilestoneRevision,
    isRequestingMilestoneRevision,
    approveMilestone,
    isApprovingMilestone,
  } = useMilestones(milestone.taskId);
  const revisionForm = useForm<{ comments: string }>({
    resolver: zodResolver(requestRevisionSchema),
    defaultValues: { comments: milestone.revisionNotes || "" },
  });

  const handleAction = async (
    actionFn: (vars: { milestoneId: string; values?: any }) => Promise<any>,
    values?: any
  ) => {
    try {
      await actionFn({ milestoneId: milestone.id, values });
      if (values?.comments) {
        const dialogClose = document.getElementById(
          `close-revision-dialog-${milestone.id}`
        );
        dialogClose?.click();
      }
    } catch (error) {}
  };

  const isOverdue =
    milestone.status !== MilestoneStatus.APPROVED &&
    milestone.status !== MilestoneStatus.COMPLETED &&
    isPastDate(new Date(milestone.dueDate));

  return (
    <motion.div
      key={milestone.id}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={itemVariants}
      layout
      className="rounded-xl overflow-hidden shadow-medium dark:shadow-medium-dark bg-gradient-to-br from-card to-muted/10 border border-border/50"
    >
      <CardContent className="p-6 space-y-4">
        {/* Milestone Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-border/30">
          <h4 className="text-h5 font-bold flex items-center gap-2 text-foreground">
            <ListChecksIcon className="h-6 w-6 text-primary-500" />{" "}
            {milestone.description}
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "font-semibold text-body-sm px-3 py-1",
                milestone.status === MilestoneStatus.APPROVED &&
                  "bg-success-50 text-success-700 border-success-200",
                milestone.status === MilestoneStatus.SUBMITTED &&
                  "bg-warning-50 text-warning-700 border-warning-200",
                milestone.status === MilestoneStatus.REVISION_REQUESTED &&
                  "bg-error-50 text-error-700 border-error-200"
              )}
            >
              {milestone.status.replace(/_/g, " ")}
            </Badge>
            <Badge
              variant="secondary"
              className="font-semibold text-body-sm px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-foreground"
            >
              ${milestone.amount.toLocaleString()}
            </Badge>
          </div>
        </div>

        {/* Milestone Details & Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-body-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 text-primary-400" />
            <span
              className={cn(isOverdue && "text-destructive-500 font-medium")}
            >
              Due Date: {formatDate(new Date(milestone.dueDate))}{" "}
              {isOverdue && "(Overdue)"}
            </span>
          </div>

          {milestone.submissionNotes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-2 pl-7 py-2"
            >
              <MessageCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <p className="text-body-sm italic text-blue-800 dark:text-blue-200 bg-blue-50/50 dark:bg-blue-900/30 border-l-4 border-blue-500 pl-3 py-1 rounded-r-lg shadow-inner">
                <span className="font-semibold">Freelancer's Note:</span> "
                {milestone.submissionNotes}"
              </p>
            </motion.div>
          )}

          {milestone.attachments && milestone.attachments.length > 0 && (
            <AttachmentViewer milestone={milestone} />
          )}

          {milestone.status === MilestoneStatus.REVISION_REQUESTED &&
            milestone.revisionNotes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Alert
                  variant="destructive"
                  className="ml-7 bg-error-50/50 dark:bg-error-900/30 border-error-500 text-error-800 dark:text-error-200"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  <AlertTitle className="text-h6 font-bold">
                    Revision Requested!
                  </AlertTitle>
                  <AlertDescription className="text-body-sm">
                    {milestone.revisionNotes}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-border/30">
          {isAssignedFreelancer &&
            (milestone.status === MilestoneStatus.PENDING ||
              milestone.status === MilestoneStatus.REVISION_REQUESTED) && (
              <SubmitWorkDialog milestone={milestone}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-success-500 to-success-600 text-primary-foreground shadow-md group"
                >
                  <CheckCircle2Icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />{" "}
                  Submit Work
                </Button>
              </SubmitWorkDialog>
            )}
          {isTaskOwner && milestone.status === MilestoneStatus.SUBMITTED && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="primary-outline"
                    className="shadow-soft dark:shadow-soft-dark group"
                  >
                    <RotateCcwIcon className="mr-2 h-4 w-4 text-primary-500 transition-transform group-hover:rotate-45" />{" "}
                    Request Revision
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-card to-muted/10 shadow-xl border-border/50">
                  <DialogHeader>
                    <DialogTitle className="text-h4 font-bold text-primary-700 dark:text-primary-300">
                      Request Revision
                    </DialogTitle>
                    <DialogDescription className="text-body-md text-muted-foreground">
                      Provide detailed feedback to the freelancer for this
                      milestone.
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
                            <FormLabel className="text-sm font-medium flex items-center gap-1">
                              <MessageCircleIcon className="h-4 w-4" /> Revision
                              Details
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain what needs to be revised, referencing specific files if needed (e.g., 'File X needs color adjustments')..."
                                {...field}
                                className="min-h-[120px] shadow-soft dark:shadow-soft-dark"
                                disabled={isRequestingMilestoneRevision}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter className="pt-4">
                        <DialogClose
                          asChild
                          id={`close-revision-dialog-${milestone.id}`}
                        >
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isRequestingMilestoneRevision}
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          disabled={isRequestingMilestoneRevision}
                          className="bg-gradient-to-r from-destructive-500 to-destructive-600 text-primary-foreground shadow-md group"
                        >
                          {isRequestingMilestoneRevision ? (
                            <LoadingSpinner
                              size="sm"
                              color="text-primary-foreground"
                              className="mr-2"
                            />
                          ) : (
                            <RotateCcwIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                          )}
                          Request Revision
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
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-primary-foreground shadow-primary dark:shadow-primary-dark group"
              >
                {isApprovingMilestone ? (
                  <LoadingSpinner
                    size="sm"
                    color="text-primary-foreground"
                    className="mr-2"
                  />
                ) : (
                  <AwardIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                Approve & Pay (Mock)
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </motion.div>
  );
}

// Ensure DownloadIcon is available, usually from lucide-react or custom if needed
function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
