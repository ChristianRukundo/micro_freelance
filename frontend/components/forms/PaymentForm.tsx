"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import * as actions from "@/lib/actions";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCardIcon,
  LockIcon,
  DollarSignIcon,
  AlertCircleIcon,
} from "lucide-react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import { motion } from "framer-motion";

// Load Stripe.js (public key from .env.local)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

// Schema for payment intent (only amount is dynamic, task ID is from props)
const paymentFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be positive"),
});

type PaymentFormInput = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  taskId: string;
  taskBudget: number;
  onPaymentSuccess?: () => void;
}

// Actual Stripe Payment Form component (must be wrapped by <Elements>)
function CheckoutForm({
  taskId,
  taskBudget,
  onPaymentSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: taskBudget, // Pre-fill with task budget
    },
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const {
    mutateAsync: createPaymentIntentMutation,
    isPending: isCreatingIntent,
  } = useMutation({
    mutationFn: (amount: number) =>
      actions.createPaymentIntentAction(taskId, { amount }),
    onSuccess: (response) => {
      if (response.success && response.data?.clientSecret) {
        setClientSecret(response.data.clientSecret);
        toast.success("Payment initiated. Enter your details.");
      } else {
        toast.error(response.message || "Failed to initiate payment.");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to initiate payment.");
    },
  });

  useEffect(() => {
    // Automatically create payment intent when component mounts or taskId/budget changes
    if (taskId && taskBudget > 0 && !clientSecret && !isCreatingIntent) {
      createPaymentIntentMutation(taskBudget);
    }
  }, [
    taskId,
    taskBudget,
    clientSecret,
    isCreatingIntent,
    createPaymentIntentMutation,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded or client secret is not ready.
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/projects/${taskId}?payment_success=true`, // Redirect after payment
        // You can include more custom data here if needed for your return_url handler
      },
    });

    if (result.error) {
      setMessage(result.error.message || "An unexpected error occurred.");
      toast.error(result.error.message || "Payment failed.");
    } else if (
      (result as any).paymentIntent &&
      (result as any).paymentIntent.status === "succeeded"
    ) {
      setMessage("Payment succeeded!");
      toast.success("Payment successful! Funds are now in escrow.");
      onPaymentSuccess?.(); // Callback for parent component
      // Optionally redirect or show success message on the current page
    } else {
      setMessage("Payment processing. You will be notified of the outcome.");
      toast.info("Payment processing. You will be notified of the outcome.");
    }

    setIsProcessing(false);
  };

  const isFormDisabled =
    isCreatingIntent || isProcessing || !stripe || !elements || !clientSecret;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <DollarSignIcon className="mr-2 h-4 w-4" /> Amount to Fund
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  disabled={true} // Amount is determined by task budget for simplicity
                  className="shadow-soft dark:shadow-soft-dark"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCreatingIntent ? (
          <div className="flex items-center justify-center p-6 text-body-md text-neutral-600">
            <LoadingSpinner size="md" className="mr-3" /> Initializing
            payment...
          </div>
        ) : clientSecret && elements ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <FormItem>
              <FormLabel className="flex items-center">
                <CreditCardIcon className="mr-2 h-4 w-4" /> Payment Details
              </FormLabel>
              <div className="rounded-lg border border-neutral-200 p-3 shadow-soft dark:shadow-soft-dark">
                <PaymentElement options={{ layout: "tabs" }} />
              </div>
              <FormMessage />
            </FormItem>

            <Button
              type="submit"
              className="w-full text-body-md shadow-primary dark:shadow-primary-dark group"
              disabled={isFormDisabled}
            >
              {isProcessing && (
                <LoadingSpinner
                  size="sm"
                  color="text-primary-foreground"
                  className="mr-2"
                />
              )}
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-body-md text-error-600">
            <AlertCircleIcon className="h-6 w-6 mb-2" />
            <span>Could not load payment interface. Please try again.</span>
            <Button
              onClick={() =>
                createPaymentIntentMutation(form.getValues("amount"))
              }
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {message && (
          <div
            className={`text-body-sm text-center ${message.includes("succeeded") ? "text-success-600" : "text-destructive-500"}`}
          >
            {message}
          </div>
        )}
      </form>
    </Form>
  );
}

// Main PaymentForm component that wraps CheckoutForm with <Elements>
export function PaymentForm({
  taskId,
  taskBudget,
  onPaymentSuccess,
}: PaymentFormProps) {
  // Setup appearance for Stripe Elements
  const appearance = {
    theme: "stripe" as const, // 'stripe' or 'flat' or 'none'
    variables: {
      colorPrimary: "hsl(var(--primary-500))", // Tailwind's primary-500
      colorText: "hsl(var(--foreground))",
      colorBackground: "hsl(var(--card))",
      colorDanger: "hsl(var(--destructive-500))",
      fontFamily: "Inter, sans-serif",
    },
    labels: "floating" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-h3 font-bold text-neutral-800">
            Secure Payment
          </CardTitle>
          <LockIcon className="h-6 w-6 text-neutral-500" />
        </CardHeader>
        <CardContent>
          {!stripePromise && (
            <div className="flex items-center justify-center p-6 text-body-md text-destructive-500">
              <AlertCircleIcon className="h-6 w-6 mr-2" /> Stripe is not
              configured. Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
            </div>
          )}
          {stripePromise && (
            <Elements
              options={{ clientSecret: "...", appearance }}
              stripe={stripePromise}
            >
              {/* clientSecret is initialized as '...' as it's fetched dynamically by CheckoutForm */}
              <CheckoutForm
                taskId={taskId}
                taskBudget={taskBudget}
                onPaymentSuccess={onPaymentSuccess}
              />
            </Elements>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
