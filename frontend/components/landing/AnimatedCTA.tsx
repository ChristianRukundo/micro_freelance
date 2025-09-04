'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AnimatedCTA() {
  return (
    <section className="w-full bg-gradient-to-r from-primary-500 to-primary-600 py-20 text-center text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="container max-w-4xl space-y-8"
      >
        <h2 className="text-display-md font-bold drop-shadow-sm">
          Ready to Build Something Great?
        </h2>
        <p className="text-body-lg text-primary-50">
          Join our thriving community today and transform your ideas into
          reality.
        </p>
        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/register" passHref>
            <Button
              size="lg"
              variant="default"
              className="text-primary-500 bg-white hover:bg-neutral-100 shadow-lg shadow-white/30 px-8 py-3 text-h6 font-semibold"
            >
              Get Started Free
            </Button>
          </Link>
          <Link href="/tasks" passHref>
            <Button
              size="lg"
              variant="primary-outline"
              className="border-white text-white bg-transparent hover:bg-white/10 px-8 py-3 text-h6 font-semibold"
            >
              Explore Opportunities
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
