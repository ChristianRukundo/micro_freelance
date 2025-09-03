"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export const PropertyShowcaseSection = () => {
  const [activeProperty, setActiveProperty] = useState(0);
  const properties = [
    {
      id: 1,
      title: "Villa Luna",
      location: "Nyungwe Forest",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop",
      features: ["Ocean View", "Private Pool", "5 Bedrooms"],
    },
    {
      id: 2,
      title: "Villa Serena",
      location: "Lake Kivu",
      price: 380,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2080&auto=format&fit=crop",
      features: ["Lake View", "Spa", "4 Bedrooms"],
    },
    {
      id: 3,
      title: "Mountain Lodge",
      location: "Volcanoes National Park",
      price: 520,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      features: ["Mountain View", "Fireplace", "6 Bedrooms"],
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              Featured Properties
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Exceptional Stays
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover handpicked luxury properties that redefine comfort and
              elegance in Rwanda&apos;s most breathtaking locations.
            </p>

            <div className="space-y-4">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  className={cn(
                    "p-6 rounded-2xl cursor-pointer transition-all duration-300",
                    activeProperty === index
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 shadow-lg"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setActiveProperty(index)}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {property.title}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {property.location}
                      </p>
                      <div className="flex gap-2">
                        {property.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        €{property.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per night
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProperty}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <GlassCard className="p-2 overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src={
                        properties[activeProperty].image || "/placeholder.svg"
                      }
                      alt={properties[activeProperty].title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {properties[activeProperty].title}
                      </h3>
                      <p className="text-white/80 mb-4">
                        {properties[activeProperty].location}
                      </p>
                      <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
