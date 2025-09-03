"use client";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  location: string;

}

export function PropertyMap({ location }: PropertyMapProps) {
  return (
    <div className="relative h-80 bg-muted rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 mx-auto mb-2 text-primary" />
          <p className="font-medium">{location}</p>
          <p className="text-sm text-muted-foreground">
            Exact location provided after booking
          </p>
        </div>
      </div>
    </div>
  );
}
