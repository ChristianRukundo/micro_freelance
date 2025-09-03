"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NeumorphButton } from "@/components/ui/neumorph-button";
import { Button } from "@/components/ui/button";

export const ExploreDestinationsSection = () => {
  const destinations = [
    {
      name: "Kigali City",
      image:
        "https://images.unsplash.com/photo-1653059855202-54ff823aab68?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Vibrant capital with modern amenities and rich history.",
      link: "/destinations/kigali",
    },
    {
      name: "Lake Kivu",
      image:
        "https://images.unsplash.com/photo-1487203007409-91f19b5b4f62?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Relaxing lakeside retreats and beautiful scenery.",
      link: "/destinations/lake-kivu",
    },
    {
      name: "Volcanoes National Park",
      image:
        "https://images.unsplash.com/photo-1662612732223-1fe6ea43263e?q=80&w=1041&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description:
        "Home to mountain gorillas and stunning volcanic landscapes.",
      link: "/destinations/volcanoes-national-park",
    },
  ];

  return (
    <section className="py-32 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.05),transparent)] dark:bg-[radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.02),transparent)]" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-6 px-6 py-2 text-lg">
            Explore Beyond
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Top Destinations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the most sought-after locations in Rwanda, each offering a
            unique charm and experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="group relative rounded-3xl overflow-hidden shadow-xl"
            >
              <Image
                src={destination.image}
                alt={destination.name}
                width={600}
                height={400}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/80 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-bold mb-2">{destination.name}</h3>
                <p className="text-white/80 mb-4">{destination.description}</p>
                <Link href={destination.link} passHref>
                  <Button
                    variant="ghost"
                    className="text-white border border-white/30 hover:bg-white/20 hover:text-white transition-all duration-300"
                  >
                    Discover
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <NeumorphButton variant="default" className="text-lg px-12 py-6">
            <Link href="/destinations" className="flex items-center">
              View All Destinations
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </NeumorphButton>
        </motion.div>
      </div>
    </section>
  );
};
