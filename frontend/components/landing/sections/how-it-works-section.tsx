"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Plane, Smile } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Find Your Property",
      description:
        "Use our advanced search to discover properties tailored to your desires.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Plane,
      title: "Book with Ease",
      description:
        "Secure your dream stay with our seamless and instant booking process.",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Smile,
      title: "Enjoy Your Stay",
      description:
        "Experience unparalleled luxury and personalized service from arrival to departure.",
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-32 bg-background dark:bg-gray-900 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-6 px-6 py-2 text-lg">
            Simple Steps
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your unforgettable journey to Rwanda begins with a few simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <GlassCard className="p-8 h-full text-center hover:bg-white/20 transition-all duration-300">
                <motion.div
                  className={cn(
                    "w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br flex items-center justify-center",
                    step.color
                  )}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <step.icon className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
