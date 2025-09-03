"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, MousePointer2 } from "lucide-react";
import { HeroInteractiveSearch } from "@/components/hero-interactive-search";
import { HeroAnimatedStats } from "@/components/hero-animated-stats";
import { HeroBackgroundEffects } from "@/components/hero-background-effects";

export const HeroSection = () => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacityRange = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const heroRef = useRef(null);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: yRange, opacity: opacityRange }}
      >
        <Image
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop"
          alt="Rwanda landscape"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
      </motion.div>

      {/* Particle system and floating elements */}
      <HeroBackgroundEffects />

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm px-6 py-2 text-lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Welcome to Rwanda&apos;s Premier Luxury Rentals
          </Badge>

          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              Discover
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-white bg-clip-text text-transparent">
              Paradise
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-3xl max-w-4xl mx-auto mb-12 text-white/90 leading-relaxed font-light"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Experience Rwanda&apos;s breathtaking beauty through our curated
            collection of luxury properties. Where every stay becomes an
            extraordinary journey.
          </motion.p>
        </motion.div>

        {/* Interactive search */}
        <HeroInteractiveSearch />

        {/* Animated stats */}
        <HeroAnimatedStats />
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex flex-col items-center text-white/70">
          <MousePointer2 className="h-6 w-6 mb-2" />
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};
