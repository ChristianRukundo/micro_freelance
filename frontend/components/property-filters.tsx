"use client";

import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function PropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(
    searchParams.get("bathrooms") || ""
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 100,
    Number(searchParams.get("maxPrice")) || 1000,
  ]);

  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get("checkIn")
      ? new Date(searchParams.get("checkIn") as string)
      : undefined
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get("checkOut")
      ? new Date(searchParams.get("checkOut") as string)
      : undefined
  );

  const amenitiesFromUrl = searchParams.getAll("amenities");
  const [selectedAmenities, setSelectedAmenities] =
    useState<string[]>(amenitiesFromUrl);

  const amenities = [
    { id: "pool", label: "Pool" },
    { id: "wifi", label: "WiFi" },
    { id: "ac", label: "Air Conditioning" },
    { id: "gym", label: "Gym" },
    { id: "jacuzzi", label: "Jacuzzi" },
    { id: "sauna", label: "Sauna" },
  ];

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (location) params.set("location", location);
    if (guests) params.set("guests", guests);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (bathrooms) params.set("bathrooms", bathrooms);

    if (priceRange[0] > 100) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000) params.set("maxPrice", priceRange[1].toString());

    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));

    selectedAmenities.forEach((amenity) => {
      params.append("amenities", amenity);
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const resetFilters = () => {
    setLocation("");
    setGuests("");
    setBedrooms("");
    setBathrooms("");
    setPriceRange([100, 1000]);
    setCheckIn(undefined);
    setCheckOut(undefined);
    setSelectedAmenities([]);
    router.push(pathname);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Where are you going?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="dates">Dates</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP") : "Check in"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP") : "Check out"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  initialFocus
                  disabled={(date) =>
                    (checkIn ? date < checkIn : false) || date < new Date()
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="guests">Guests</Label>
          <Input
            id="guests"
            type="number"
            placeholder="Number of guests"
            min={1}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search with additional filters
              </SheetDescription>
            </SheetHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <Label>Price Range (€ per night)</Label>
                <div className="flex items-center justify-between">
                  <span>€{priceRange[0]}</span>
                  <span>€{priceRange[1]}</span>
                </div>
                <Slider
                  defaultValue={priceRange}
                  min={100}
                  max={1000}
                  step={50}
                  onValueChange={(value) =>
                    setPriceRange(value as [number, number])
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min={1}
                    placeholder="Min bedrooms"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min={1}
                    placeholder="Min bathrooms"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                  />
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="amenities">
                  <AccordionTrigger>Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      {amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`amenity-${amenity.id}`}
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={(checked) =>
                              handleAmenityChange(
                                amenity.id,
                                checked as boolean
                              )
                            }
                          />
                          <Label htmlFor={`amenity-${amenity.id}`}>
                            {amenity.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {}
        {(location ||
          guests ||
          bedrooms ||
          bathrooms ||
          priceRange[0] > 100 ||
          priceRange[1] < 1000 ||
          checkIn ||
          checkOut ||
          selectedAmenities.length > 0) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>

            {location && (
              <Badge variant="outline" className="flex items-center gap-1">
                {location}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setLocation("")}
                />
              </Badge>
            )}

            {guests && (
              <Badge variant="outline" className="flex items-center gap-1">
                {guests} guests
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setGuests("")}
                />
              </Badge>
            )}

            {bedrooms && (
              <Badge variant="outline" className="flex items-center gap-1">
                {bedrooms} bedrooms
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBedrooms("")}
                />
              </Badge>
            )}

            {bathrooms && (
              <Badge variant="outline" className="flex items-center gap-1">
                {bathrooms} bathrooms
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setBathrooms("")}
                />
              </Badge>
            )}

            {(priceRange[0] > 100 || priceRange[1] < 1000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                €{priceRange[0]} - €{priceRange[1]}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setPriceRange([100, 1000])}
                />
              </Badge>
            )}

            {checkIn && checkOut && (
              <Badge variant="outline" className="flex items-center gap-1">
                {format(checkIn, "MMM d")} - {format(checkOut, "MMM d")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    setCheckIn(undefined);
                    setCheckOut(undefined);
                  }}
                />
              </Badge>
            )}

            {selectedAmenities.map((amenity) => {
              const amenityLabel =
                amenities.find((a) => a.id === amenity)?.label || amenity;
              return (
                <Badge
                  key={amenity}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {amenityLabel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleAmenityChange(amenity, false)}
                  />
                </Badge>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={applyFilters}>Search</Button>
      </div>
    </div>
  );
}
