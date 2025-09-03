"use client";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {  useAgentBookings } from "@/lib/api/agent";
import { useState } from "react";
import { format } from "date-fns";
import { Check, X, Eye } from "lucide-react";

export function AgentBookings() {


  const { data: bookingsResponse, isLoading } = useAgentBookings();
  const bookings = bookingsResponse?.data || [];

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bookings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Booking Management</CardTitle>
          <CardDescription>
            View and manage all property bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.id.substring(0, 8)}
                  </TableCell>
                  <TableCell>{booking.property.title}</TableCell>
                  <TableCell>{booking.user.name}</TableCell>
                  <TableCell>
                    {format(new Date(booking.checkIn), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.checkOut), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>€{booking.totalAmount}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Confirm</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information about this booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Booking ID
                  </h3>
                  <p>{selectedBooking.id}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Status
                  </h3>
                  <p>{getStatusBadge(selectedBooking.status)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Property
                </h3>
                <p>{selectedBooking.property.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Check In
                  </h3>
                  <p>
                    {format(new Date(selectedBooking.checkIn), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Check Out
                  </h3>
                  <p>
                    {format(new Date(selectedBooking.checkOut), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Guest
                </h3>
                <p>{selectedBooking.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.user.email}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Guests
                </h3>
                <p>{selectedBooking.guests} guests</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-sm text-muted-foreground">Nights</div>
                  <div className="text-right">
                    {selectedBooking.nights} nights
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Price per night
                  </div>
                  <div className="text-right">
                    €{selectedBooking.property.pricePerNight}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Cleaning fee
                  </div>
                  <div className="text-right">
                    €{selectedBooking.cleaningFee}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Service fee
                  </div>
                  <div className="text-right">
                    €{selectedBooking.serviceFee}
                  </div>

                  <div className="font-medium">Total</div>
                  <div className="font-medium text-right">
                    €{selectedBooking.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
