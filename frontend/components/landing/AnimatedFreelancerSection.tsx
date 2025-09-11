"use client";

import { motion } from "framer-motion";
import { FreelancerCard } from "@/components/cards/FreelancerCard";
import { FreelancerCardSkeleton } from "@/components/common/SkeletonLoaders";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { User as UserType } from "@/lib/types";

interface AnimatedFreelancerSectionProps {
  topFreelancers?: UserType[];
}

export function AnimatedFreelancerSection({
  topFreelancers,
}: AnimatedFreelancerSectionProps) {
  return (
    <section className="container my-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12 text-center"
      >
        <h2 className="text-display-md font-bold dark:text-neutral-100">Our Top Freelancers</h2>
        <p className="text-body-lg mt-4 max-w-2xl mx-auto dark:text-neutral-400">
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
        <div className="flex items-center justify-center h-40 rounded-lg bg-muted/50 dark:bg-neutral-800/50">
          <p className="text-body-md text-muted-foreground dark:text-neutral-400">
            No top freelancers found at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
