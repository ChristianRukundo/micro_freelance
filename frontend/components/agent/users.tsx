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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAgentUsers } from "@/lib/api/agent";
import { useState } from "react";
import { format } from "date-fns";
import { Eye, UserCog, UserX } from "lucide-react";
import type { User } from "@/lib/types";

export function AgentUsers() {
  const { data: usersResponse, isLoading } = useAgentUsers();

  // Extract the actual users data from the API response
  const users: User[] | undefined = usersResponse?.data;

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "agent":
        return <Badge className="bg-purple-500">Agent</Badge>;
      case "user":
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (!users) {
    return <div>No users found</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Users</h2>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{user.bookingsCount || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <UserCog className="h-4 w-4" />
                        <span className="sr-only">Edit Role</span>
                      </Button>
                      {user.role !== "AGENT" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                        >
                          <UserX className="h-4 w-4" />
                          <span className="sr-only">Disable</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedUser.image || ""}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Role
                  </h3>
                  <div>{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Joined
                  </h3>
                  <p>
                    {format(new Date(selectedUser.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Bookings
                  </h3>
                  <p>{selectedUser.bookingsCount || 0} bookings</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Favorites
                  </h3>
                  <p>{selectedUser.favoritesCount || 0} properties</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Last Login
                </h3>
                <p>
                  {selectedUser.lastLogin
                    ? format(
                        new Date(selectedUser.lastLogin),
                        "MMM d, yyyy 'at' h:mm a"
                      )
                    : "Never"}
                </p>
              </div>

              {selectedUser.bookings && selectedUser.bookings.length > 0 && (
                <div>
                  <h3 className="font-medium">Recent Bookings</h3>
                  <div className="mt-2 space-y-2">
                    {selectedUser.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="text-sm border rounded-md p-2"
                      >
                        <div className="font-medium">
                          {booking.property?.title}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(booking.checkIn), "MMM d")} -{" "}
                          {format(new Date(booking.checkOut), "MMM d, yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
