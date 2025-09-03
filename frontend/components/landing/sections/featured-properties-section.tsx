"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NeumorphButton } from "@/components/ui/neumorph-button";
import { FeaturedProperties } from "@/components/featured-properties";

export const FeaturedPropertiesSection = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-muted/30 to-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className="mb-6 px-6 py-2 text-lg">
            Handpicked Collection
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Featured Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each property in our collection is carefully selected for its unique
            character, exceptional amenities, and breathtaking locations.
          </p>
        </motion.div>

        <FeaturedProperties />

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <NeumorphButton variant="primary" className="text-lg px-12 py-6">
            <Link href="/villas" className="flex items-center">
              Explore All Properties
              <ArrowUpRight className="ml-2 h-6 w-6" />
            </Link>
          </NeumorphButton>
        </motion.div>
      </div>
    </section>
  );
};
