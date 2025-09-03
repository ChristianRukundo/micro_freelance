"use client";

import { PropertyBookingCard } from "@/components/property-card";
import { PropertySkeleton } from "@/components/property-skeleton";
import { StaggerChildren } from "@/components/animations";
import { useFeaturedProperties } from "@/lib/api/properties";

export function FeaturedProperties() {
  const {
    data: featuredProperties,
    isLoading,
    error,
  } = useFeaturedProperties();
  const properties = featuredProperties?.data || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <PropertySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error || !properties || properties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No featured properties found</h3>
        <p className="text-muted-foreground">
          Check back later for our featured listings
        </p>
      </div>
    );
  }

  return (
    <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property, _index) => (
        <PropertyBookingCard key={property.id} property={property} />
      ))}
    </StaggerChildren>
  );
}
