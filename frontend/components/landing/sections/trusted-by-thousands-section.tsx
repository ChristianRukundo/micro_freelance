"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, Users, Star, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export const TrustedByThousandsSection = () => {
  const stats = [
    { value: 500, suffix: "+", label: "Properties", icon: Globe },
    { value: 10000, suffix: "+", label: "Happy Guests", icon: Users },
    { value: 2500, suffix: "+", label: "5-Star Reviews", icon: Star },
    { value: 15, suffix: "+", label: "Awards Won", icon: Award },
  ];
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge
            className={cn(
              "mb-4 backdrop-blur-sm",
              isDark
                ? "bg-white/10 text-white border-white/20"
                : "bg-gray-200 text-gray-700 border-gray-300"
            )}
          >
            Our Impact
          </Badge>
          <h3
            className={cn(
              "text-3xl font-bold mb-2",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Trusted by Thousands
          </h3>
          <p className={cn(isDark ? "text-white/70" : "text-gray-600")}>
            Join our growing community of satisfied guests and property
            owners
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <GlassCard className="p-6">
                <motion.div
                  className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
                <div
                  className={cn(
                    "text-2xl font-bold mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div
                  className={cn(
                    "text-sm",
                    isDark ? "text-white/70" : "text-gray-600"
                  )}
                >
                  {stat.label}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};