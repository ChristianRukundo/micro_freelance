"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Users,
  Bed,
  Bath,
  Square,
  Star,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export function PropertyBookingCard({
  property,
  index = 0,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const imageUrl =
    property.images?.[currentImageIndex] ||
    "/placeholder.svg?height=400&width=600";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        className="group"
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div
            className="relative aspect-[4/3] overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={imageUrl || "/placeholder.svg"}
              alt={property.title}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                isHovered && "scale-110"
              )}
              unoptimized={imageUrl.includes("unsplash.com")}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Image Navigation Dots */}
            {property.images && property.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                {property.images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      idx === currentImageIndex ? "bg-white" : "bg-white/50"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={handleFavoriteClick}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors duration-300",
                      isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                    )}
                  />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={handleQuickView}
                >
                  <Eye className="h-4 w-4 text-gray-600" />
                </Button>
              </motion.div>
            </div>

            {/* Price Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
                €{property.pricePerNight}/night
              </Badge>
            </div>

            {/* Rating Badge */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                4.8
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
                {property.subLocation && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{property.subLocation}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <Link href={`/villas/${property.id}`}>
                <h3 className="font-bold text-xl group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {property.title}
                </h3>
              </Link>

              {/* Property Details */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{property.guests}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>{property.squareMeters}m²</span>
                </div>
              </div>

              {/* Amenities Preview */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {property.amenities.slice(0, 3).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {property.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{property.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/villas/${property.id}`}>View Details</Link>
                </Button>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick View Modal */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{property.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover"
                  unoptimized={imageUrl.includes("unsplash.com")}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {property.images?.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative rounded overflow-hidden"
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${property.title} ${idx + 1}`}
                      fill
                      className="object-cover cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => setCurrentImageIndex(idx)}
                      unoptimized={img.includes("unsplash.com")}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  €{property.pricePerNight}/night
                </div>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Star className="h-3 w-3 fill-white mr-1" />
                  4.8 (24 reviews)
                </Badge>
              </div>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
                {property.subLocation && `, ${property.subLocation}`}
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div className="text-center">
                  <div className="font-semibold">{property.guests}</div>
                  <div className="text-sm text-muted-foreground">Guests</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{property.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{property.bathrooms}</div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{property.squareMeters}m²</div>
                  <div className="text-sm text-muted-foreground">Area</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {property.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href={`/villas/${property.id}`}>View Full Details</Link>
                </Button>
                <Button variant="outline" onClick={handleFavoriteClick}>
                  <Heart
                    className={cn(
                      "h-4 w-4 mr-2",
                      isFavorite ? "fill-red-500 text-red-500" : ""
                    )}
                  />
                  {isFavorite ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
