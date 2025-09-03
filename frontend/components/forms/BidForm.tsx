'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useBids } from '@/hooks/useBids';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { DollarSignIcon, MessageSquareTextIcon, SendIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/zustand';
import { UserRole } from '@/lib/types';
import Link from 'next/link';

// Schema from lib/actions.ts for consistency
const submitBidSchema = z.object({
  proposal: z.string().min(50, 'Proposal must be at least 50 characters long'),
  amount: z.number().min(1, 'Bid amount must be at least 1'),
});

type BidFormInput = z.infer<typeof submitBidSchema>;

interface BidFormProps {
  taskId: string;
}

export function BidForm({ taskId }: BidFormProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { submitBid, isSubmittingBid } = useBids(taskId);

  const form = useForm<BidFormInput>({
    resolver: zodResolver(submitBidSchema),
    defaultValues: {
      proposal: '',
      amount: 0,
    },
  });

  const onSubmit = async (values: BidFormInput) => {
    try {
      await submitBid(values);
      form.reset(); // Clear form on successful submission
    } catch (error) {
      // Toast already handled by useBids hook
    }
  };

  if (!isAuthenticated || user?.role !== UserRole.FREELANCER) {
    return (
      <Card className="shadow-soft border-neutral-200 bg-neutral-50 p-6 text-center">
        <h4 className="text-h4 font-bold text-neutral-800">Ready to Bid?</h4>
        <p className="text-body-md text-neutral-600 mt-2">
          Only registered freelancers can submit bids.
        </p>
        <Link href="/register?role=freelancer" passHref className="mt-4 inline-block">
          <Button variant="gradient" className="shadow-primary group">
            Become a Freelancer <SendIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="proposal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <MessageSquareTextIcon className="mr-2 h-4 w-4" /> Your Proposal
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your approach, experience, and why you're the best fit for this project..."
                    className="min-h-[120px] shadow-soft"
                    {...field}
                    disabled={isSubmittingBid}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <DollarSignIcon className="mr-2 h-4 w-4" /> Proposed Amount ($)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    disabled={isSubmittingBid}
                    className="shadow-soft"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full text-body-md shadow-primary group" disabled={isSubmittingBid}>
            {isSubmittingBid && <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" />}
            Submit Bid <SendIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}