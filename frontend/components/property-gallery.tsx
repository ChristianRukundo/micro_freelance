"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  X,
  Download,
  Share2,
  Heart,
  Play,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useToast } from "@/components/ui/use-toast";
interface PropertyGalleryProps {
  images: string[];
  videos?: string[];
  propertyTitle?: string;
}

export function PropertyGallery({
  images,
  videos = [],
  propertyTitle = "Property",
}: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false); // Assuming initial state is not favorite
  const [showImageInfo, setShowImageInfo] = useState(false);

  const validImages =
    images && images.length > 0
      ? images
      : ["/placeholder.svg?height=600&width=800"];

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentImageIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentImageIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  const { toast } = useToast();

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "This property is no longer in your favorites."
        : "This property has been added to your favorites!",
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  return (
    <>
      <div className="relative group">
        {/* Main Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative rounded-xl overflow-hidden">
          {/* Main Image */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2 md:row-span-2 relative aspect-[4/3] overflow-hidden cursor-pointer"
            onClick={() => setShowAllPhotos(true)}
          >
            <Image
              src={validImages[0] || "/placeholder.svg"}
              alt={`${propertyTitle} main image`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={validImages[0].includes("unsplash.com")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Video Play Button if first item is video */}
            {videos.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white/90 rounded-full p-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Play className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
            )}
          </motion.div>

          {/* Thumbnail Images */}
          {validImages.slice(1, 5).map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative aspect-[4/3] overflow-hidden cursor-pointer",
                index === 1 && "rounded-tr-xl",
                index === 3 && "rounded-br-xl"
              )}
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setShowAllPhotos(true);
              }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${propertyTitle} image ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-110"
                unoptimized={image.includes("unsplash.com")}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />

              {/* Show more overlay on last image */}
              {index === 3 && validImages.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Grid2X2 className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-sm font-medium">
                      +{validImages.length - 5} more
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={() => setShowAllPhotos(true)}
            >
              <Grid2X2 className="h-4 w-4 mr-2" />
              View all {validImages.length} photos
            </Button>
          </motion.div>
        </div>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge
            variant="secondary"
            className="bg-black/60 text-white border-0"
          >
            1 / {validImages.length}
          </Badge>
        </div>
      </div>

      <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
        <DialogTitle className="sr-only">Property Gallery</DialogTitle>
        <DialogContent className="max-w-7xl w-full p-0 h-[90vh] flex flex-col bg-black">
          {/* Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-800 bg-black/90 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-white">{propertyTitle}</h2>
              <Badge variant="secondary" className="bg-white/10 text-white">
                {currentImageIndex + 1} / {validImages.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowImageInfo(!showImageInfo)}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={handleFavoriteClick}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setShowAllPhotos(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Image Display */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentImageIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                }}
                className="absolute inset-4"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src={validImages[currentImageIndex] || "/placeholder.svg"}
                  alt={`${propertyTitle} image ${currentImageIndex + 1}`}
                  fill
                  className={cn(
                    "object-contain cursor-zoom-in transition-transform duration-300",
                    isZoomed && "scale-150 cursor-zoom-out"
                  )}
                  unoptimized={validImages[currentImageIndex].includes(
                    "unsplash.com"
                  )}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
            >
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
            >
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </motion.div>

            {/* Image Info Overlay */}
            <AnimatePresence>
              {showImageInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white"
                >
                  <h3 className="font-semibold mb-2">Image Details</h3>
                  <p className="text-sm text-gray-300">
                    High-resolution image • {currentImageIndex + 1} of{" "}
                    {validImages.length}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Thumbnail Strip */}
          <div className="p-4 border-t border-gray-800 bg-black/90">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {validImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all duration-200",
                    currentImageIndex === index
                      ? "border-white shadow-lg"
                      : "border-transparent hover:border-gray-400"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={image.includes("unsplash.com")}
                  />
                  {currentImageIndex !== index && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
