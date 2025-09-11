"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SendIcon } from "lucide-react";
import { motion } from "framer-motion";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormInput = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const form = useForm<NewsletterFormInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: subscribe, isPending } = useMutation({
    mutationFn: async (data: NewsletterFormInput) => {
      const res = await api.post("/newsletter/subscribe", data);
      return { success: true, message: "Thanks for subscribing!" } as const;
    },
    onSuccess: (response) => {
      toast.success(response.message);
      form.reset();
    },
  });

  const onSubmit = (values: NewsletterFormInput) => {
    subscribe(values);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-sm mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Your email address"
                    {...field}
                    disabled={isPending}
                    className="rounded-full shadow-soft dark:shadow-soft-dark dark:bg-neutral-800 dark:text-neutral-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="rounded-full shadow-primary dark:shadow-primary-dark group"
            disabled={isPending}
          >
            {isPending ? (
              <LoadingSpinner size="sm" color="text-primary-foreground" />
            ) : (
              <SendIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            )}
            <span className="sr-only md:not-sr-only md:ml-2">Subscribe</span>
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
