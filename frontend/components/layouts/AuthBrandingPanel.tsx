// File: components/layouts/AuthBrandingPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/common/Logo";

const features = [
  {
    title: "Secure Escrow Payments",
    description: "Funds are held safely until you approve the work.",
  },
  {
    title: "Milestone Tracking",
    description: "Break down projects into manageable steps and payments.",
  },
  {
    title: "Global Talent Pool",
    description: "Connect with top-tier freelancers from around the world.",
  },
  {
    title: "Real-time Collaboration",
    description: "Integrated chat and file sharing to keep projects on track.",
  },
];

export function AuthBrandingPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000); // Change feature every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative hidden lg:flex h-full w-full flex-col items-center justify-center bg-neutral-900 p-12 text-white overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-800 dark:from-primary-900 dark:via-purple-900 dark:to-primary-950 opacity-90" />

      <div className="relative z-10 flex flex-col items-start w-full max-w-md">
        <div className="flex items-center space-x-3 mb-8">
          <Logo className="h-10 w-10 text-white" />
          <span className="text-display-sm font-bold">MicroFreelance</span>
        </div>

        <h1 className="text-display-md font-extrabold tracking-tight drop-shadow-lg mb-4">
          Your Vision,
          <br />
          Our Talent.
        </h1>
        <p className="text-body-lg text-primary-100 max-w-md">
          Join a community of innovators and creators to bring your ideas to
          life.
        </p>

        <div className="mt-12 w-full h-24 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <h2 className="text-h4 font-bold text-white">
                {features[index].title}
              </h2>
              <p className="text-body-md text-primary-200 mt-2">
                {features[index].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
