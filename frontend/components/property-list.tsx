"use client";

import { PropertyBookingCard } from "@/components/property-card";
import { Pagination } from "@/components/pagination";
import { StaggerChildren } from "@/components/animations";
import { useProperties } from "@/lib/api/properties";
import { PropertyListSkeleton } from "@/components/property-list-skeleton";
import type { PropertySearchParams } from "@/lib/types";

interface PropertyListProps {
  searchParams: PropertySearchParams;
}

export function PropertyList({ searchParams }: PropertyListProps) {
  const page =
    typeof searchParams.page === "number"
      ? searchParams.page
      : typeof searchParams.page === "string"
      ? Number.parseInt(searchParams.page)
      : 1;

  const {
    data: response,
    isLoading,
    error,
  } = useProperties({
    ...searchParams,
    page,
  });

  if (isLoading) {
    return <PropertyListSkeleton />;
  }

  if (error || !response || !response.data) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Error loading properties</h3>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const { properties, totalPages, totalProperties } = response.data;

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No properties found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm text-muted-foreground">
        Found {totalProperties}{" "}
        {totalProperties === 1 ? "property" : "properties"}
      </div>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property, index) => (
          <PropertyBookingCard key={property.id} property={property} index={index} />
        ))}
      </StaggerChildren>

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
