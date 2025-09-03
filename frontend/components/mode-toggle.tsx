"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 bg-muted rounded-full animate-pulse" />;
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 transition-all duration-500 ease-in-out cursor-pointer",
        "bg-gradient-to-r shadow-inner",
        isDark
          ? "from-slate-700 to-slate-800 shadow-slate-900/50"
          : "from-blue-200 to-blue-300 shadow-blue-400/30"
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isDark
            ? "bg-gradient-to-r from-indigo-900/50 to-purple-900/50"
            : "bg-gradient-to-r from-yellow-200/50 to-orange-200/50"
        )}
      />

      <motion.div
        className={cn(
          "relative w-6 h-6 rounded-full shadow-lg transition-all duration-500",
          "bg-gradient-to-br flex items-center justify-center",
          isDark
            ? "from-slate-200 to-white shadow-slate-900/30"
            : "from-white to-yellow-100 shadow-blue-500/20"
        )}
        animate={{
          x: isDark ? 32 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          animate={{
            rotate: isDark ? 180 : 0,
            scale: isDark ? 0.8 : 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          {isDark ? (
            <Moon className="h-3 w-3 text-slate-700" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-600" />
          )}
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <motion.div
          animate={{
            opacity: isDark ? 0.3 : 0.7,
            scale: isDark ? 0.8 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Sun className="h-3 w-3 text-yellow-500" />
        </motion.div>
        <motion.div
          animate={{
            opacity: isDark ? 0.7 : 0.3,
            scale: isDark ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          <Moon className="h-3 w-3 text-slate-300" />
        </motion.div>
      </div>

      <motion.div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isDark
            ? "shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            : "shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        )}
        animate={{
          opacity: isDark ? 0.6 : 0.4,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  );
}
