import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-body-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 ease-in-out-quad",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-primary-foreground shadow-medium hover:bg-primary-600 hover:shadow-hard",
        destructive: "bg-destructive-500 text-destructive-foreground shadow-medium hover:bg-destructive-600",
        outline: "border border-input bg-background shadow-soft hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-neutral-200 text-neutral-800 shadow-soft hover:bg-neutral-300",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-500 underline-offset-4 hover:underline",
        'primary-outline': "border border-primary-500 text-primary-500 bg-transparent shadow-soft hover:bg-primary-50 hover:text-primary-600",
        'gradient': "bg-gradient-to-r from-primary-500 to-primary-400 text-primary-foreground shadow-primary hover:from-primary-600 hover:to-primary-500",
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
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }