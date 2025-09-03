"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <motion.button
      className={cn(
        "fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full shadow-lg",
        "hover:shadow-xl hover:scale-110 transition-all duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        isDark
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      )}
      onClick={scrollToTop}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
    >
      <ChevronUp className="h-6 w-6 mx-auto" />
    </motion.button>
  );
};
