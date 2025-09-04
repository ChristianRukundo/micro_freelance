"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveRightIcon, SearchIcon, ArrowRightIcon } from "lucide-react";

export function AnimatedHero() {
  return (
    <section className="relative flex w-full flex-col items-center justify-center bg-background py-20 text-center md:py-32 overflow-hidden">
      <Image
        src="/images/hero-background.jpg"
        alt="Connecting freelancers and clients"
        fill
        priority
        className="absolute inset-0 object-cover object-center z-0 animate-fade-in"
        quality={80}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-700/60 via-primary-500/40 to-primary-300/30 z-10"></div>
      <div className="container relative z-20 max-w-4xl space-y-8 text-white px-4 md:px-0">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-display-lg font-extrabold tracking-tight drop-shadow-lg"
        >
          Your Vision, Our Talent.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-body-lg text-primary-50 max-w-2xl mx-auto"
        >
          Connect with a global network of skilled freelancers or launch your
          next big project with confidence. Seamless. Secure. Successful.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mt-8"
        >
          <Link href="/tasks/new" passHref>
            <Button
              size="lg"
              variant="gradient"
              className="shadow-lg shadow-primary dark:shadow-primary-dark-500/30 group px-8 py-3 text-h6 font-semibold"
            >
              Post a Project
              <MoveRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/tasks" passHref>
            <Button
              size="lg"
              variant="primary-outline"
              className="border-white text-white bg-white/20 hover:bg-white/30 px-8 py-3 text-h6 font-semibold"
            >
              Find Freelancers
            </Button>
          </Link>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="mt-12 w-full max-w-xl mx-auto relative group"
        >
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
          <Input
            type="search"
            placeholder="What project are you looking for?"
            className="w-full pl-12 pr-4 py-3 rounded-full text-neutral-800 bg-white/95 border-none shadow-medium dark:shadow-medium-dark focus:ring-primary-500 focus:ring-2"
            aria-label="Quick search projects"
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary-500 hover:bg-primary-600 text-primary-foreground shadow-sm"
            aria-label="Search"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
