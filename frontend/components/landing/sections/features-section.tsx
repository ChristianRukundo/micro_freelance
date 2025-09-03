"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure Booking",
      description:
        "Advanced encryption and secure payment processing for peace of mind",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Instant Confirmation",
      description: "Get immediate booking confirmation with smart automation",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Access to premium properties across Rwanda and beyond",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Heart,
      title: "Personalized Service",
      description: "Tailored recommendations based on your preferences",
      color: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent)]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-6 px-6 py-2 text-lg">
            Why Choose Tura Heza
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Redefining Luxury
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We don&apos;t just offer accommodations; we craft experiences that
            resonate with your soul and create memories that last a lifetime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-[20px_20px_40px_#d1d9e6,-20px_-20px_40px_#ffffff] dark:shadow-[20px_20px_40px_#1a1a1a,-20px_-20px_40px_#2a2a2a] hover:shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] dark:hover:shadow-[10px_10px_20px_#1a1a1a,-10px_-10px_20px_#2a2a2a] transition-all duration-300">
                <motion.div
                  className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                    feature.color
                  )}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
