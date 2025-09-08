import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center cursor-pointer whitespace-nowrap rounded-lg text-body-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out-quad",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500 text-primary-foreground shadow-medium dark:shadow-medium-dark hover:bg-primary-600 hover:shadow-hard dark:shadow-hard-dark dark:shadow-medium dark:shadow-medium-dark-dark dark:hover:shadow-hard dark:shadow-hard-dark-dark",
        destructive:
          "bg-destructive-500 text-destructive-foreground shadow-medium dark:shadow-medium-dark hover:bg-destructive-600 dark:shadow-medium dark:shadow-medium-dark-dark dark:hover:shadow-hard dark:shadow-hard-dark-dark",
        outline:
          "border border-input bg-background shadow-soft dark:shadow-soft-dark hover:bg-accent hover:text-accent-foreground",
        "destructive-outline":
          "border border-destructive-500/50 text-destructive-500 bg-transparent shadow-soft hover:bg-destructive-50 hover:border-destructive-500",
        secondary:
          "bg-neutral-200 shadow-soft dark:shadow-soft-dark hover:bg-neutral-300",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-500 underline-offset-4 hover:underline",
        "primary-outline":
          "border border-primary-500 text-primary-500 bg-transparent shadow-soft dark:shadow-soft-dark hover:bg-primary-50 hover:text-primary-600",
        gradient:
          "bg-gradient-to-r from-primary-600 to-primary-500 text-primary-foreground shadow-primary dark:shadow-primary-dark hover:from-primary-700 hover:to-primary-600 transform hover:-translate-y-0.5 transition-transform duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-body-sm",
        lg: "h-11 rounded-lg px-8 text-body-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
