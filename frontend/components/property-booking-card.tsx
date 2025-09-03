"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { addDays, format, differenceInDays } from "date-fns";
import {
  CalendarIcon,
  Users,
  Star,
  Shield,
  Clock,
  CreditCard,
  Gift,
  Info,
} from "lucide-react";
import type { Property } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCreateBooking } from "@/lib/api/bookings";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BookingCardProps {
  property: Property;
}

export function PropertyBookingCard ({ property }: BookingCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createBooking, isPending } = useCreateBooking();

  const [dateRange, setDateRange] = useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [guests, setGuests] = useState("2");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const nights = dateRange.to
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  const subtotal = property.pricePerNight * nights;
  const cleaningFee = 130;
  const serviceFee = Math.round(subtotal * 0.15);
  const promoDiscount = isPromoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + cleaningFee + serviceFee - promoDiscount;

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this property",
      });
      router.push("/auth/login");
      return;
    }

    if (!dateRange.to) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates",
      });
      return;
    }

    createBooking(
      {
        propertyId: property.id,
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
        guests: Number.parseInt(guests),
        totalAmount: total,
        cleaningFee,
        serviceFee,
      },
      {
        onSuccess: () => {
          toast({
            title: "Booking successful",
            description: "Your booking has been confirmed",
          });
          router.push("/bookings");
        },
        onError: () => {
          toast({
            title: "Booking failed",
            description:
              "There was an error processing your booking. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setIsPromoApplied(true);
      toast({
        title: "Promo code applied!",
        description: "You saved 10% on your booking",
      });
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check your promo code and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="sticky top-24 shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <CardTitle className="text-2xl font-bold">
                €{property.pricePerNight}
              </CardTitle>
              <span className="text-muted-foreground">/ night</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">4.8</span>
              <span className="text-sm text-muted-foreground">(24)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              <Shield className="h-3 w-3 mr-1" />
              Instant Book
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              Free cancellation
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  CHECK-IN
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "MMM d")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from) {
                          setDateRange({ from: range.from, to: range.to });
                        }
                      }}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  CHECK-OUT
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, "MMM d")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from) {
                          setDateRange({ from: range.from, to: range.to });
                        }
                      }}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Guests Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                GUESTS
              </label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="mt-1">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Select guests" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: property.guests }, (_, i) => i + 1).map(
                    (num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "guest" : "guests"}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Promo Code */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={applyPromoCode}
                disabled={isPromoApplied}
              >
                {isPromoApplied ? "Applied" : "Apply"}
              </Button>
            </div>
            {isPromoApplied && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2 text-green-600 text-sm"
              >
                <Gift className="h-4 w-4" />
                <span>10% discount applied!</span>
              </motion.div>
            )}
          </div>

          {/* Reserve Button */}
          <Button
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary cursor-pointer to-purple-600 hover:shadow-lg transition-all duration-300"
            size="lg"
            onClick={handleBooking}
            disabled={isPending || !dateRange.to}
          >
            {isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Reserve Now
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            You won&apos;t be charged yet
          </p>

          {/* Price Breakdown */}
          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
            >
              <span className="text-sm font-medium">Price breakdown</span>
              <motion.div
                animate={{ rotate: showPriceBreakdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Info className="h-4 w-4" />
              </motion.div>
            </Button>

            <AnimatePresence>
              {showPriceBreakdown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between text-sm">
                    <span>
                      €{property.pricePerNight} × {nights} nights
                    </span>
                    <span>€{subtotal}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Cleaning fee</span>
                    <span>€{cleaningFee}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Service fee</span>
                    <span>€{serviceFee}</span>
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo discount (10%)</span>
                      <span>-€{promoDiscount}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{total}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-xs text-muted-foreground">Secure Payment</p>
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-xs text-muted-foreground">Free Cancellation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
