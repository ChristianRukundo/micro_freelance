import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500 text-primary-foreground shadow-sm hover:bg-primary-600",
        secondary:
          "border-transparent bg-neutral-100 text-neutral-800 hover:bg-neutral-200", // Custom neutral-based secondary
        destructive:
          "border-transparent bg-error-500 text-destructive-foreground shadow-sm hover:bg-error-600", // Custom error color
        outline: "text-foreground border-neutral-300", // Custom neutral border
        // Custom variants for status indicators or specific branding
        "status-success": "border-transparent bg-success-500/10 text-success-600",
        "status-warning": "border-transparent bg-warning-500/10 text-warning-600",
        "status-error": "border-transparent bg-error-500/10 text-error-600",
        "primary-light": "border-transparent bg-primary-50 text-primary-700", // For light primary background
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }