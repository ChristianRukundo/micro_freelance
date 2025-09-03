"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Users, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";
import { DateRange } from "react-day-picker";

export const HeroInteractiveSearch = () => {
  const router = useRouter();
  const [focused, setFocused] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (location) {
      params.set("location", location);
    }
    if (dateRange?.from) {
      params.set("checkIn", format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
      params.set("checkOut", format(dateRange.to, "yyyy-MM-dd"));
    }
    if (guests) {
      params.set("guests", guests);
    }

    router.push(`/villas?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-6xl mx-auto"
    >
      <GlassCard className="p-4 relative overflow-hidden md:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />

        <form onSubmit={handleSearch} className="relative z-10">
          <motion.h3
            className="text-2xl font-bold text-white mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Find Your Perfect Escape
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl transition-all duration-300",
                  focused === "location"
                    ? "ring-2 ring-blue-400 shadow-lg shadow-blue-400/25"
                    : "ring-1 ring-white/10"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
                <div className="relative flex items-center p-4 h-full">
                  <MapPin className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Where
                    </label>
                    <Input
                      placeholder="Search destinations"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setFocused("location")}
                      onBlur={() => setFocused(null)}
                      className="bg-transparent border-0 p-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Date Range Picker */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer h-full",
                      focused === "date"
                        ? "ring-2 ring-purple-400 shadow-lg shadow-purple-400/25"
                        : "ring-1 ring-white/10"
                    )}
                    onFocus={() => setFocused("date")}
                    onBlur={() => setFocused(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
                    <Button
                      variant={"ghost"}
                      className={cn(
                        "relative flex items-center p-4 w-full justify-start text-left font-normal h-full hover:bg-transparent",
                        !dateRange && "text-white/60"
                      )}
                    >
                      <CalendarIcon className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-white/80 mb-1">
                          When
                        </label>
                        <span className="text-white">
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Add dates</span>
                          )}
                        </span>
                      </div>
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </motion.div>

            {/* Guests Input */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl transition-all duration-300",
                  focused === "guests"
                    ? "ring-2 ring-pink-400 shadow-lg shadow-pink-400/25"
                    : "ring-1 ring-white/10"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm" />
                <div className="relative flex items-center p-4 h-full">
                  <Users className="h-5 w-5 text-pink-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-white/80 mb-1">
                      Who
                    </label>
                    <Input
                      type="number"
                      placeholder="Add guests"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      onFocus={() => setFocused("guests")}
                      onBlur={() => setFocused(null)}
                      className="bg-transparent border-0 p-0 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Search className="h-6 w-6 mr-2" />
                Search
              </Button>
            </motion.div>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
};