"use client";

import { useState } from "react";
import Link from "next/link";
import { useBookings, useCancelBooking } from "@/lib/api/bookings";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, SlideUp } from "@/components/animations";
import { format } from "date-fns";
import { Calendar, Loader2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Page displaying the user's bookings.
 *
 * @remarks
 * This page displays all of the user's bookings, including the property name,
 * location, check-in and check-out dates, number of guests, and total amount.
 * The user can cancel a booking by clicking the "Cancel" button.
 */
export default function BookingsPage() {
  const { toast } = useToast();
  const { data: bookingsData, isLoading } = useBookings();
  const cancelBookingMutation = useCancelBooking();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCancelClick = (id: string) => {
    setCancelId(id);
    setIsDialogOpen(true);
  };

  const confirmCancel = () => {
    if (cancelId) {
      cancelBookingMutation.mutate(cancelId, {
        onSuccess: () => {
          toast({
            title: "Booking cancelled",
            description: "Your booking has been cancelled successfully",
          });
          setIsDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to cancel booking",
            variant: "destructive",
          });
        },
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "outline";
      case "cancelled":
        return "destructive";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout>
      <FadeIn>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your property reservations
        </p>
      </FadeIn>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !bookingsData?.data || bookingsData.data.length === 0 ? (
        <SlideUp
          delay={0.1}
          className="mt-8 flex flex-col items-center justify-center"
        >
          <div className="rounded-full bg-muted p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">No bookings yet</h2>
          <p className="mt-2 text-center text-muted-foreground">
            You haven&apos;t made any bookings yet.
            <br />
            Browse our properties and book your next stay.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/villas">Browse Properties</Link>
          </Button>
        </SlideUp>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {bookingsData.data.map((booking) => (
            <SlideUp key={booking.id} delay={0.1}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">
                      {booking.property?.title || "Property"}
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {booking.property?.location || "Location"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">Check-in</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Check-out</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Guests</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.guests} guests
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-3">
                      <div className="flex justify-between">
                        <p className="font-medium">Total</p>
                        <p className="font-medium">${booking.totalAmount}</p>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Includes cleaning fee (${booking.cleaningFee}) and
                        service fee (${booking.serviceFee})
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    disabled={
                      booking.status === "cancelled" ||
                      booking.status === "completed" ||
                      cancelBookingMutation.isPending
                    }
                    onClick={() => handleCancelClick(booking.id)}
                  >
                    {cancelBookingMutation.isPending &&
                    cancelId === booking.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Cancel
                  </Button>
                  <Button asChild>
                    <Link href={`/villas/${booking.propertyId}`}>
                      View Property
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </SlideUp>
          ))}
        </div>
      )}
      

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={cancelBookingMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
