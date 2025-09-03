"use client";

import { PropertyList } from "@/components/property-list";
import { PropertyFilters } from "@/components/property-filters";
import { PropertyListSkeleton } from "@/components/property-list-skeleton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";


export default function VillasPage() {
  const searchParams = useSearchParams();

  
  const params: { [key: string]: string | string[] } = {};
  searchParams.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return (
    <>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">All Villas</h1>
          <p className="text-muted-foreground">
            Find your perfect luxury villa for your next vacation
          </p>
        </div>

        <PropertyFilters />

        <Suspense fallback={<PropertyListSkeleton />}>
          <PropertyList searchParams={params} />
        </Suspense>
      </div>
    </>
  );
}
