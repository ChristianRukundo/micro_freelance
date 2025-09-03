"use client";

import { useFavorites } from "@/lib/api/favorites";
import { PropertyBookingCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FadeIn, SlideUp } from "@/components/animations";
import { Loader2, Heart } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function FavoritesPage() {
  const router = useRouter();
  const { data: favoritesData, isLoading } = useFavorites();

  return (
    <DashboardLayout>
      <FadeIn>
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="mt-1 text-muted-foreground">
          Your collection of saved properties
        </p>
      </FadeIn>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !favoritesData?.data || favoritesData.data.length === 0 ? (
        <SlideUp
          delay={0.1}
          className="mt-8 flex flex-col items-center justify-center"
        >
          <div className="rounded-full bg-muted p-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No favorites yet</h2>
          <p className="mt-2 text-center text-muted-foreground">
            You haven&apos;t saved any properties to your favorites yet.
            <br />
            Browse our collection and click the heart icon to save properties.
          </p>
          <Button className="mt-6" onClick={() => router.push("/villas")}>
            Browse Properties
          </Button>
        </SlideUp>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoritesData.data &&
            favoritesData.data.map((favorite) => (
              <PropertyBookingCard key={favorite.property.id} property={favorite.property} />
            ))}
        </div>
      )}
    </DashboardLayout>
  );
}
