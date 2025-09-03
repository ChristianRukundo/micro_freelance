"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";
export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    toast({
      title: "Successfully subscribed!",
      description:
        "Thank you for joining our newsletter. You'll receive updates about new properties and exclusive offers.",
    });
    setEmail("");

    setTimeout(() => setIsSubscribed(false), 3000);
  };
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <GlassCard className="p-8 relative overflow-hidden">
            {/* Decorative Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${60 + Math.sin(i) * 20}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <Mail className="h-8 w-8 text-white" />
                </motion.div>
                <h3
                  className={cn(
                    "text-2xl font-bold mb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Stay in the Loop
                </h3>
                <p
                  className={cn(
                    "text-center",
                    isDark ? "text-white/80" : "text-gray-600"
                  )}
                >
                  Get exclusive access to new properties, special offers, and
                  insider travel tips from Rwanda.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "pr-12 h-12 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300",
                      isDark
                        ? "bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
                        : "bg-gray-200 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-blue-500"
                    )}
                    required
                  />
                  <motion.div
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg w-8 h-8"
                      disabled={isSubscribed}
                    >
                      {isSubscribed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400"
                        >
                          ✓
                        </motion.div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p
                  className={cn(
                    "text-xs text-center",
                    isDark ? "text-white/60" : "text-gray-600"
                  )}
                >
                  By subscribing, you agree to our Privacy Policy and Terms of
                  Service.
                </p>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};
