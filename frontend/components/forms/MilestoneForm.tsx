// frontend/components/forms/MilestoneForm.tsx

"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createMultipleMilestonesSchema } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon,
  DollarSignIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ListChecksIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import api from "@/lib/api";


// The schema expects an object with a 'milestones' array property
type MilestonesFormInput = z.infer<typeof createMultipleMilestonesSchema>;
type SingleMilestoneInput = MilestonesFormInput["milestones"][0];

interface MilestoneFormProps {
  taskId: string;
  onSuccess?: () => void;
}

export function MilestoneForm({ taskId, onSuccess }: MilestoneFormProps) {
  const queryClient = useQueryClient();

  // This local state is now the single source of truth for the UI fields
  const [milestonesFields, setMilestonesFields] = React.useState<
    SingleMilestoneInput[]
  >([{ description: "", dueDate: new Date().toISOString(), amount: 0 }]);

  const form = useForm<MilestonesFormInput>({
    resolver: zodResolver(createMultipleMilestonesSchema),
    // The form's default values are now managed by the local state via useEffect
  });

  // FIX: This useEffect synchronizes the local state with react-hook-form's state
  useEffect(() => {
    form.setValue("milestones", milestonesFields);
  }, [milestonesFields, form]);

  const addMilestoneField = () => {
    setMilestonesFields((prev) => [
      ...prev,
      { description: "", dueDate: new Date().toISOString(), amount: 0 },
    ]);
  };

  const removeMilestoneField = (index: number) => {
    setMilestonesFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestoneField = (
    index: number,
    fieldName: keyof SingleMilestoneInput,
    value: any
  ) => {
    setMilestonesFields((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [fieldName]: value } : m))
    );
  };

  const { mutate: createMilestones, isPending: isCreatingMilestones } =
    useMutation({
      mutationFn: async (values: MilestonesFormInput) => {
        const response = await api.post(`/tasks/${taskId}/milestones`, values);
        return response.data;
      },
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message);
          queryClient.invalidateQueries({ queryKey: ["milestones", taskId] });
          queryClient.invalidateQueries({ queryKey: ["task", taskId] });
          setMilestonesFields([
            { description: "", dueDate: new Date().toISOString(), amount: 0 },
          ]);
          form.reset();
          onSuccess?.();
        } else {
          toast.error(response.message || "Failed to create milestones.");
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "An unexpected error occurred.");
      },
    });

  const onSubmit = (values: MilestonesFormInput) => {
    createMilestones(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
          {milestonesFields.map((milestone, index) => (
            <motion.div
              key={index} // Using index is acceptable here as we don't reorder
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-lg border p-4 shadow-soft dark:shadow-soft-dark space-y-4 relative"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-h6 font-semibold">Milestone {index + 1}</h4>
                {milestonesFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 rounded-full cursor-pointer"
                    onClick={() => removeMilestoneField(index)}
                    disabled={isCreatingMilestones}
                  >
                    <MinusCircleIcon className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              {/* Using FormItem without FormField for manual control */}
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed deliverables for this milestone..."
                    className="min-h-[80px]"
                    value={milestone.description}
                    onChange={(e) =>
                      updateMilestoneField(index, "description", e.target.value)
                    }
                    disabled={isCreatingMilestones}
                  />
                </FormControl>
                <FormMessage>
                  {
                    form.formState.errors.milestones?.[index]?.description
                      ?.message
                  }
                </FormMessage>
              </FormItem>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormItem>
                  <FormLabel className="flex items-center">
                    <DollarSignIcon className="mr-2 h-4 w-4" /> Amount ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={milestone.amount === 0 ? "" : milestone.amount}
                      onChange={(e) =>
                        updateMilestoneField(
                          index,
                          "amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={isCreatingMilestones}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.milestones?.[index]?.amount?.message}
                  </FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal cursor-pointer",
                            !milestone.dueDate && "text-muted-foreground"
                          )}
                          disabled={isCreatingMilestones}
                        >
                          {milestone.dueDate ? (
                            format(new Date(milestone.dueDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          milestone.dueDate
                            ? new Date(milestone.dueDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            updateMilestoneField(
                              index,
                              "dueDate",
                              date.toISOString()
                            );
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage>
                    {
                      form.formState.errors.milestones?.[index]?.dueDate
                        ?.message
                    }
                  </FormMessage>
                </FormItem>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={addMilestoneField}
            disabled={isCreatingMilestones}
            className="w-full text-body-md group cursor-pointer"
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Another Milestone
          </Button>
          <Button
            type="submit"
            className="w-full text-body-md shadow-primary group cursor-pointer"
            disabled={isCreatingMilestones}
          >
            {isCreatingMilestones && (
              <LoadingSpinner
                size="sm"
                color="text-primary-foreground"
                className="mr-2"
              />
            )}
            <ListChecksIcon className="mr-2 h-4 w-4" /> Create Milestones
          </Button>
        </div>
      </form>
    </Form>
  );
}
