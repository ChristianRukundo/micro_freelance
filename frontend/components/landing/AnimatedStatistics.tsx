"use client";

import { motion } from "framer-motion";

const statistics = [
  { value: "1000+", label: "Happy Clients" },
  { value: "5000+", label: "Projects Completed" },
  { value: "500+", label: "Expert Freelancers" },
  { value: "99%", label: "Satisfaction Rate" },
];

export function AnimatedStatistics() {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {statistics.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
            className="space-y-2"
          >
            <p className="text-display-lg font-extrabold text-primary-500">
              {stat.value}
            </p>
            <h3 className="text-h4 font-bold dark:text-neutral-100">{stat.label}</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
