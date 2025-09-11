"use client";

import { motion } from "framer-motion";
import { TaskCard } from "@/components/cards/TaskCard";
import { TaskCardSkeleton } from "@/components/common/SkeletonLoaders";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Task as TaskType } from "@/lib/types";

interface AnimatedTaskSectionProps {
  popularTasks?: TaskType[];
}

export function AnimatedTaskSection({
  popularTasks,
}: AnimatedTaskSectionProps) {
  return (
    <section className="container my-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12 text-center"
      >
        <h2 className="text-display-md font-bold dark:text-neutral-100">Popular Projects</h2>
        <p className="text-body-lg mt-4 max-w-2xl mx-auto dark:text-neutral-400">
          Explore some of the most exciting and in-demand projects on our
          platform.
        </p>
      </motion.div>
      {popularTasks && popularTasks.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-lg pb-4">
          <div className="flex w-max space-x-6 p-4">
            {popularTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="inline-block w-[320px] lg:w-[350px]"
              >
                <TaskCard task={task} showApplyButton={false} />
              </motion.div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="flex items-center justify-center h-40 rounded-lg bg-muted/50 dark:bg-neutral-800/50">
          <p className="text-body-md text-muted-foreground dark:text-neutral-400">
            No popular projects available at the moment.
          </p>
        </div>
      )}
    </section>
  );
}
