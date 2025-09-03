"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeumorphButtonProps
  extends React.ComponentPropsWithoutRef<typeof motion.button> {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "primary";
}

export const NeumorphButton = ({
  children,
  className,
  variant = "default",
  ...props
}: NeumorphButtonProps) => (
  <motion.button
    className={cn(
      "relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300",
      variant === "default" && [
        "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
        "shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] dark:shadow-[8px_8px_16px_#1a1a1a,-8px_-8px_16px_#2a2a2a]",
        "hover:shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] dark:hover:shadow-[4px_4px_8px_#1a1a1a,-4px_-4px_8px_#2a2a2a]",
        "active:shadow-[inset_4px_4px_8px_#d1d9e6,inset_-4px_-4px_8px_#ffffff] dark:active:shadow-[inset_4px_4px_8px_#1a1a1a,inset_-4px_-4px_8px_#2a2a2a]",
      ],
      variant === "primary" && [
        "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
        "shadow-[8px_8px_16px_rgba(59,130,246,0.3),-8px_-8px_16px_rgba(147,51,234,0.3)]",
        "hover:shadow-[4px_4px_8px_rgba(59,130,246,0.4),-4px_-4px_8px_rgba(147,51,234,0.4)]",
      ],
      className
    )}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    {...props}
  >
    {children}
  </motion.button>
);
