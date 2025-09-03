"use client";

import { useState } from "react";
import { useAgentBookings, useUpdateBookingStatus } from "@/lib/api/agent";
import { DashboardLayout } from "@/components/dashboard-layout";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, SlideUp } from "@/components/animations";
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export default function AgentBookingsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: bookingsData, isLoading } = useAgentBookings();
  const updateBookingStatusMutation = useUpdateBookingStatus();

  const handleStatusChange = (
    id: string,
    status: "confirmed" | "cancelled" | "completed"
  ) => {
    updateBookingStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: "Booking updated",
            description: `Booking status changed to ${status}`,
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update booking status",
            variant: "destructive",
          });
        },
      }
    );
  };

  const filteredBookings = bookingsData?.data
    ? bookingsData.data.filter(
        (booking) =>
          booking.property?.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
    <DashboardLayout requireAgent>
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage bookings for your properties
            </p>
          </div>
        </div>
      </FadeIn>

      <SlideUp delay={0.1} className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Bookings</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              {filteredBookings.length} bookings found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center">
                <p className="text-center text-muted-foreground">
                  No bookings found
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.property?.title}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{booking.user?.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {booking.user?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>${booking.totalAmount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(booking.status)}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {booking.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "confirmed"
                                      )
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "cancelled"
                                      )
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === "confirmed" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "completed"
                                      )
                                    }
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Mark as Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        booking.id,
                                        "cancelled"
                                      )
                                    }
                                  >
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(booking.status === "cancelled" ||
                                booking.status === "completed") && (
                                <DropdownMenuItem disabled>
                                  <Clock className="mr-2 h-4 w-4" />
                                  No actions available
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </SlideUp>
    </DashboardLayout>
  );
}
