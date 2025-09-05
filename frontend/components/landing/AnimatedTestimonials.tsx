"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AnimatedTestimonials() {
  return (
    <section className="w-full bg-gradient-to-br from-blue-500/10 to-blue-200/5 py-24">
      <div className="container text-center max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-display-md font-bold mb-12"
        >
          What Our Users Say
        </motion.h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[1, 2].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200 p-6 text-left relative overflow-hidden group">
                <span className="absolute top-0 right-0 h-24 w-24 translate-x-1/4 -translate-y-1/4 rotate-45 transform bg-primary-500/5 text-primary-500/10 text-display-lg font-extrabold -z-10 opacity-70">
                  "
                </span>
                <CardContent className="p-0 space-y-4">
                  <p className="text-body-lg italic">
                    &ldquo;This platform has revolutionized how I find and
                    manage my freelance projects. The escrow system gives me
                    peace of mind, and the talent pool is exceptional!&rdquo;
                  </p>
                  <div className="flex items-center mt-4">
                    <Avatar className="h-12 w-12 mr-3 border-2 border-primary-500">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=JD`}
                        alt="Client"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-h6">Jane Doe</p>
                      <p className="text-body-sm">CEO, Startup X</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
