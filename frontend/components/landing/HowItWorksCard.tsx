"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HowItWorksStep {
  icon: React.ReactNode;
  text: string;
}

interface HowItWorksCardProps {
  title: string;
  description: string;
  steps: HowItWorksStep[];
  cta: React.ReactNode;
}

export function HowItWorksCard({
  title,
  description,
  steps,
  cta,
}: HowItWorksCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <Card className="h-full shadow-medium dark:shadow-medium-dark border-neutral-200 p-8 flex flex-col justify-between">
        <CardHeader className="p-0 pb-6">
          <h3 className="text-h3 font-bold text-neutral-800">{title}</h3>
          <CardDescription className="text-body-md text-neutral-600 mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4 flex-grow">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 shadow-sm">
                {step.icon}
              </div>
              <p className="text-body-md text-neutral-700">{step.text}</p>
            </div>
          ))}
        </CardContent>
        <CardFooter className="p-0 pt-8 mt-auto">{cta}</CardFooter>
      </Card>
    </motion.div>
  );
}
