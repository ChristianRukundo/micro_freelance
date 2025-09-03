"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  ShieldCheck,
  CalendarHeart,
  User,
  Map,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: <Home className="h-8 w-8 text-primary" />,
    title: "Exclusive Properties",
    description: "Curated selection of luxury villas in prime locations.",
    className: "col-span-3 lg:col-span-2",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Secure & Trusted",
    description: "Verified listings and secure payment processing.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    icon: <CalendarHeart className="h-8 w-8 text-primary" />,
    title: "Seamless Booking",
    description: "Effortless reservation process from start to finish.",
    className: "col-span-3 lg:col-span-1",
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    title: "Expert Agent Support",
    description: "Dedicated agents to assist you every step of the way.",
    className: "col-span-3 lg:col-span-2",
  },
  {
    icon: <Map className="h-8 w-8 text-primary" />,
    title: "Discover Rwanda",
    description: "Properties near stunning national parks and cultural sites.",
    className: "col-span-3 lg:col-span-2",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "Unique Experiences",
    description: "More than a stay—we help you create unforgettable memories.",
    className: "col-span-3 lg:col-span-1",
  },
];

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const BentoFeatures = () => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-3 grid-rows-3 gap-4 lg:gap-8"
    >
      {features.map((feature) => (
        <motion.div
          key={feature.title}
          variants={featureVariants}
          className={cn(
            "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1",
            feature.className
          )}
        >
          <div className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 opacity-50 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125">
            {feature.icon}
          </div>
          <div className="relative z-10">
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="mt-2 text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};