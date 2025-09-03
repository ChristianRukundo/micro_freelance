"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { NeumorphButton } from "@/components/ui/neumorph-button";

export const CallToActionSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Sparkles className="h-12 w-12" />
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            Your Journey Awaits
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/90">
            Step into a world where luxury meets authenticity, where every
            moment is crafted to perfection, and where Rwanda&apos;s natural beauty
            becomes your backdrop.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <NeumorphButton
              variant="primary"
              className="text-xl px-12 py-6 bg-white text-gray-900 hover:bg-gray-100"
            >
              <Link href="/villas" className="flex items-center">
                Start Exploring
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </NeumorphButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
