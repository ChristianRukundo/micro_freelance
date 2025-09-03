"use client";

import { useRouter } from "next/navigation";
import { useProperty } from "@/lib/api/properties";
import { PropertyGallery } from "@/components/property-gallery";
import { PropertyGallerySkeleton } from "@/components/property-gallery-skeleton";
import { PropertyAmenities } from "@/components/property-amenities";
import { PropertyBookingCard } from "@/components/property-booking-card";
import { PropertyMap } from "@/components/property-map";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property } from "@/lib/types";
import { use } from "react";


export default function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { data: propertyResponse, isLoading, error } = useProperty(id);

  // Extract the actual property data from the API response
  const property: Property | undefined = propertyResponse?.data;

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        <PropertyGallerySkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            <div className="mb-8">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    router.push("/villas");
    return null;
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
        <div className="flex items-center text-muted-foreground">
          <span>{property.location}</span>
          {property.subLocation && (
            <>
              <span className="mx-1">•</span>
              <span>{property.subLocation}</span>
            </>
          )}
        </div>
      </div>

      <PropertyGallery images={property.images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <h3 className="font-medium">Guests</h3>
              <p>{property.guests} guests</p>
            </div>
            <div>
              <h3 className="font-medium">Bedrooms</h3>
              <p>{property.bedrooms} bedrooms</p>
            </div>
            <div>
              <h3 className="font-medium">Bathrooms</h3>
              <p>{property.bathrooms} bathrooms</p>
            </div>
            <div>
              <h3 className="font-medium">Size</h3>
              <p>{property.squareMeters} m²</p>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">About this villa</h2>
            <div className="prose max-w-none">
              <p>{property.description}</p>
            </div>
          </div>

          <Separator className="my-8" />

          <PropertyAmenities amenities={property.amenities} />

          <Separator className="my-8" />

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <PropertyMap
              location={property.location}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <PropertyBookingCard property={property} />
          </div>
        </div>
      </div>
    </div>
  );
}
