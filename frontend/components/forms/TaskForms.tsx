'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Category, TaskStatus } from '@/lib/types';
import { format } from 'date-fns';
import { CalendarIcon, UploadCloudIcon, FileTextIcon, Trash2Icon, Loader2Icon, ChevronLeftIcon, ChevronRightIcon, CheckCircle2Icon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '@/hooks/useUpload';
import ReactMarkdown from 'react-markdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import * as actions from '@/lib/actions';
import { createTaskSchema } from '@/lib/schemas';
import { useCategories } from '@/hooks/useTasks'; // Reusing categories hook
import { motion } from 'framer-motion';


// Zod Schema for Task Creation
const taskFormSchema = createTaskSchema;
type TaskFormInput = z.infer<typeof taskFormSchema>;

interface TaskFormsProps {
  formType: 'new' | 'edit';
  initialData?: TaskFormInput & { id?: string }; // For edit mode, includes task id
  taskId?: string; // For edit mode, passed separately
}

export function TaskForms({ formType, initialData, taskId }: TaskFormsProps) {
  const router = useRouter();
  const { categories, isLoadingCategories } = useCategories(); // Fetch categories
  const { isUploading, uploadFiles, removeFile: removeS3File } = useUpload(); // Custom hook for S3 uploads

  const [currentStep, setCurrentStep] = useState(1);
  const [descriptionPreview, setDescriptionPreview] = useState('');

  // Local state for files being processed for upload
  const [filesToProcess, setFilesToProcess] = useState<
    Array<{ id: string; file: File; status: 'pending' | 'uploading' | 'completed' | 'failed'; progress: number; s3Key?: string; url?: string }>
  >([]);

  const form = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      budget: initialData?.budget || 100,
      deadline: initialData?.deadline || "",
      categoryId: initialData?.categoryId || '',
      attachments: initialData?.attachments || [],
    },
    values: { // Keep form values synced for edit mode
      title: initialData?.title || '',
      description: initialData?.description || '',
      budget: initialData?.budget || 100,
      deadline: initialData?.deadline || "",
      categoryId: initialData?.categoryId || '',
      attachments: initialData?.attachments || [],
    }
  });

  const watchDescription = form.watch('description');
  React.useEffect(() => {
    setDescriptionPreview(watchDescription);
  }, [watchDescription]);


  // Effect to handle initial attachments for edit mode, if any
  React.useEffect(() => {
    if (formType === 'edit' && initialData?.attachments) {
      setFilesToProcess(initialData.attachments.map((att: any) => ({
        id: (att as any).id || crypto.randomUUID(), // Use existing ID or generate
        file: new File([], att.fileName, { type: att.fileType }), // Dummy file object
        status: 'completed',
        progress: 100,
        s3Key: att.url.split('/').pop(), // Extract key from URL (simplified)
        url: att.url,
      })));
    }
  }, [formType, initialData]);


  // --- File Dropzone Logic ---
  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error('No files were selected or the file type is not allowed.');
        return;
      }

      const newFiles = acceptedFiles.map((file) => ({
        id: crypto.randomUUID(), // Unique ID for tracking
        file,
        status: 'pending' as const,
        progress: 0,
      }));

      setFilesToProcess((prev) => [...prev, ...newFiles]);

      // Process files one by one for S3 upload
      for (const fileItem of newFiles) {
        setFilesToProcess((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' } : f)),
        );
        try {
          const results = await uploadFiles([fileItem.file], 'task-attachments'); // useUpload handles S3 logic
          const { url, key } = results[0]; // Assuming single file upload per call

          setFilesToProcess((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: 'completed', url, s3Key: key, progress: 100 }
                : f,
            ),
          );
          // Add completed file to form's attachments array
          form.setValue('attachments', [
            ...(form.getValues('attachments') || []),
            { url, fileName: fileItem.file.name, fileType: fileItem.file.type },
          ]);
          toast.success(`File "${fileItem.file.name}" uploaded.`);
        } catch (error) {
          setFilesToProcess((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'failed' } : f)),
          );
          toast.error(`Failed to upload "${fileItem.file.name}".`);
          console.error('File upload failed:', error);
        }
      }
    },
    [uploadFiles, form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    disabled: isUploading,
  });

  // Remove file from local state and form attachments
  const handleRemoveFile = (idToRemove: string, s3Key?: string, url?: string) => {
    setFilesToProcess((prev) => prev.filter((file) => file.id !== idToRemove));
    form.setValue(
      'attachments',
      (form.getValues('attachments') || []).filter((att: any) => att.url !== url),
    );
    if (s3Key) {
      removeS3File(s3Key); // Call S3 deletion logic if S3Key exists (optional backend call)
    }
    toast.info('File removed.');
  };


  // --- Form Submission Logic ---
  const { mutate: submitTask, isPending: isSubmitPending } = useMutation({
    mutationFn: async (data: TaskFormInput) => {
      // Ensure deadline is converted to ISO string before sending to backend
      const dataToSend = {
        ...data,
        deadline: (data as any).deadline ? new Date((data as any).deadline).toISOString() : '',
      };
      if (formType === 'new') {
        return actions.createTaskAction(dataToSend);
      } else {
        if (!taskId) throw new Error('Task ID is required for updating.');
        return actions.updateTaskAction(taskId, dataToSend);
      }
    },
    onSuccess: (response) => {
      if (response.success && response.data?.task) {
        toast.success(`Task ${formType === 'new' ? 'created' : 'updated'} successfully!`);
        router.push(`/tasks/${response.data.task.id}`); // Redirect to task details page
      } else {
        toast.error(response.message || `Failed to ${formType === 'new' ? 'create' : 'update'} task.`);
        response.errors?.forEach(err => toast.error(`${err.path}: ${err.message}`));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || `Failed to ${formType === 'new' ? 'create' : 'update'} task.`);
    },
  });

  const onSubmit = (values: TaskFormInput) => {
    submitTask(values);
  };

  const isFormPending = isSubmitPending || isUploading;

  // --- Multi-step Form Navigation ---
  const handleNextStep = async () => {
    const isValid = await form.trigger(['title', 'budget', 'deadline', 'categoryId']);
    if (isValid) {
      setCurrentStep(2);
    } else {
      toast.error('Please fill in all required fields for Step 1.');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-h4 font-bold text-neutral-800 flex items-center">
              <CheckCircle2Icon className="mr-2 h-5 w-5 text-primary-500" /> Step 1: Basic Project Details
            </h3>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Develop a landing page for new SaaS" {...field} disabled={isFormPending} className="shadow-soft" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">acka
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isFormPending} className="shadow-soft" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal shadow-soft',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isFormPending}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormPending}>
                    <FormControl>
                      <SelectTrigger className="shadow-soft">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingCategories ? (
                        <div className="p-4 text-center text-neutral-500">Loading categories...</div>
                      ) : (
                        categories?.map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-8">
              <Button type="button" onClick={handleNextStep} disabled={isFormPending} className="shadow-primary group">
                Next Step <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Description & Attachments */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h3 className="text-h4 font-bold text-neutral-800 flex items-center">
              <CheckCircle2Icon className="mr-2 h-5 w-5 text-primary-500" /> Step 2: Description & Attachments
            </h3>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of your project, including requirements, scope, and expected deliverables. You can use Markdown for formatting."
                      className="min-h-[150px] shadow-soft"
                      {...field}
                      disabled={isFormPending}
                    />
                  </FormControl>
                  <FormMessage />
                  {descriptionPreview && (
                    <div className="mt-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                      <h4 className="text-h6 font-semibold mb-2 text-neutral-800 dark:text-neutral-100">Description Preview:</h4>
                      <article className="prose prose-sm dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                        <ReactMarkdown>{descriptionPreview}</ReactMarkdown>
                      </article>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* File Dropzone */}
            <FormItem>
              <FormLabel>Attachments (Max 5 files, 10MB each)</FormLabel>
              <div
                {...getRootProps()}
                className={cn(
                  'flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 text-center transition-colors hover:border-primary-500 hover:bg-primary-50 dark:bg-neutral-800 dark:hover:bg-neutral-700',
                  isDragActive && 'border-primary-500 bg-primary-50',
                  isUploading && 'opacity-60 cursor-not-allowed',
                )}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex items-center text-body-md text-primary-600">
                    <LoadingSpinner size="sm" className="mr-2" /> Uploading files ({Math.round(isUploading ? 0 : 0)}%)
                  </div>
                ) : isDragActive ? (
                  <p className="text-body-md text-primary-600">Drop the files here ...</p>
                ) : (
                  <p className="text-body-md text-neutral-600">
                    <UploadCloudIcon className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                    Drag 'n' drop some files here, or click to select files
                  </p>
                )}
              </div>
              <FormMessage />
              {filesToProcess.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-body-sm font-semibold text-neutral-700">Selected Files:</p>
                  {filesToProcess.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <FileTextIcon className="h-5 w-5 text-neutral-500" />
                        <span className="text-body-sm text-neutral-700">{fileItem.file.name}</span>
                        {fileItem.status === 'uploading' && <LoadingSpinner size="sm" className="ml-2" />}
                        {fileItem.status === 'completed' && <CheckCircle2Icon className="ml-2 h-4 w-4 text-success-600" />}
                        {fileItem.status === 'failed' && <XIcon className="ml-2 h-4 w-4 text-error-500" />}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(fileItem.id, fileItem.s3Key, fileItem.url)}
                        className="text-neutral-500 hover:text-destructive-500"
                        disabled={isFormPending}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </FormItem>

            <div className="flex justify-between mt-8">
              <Button type="button" onClick={handlePrevStep} variant="outline" disabled={isFormPending} className="shadow-soft group">
                <ChevronLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Previous Step
              </Button>
              <Button type="submit" className="text-body-md shadow-primary group" disabled={isFormPending}>
                {isFormPending && <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" />}
                {formType === 'new' ? 'Post Project' : 'Save Changes'} <CheckCircle2Icon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </form>
    </Form>
  );
}