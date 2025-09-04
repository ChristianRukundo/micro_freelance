'use client';

import { motion } from "framer-motion";
import { FreelancerCard } from "@/components/cards/FreelancerCard";
import { FreelancerCardSkeleton } from "@/components/common/SkeletonLoaders";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User as UserType } from "@/lib/types";

interface AnimatedFreelancerSectionProps {
  topFreelancers?: UserType[];
}

export function AnimatedFreelancerSection({ topFreelancers }: AnimatedFreelancerSectionProps) {
  return (
    <section className="container my-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12 text-center"
      >
        <h2 className="text-display-md font-bold text-neutral-800">
          Our Top Freelancers
        </h2>
        <p className="text-body-lg text-neutral-600 mt-4 max-w-2xl mx-auto">
          Meet the highly-rated and skilled professionals ready to bring your
          ideas to life.
        </p>
      </motion.div>
      {topFreelancers && topFreelancers.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-lg pb-4">
          <div className="flex w-max space-x-6 p-4">
            {topFreelancers.map((freelancer, index) => (
              <motion.div
                key={freelancer.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="inline-block w-[280px] lg:w-[300px]"
              >
                <FreelancerCard freelancer={freelancer} />
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <FreelancerCardSkeleton key={i} />
          ))}
        </div>
      )}
    </section>
  );
}
