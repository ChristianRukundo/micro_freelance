"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps
  extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children?: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "backdrop-blur-xl rounded-2xl shadow-lg border",
        "bg-card/50 border-border/20 hover:bg-accent/10 hover:border-accent/30", 
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};