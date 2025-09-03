"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Star, Award, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { cn } from "@/lib/utils";

export const HeroAnimatedStats = () => {
  const stats = [
    {
      label: "Properties",
      value: 500,
      icon: TrendingUp,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Happy Guests",
      value: 10000,
      icon: Users,
      color: "from-green-400 to-green-600",
    },
    {
      label: "5-Star Reviews",
      value: 2500,
      icon: Star,
      color: "from-yellow-400 to-yellow-600",
    },
    {
      label: "Awards Won",
      value: 15,
      icon: Award,
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 mb-10">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
          whileHover={{ y: -10, scale: 1.05 }}
          className="text-center group"
        >
          <GlassCard className="p-6 hover:bg-white/20 transition-all duration-300 mb-10">
            <motion.div
              className={cn(
                "w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center",
                stat.color
              )}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <stat.icon className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1 + index * 0.1,
                type: "spring",
                stiffness: 200,
              }}
            >
              <AnimatedCounter value={stat.value} suffix="+" />
            </motion.div>
            <div className="text-white/80 font-medium">{stat.label}</div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};