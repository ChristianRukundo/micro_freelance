'use client';

import { motion } from "framer-motion";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createMultipleMilestonesSchema, createMilestoneSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Milestone, TaskStatus } from '@/lib/types';
import { format } from 'date-fns';
import { CalendarIcon, DollarSignIcon, PlusCircleIcon, MinusCircleIcon, ListChecksIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import * as actions from '@/lib/actions';

// Schemas from lib/schemas

type SingleMilestoneInput = z.infer<typeof createMilestoneSchema>;
type MultipleMilestonesInput = z.infer<typeof createMultipleMilestonesSchema>;

interface MilestoneFormProps {
  taskId: string;
  onSuccess?: () => void;
  // For edit mode, you'd pass a single milestone. For simplicity, this form focuses on creation.
  // isEditMode?: boolean;
  // initialMilestone?: Milestone;
}

export function MilestoneForm({ taskId, onSuccess }: MilestoneFormProps) {
  const queryClient = useQueryClient();
  const [milestonesFields, setMilestonesFields] = React.useState<SingleMilestoneInput[]>([
    { description: '', dueDate: new Date().toISOString(), amount: 0 },
  ]);

  const form = useForm<MultipleMilestonesInput>({
    resolver: zodResolver(createMultipleMilestonesSchema),
    defaultValues: milestonesFields,
    values: milestonesFields, // Keep form values synced with state
  });

  const addMilestoneField = () => {
    setMilestonesFields((prev) => [...prev, { description: '', dueDate: new Date().toISOString(), amount: 0 }]);
  };

  const removeMilestoneField = (index: number) => {
    setMilestonesFields((prev) => prev.filter((_, i) => i !== index));
    form.clearErrors(`root.${index}`); // Clear specific errors
  };

  // Update a specific field in a milestone
  const updateMilestoneField = (index: number, fieldName: keyof SingleMilestoneInput, value: any) => {
    setMilestonesFields((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [fieldName]: value } : m)),
    );
    form.trigger(`${String(index)}.${String(fieldName)}` as any);
  };


  const { mutate: createMilestones, isPending: isCreatingMilestones } = useMutation({
    mutationFn: async (milestonesData: MultipleMilestonesInput) => {
      // Convert Date objects to ISO strings for the backend
      const dataToSend = milestonesData.map((m: SingleMilestoneInput) => ({
        ...m,
        dueDate: m.dueDate,
      }));
      return actions.createMilestonesAction(taskId, dataToSend);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ['milestones', taskId] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        form.reset(); // Reset form fields
        setMilestonesFields([{ description: '', dueDate: new Date().toISOString(), amount: 0 }]); // Reset state
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to create milestones.');
        response.errors?.forEach(err => toast.error(`${err.path}: ${err.message}`));
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create milestones.');
    },
  });

  const onSubmit = (values: MultipleMilestonesInput) => {
    createMilestones(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {milestonesFields.map((milestone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-neutral-200 p-4 shadow-soft space-y-4 relative"
          >
            <h4 className="text-h6 font-semibold text-neutral-800 mb-4">Milestone {index + 1}</h4>
            {milestonesFields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 rounded-full"
                onClick={() => removeMilestoneField(index)}
                disabled={isCreatingMilestones}
                aria-label={`Remove milestone ${index + 1}`}
              >
                <MinusCircleIcon className="h-4 w-4" />
              </Button>
            )}
            <FormField
              control={form.control}
              name={`${index}.description` as any} // Type assertion for indexed field
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed deliverables for this milestone..."
                      className="min-h-[80px]"
                      {...field}
                      value={milestone.description} // Explicitly bind value from state
                      onChange={(e) => updateMilestoneField(index, 'description', e.target.value)}
                      disabled={isCreatingMilestones}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name={`${index}.amount` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <DollarSignIcon className="mr-2 h-4 w-4" /> Amount ($)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 500"
                        {...field}
                        value={milestone.amount} // Explicitly bind value from state
                        onChange={(e) => updateMilestoneField(index, 'amount', parseFloat(e.target.value))}
                        disabled={isCreatingMilestones}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${index}.dueDate` as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal shadow-soft',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isCreatingMilestones}
                          >
                            {milestone.dueDate ? format(milestone.dueDate, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestone.dueDate ? new Date(milestone.dueDate) : undefined}
                          onSelect={(date) => updateMilestoneField(index, 'dueDate', date)}
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
          </motion.div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addMilestoneField}
          disabled={isCreatingMilestones}
          className="w-full text-body-md shadow-soft group"
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Another Milestone
        </Button>

        <Button type="submit" className="w-full text-body-md shadow-primary group" disabled={isCreatingMilestones}>
          {isCreatingMilestones && <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" />}
          <ListChecksIcon className="mr-2 h-4 w-4" /> Create Milestones
        </Button>
      </form>
    </Form>
  );
}