"use client";

import { Metadata } from "next";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { PaginatedResponse, User, UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  SearchIcon,
  FilterIcon,
  Loader2Icon,
  UserCogIcon,
  BanIcon,
  SlashIcon,
  UserCheckIcon,
  MoveRightIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  TextBlockSkeleton,
  Skeleton,
  AvatarTextSkeleton,
} from "@/components/common/SkeletonLoaders";

import { updateUserStatusSchema } from "@/lib/schemas";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Metadata for client components should be exported from a layout.tsx or a generateMetadata function in a server component
// This example is for illustrative purposes of data fetching
// export const metadata: Metadata = {
//   title: 'Admin Users - Micro Freelance Marketplace',
//   description: 'Manage users on the platform.',
// };

interface UserQueryFilters {
  q?: string;
  role?: UserRole;
  isSuspended?: boolean;
}

interface UsersPaginatedResponse extends PaginatedResponse<User> {
  users: User[];
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserQueryFilters>({});
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<UsersPaginatedResponse, Error>({
    queryKey: ["adminUsers", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        q: filters.q || undefined,
        page: pageParam,
        limit: 10,
      };
      const response = await api.get("/admin/users", { params });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    refetch(); // Refetch on filter change
  }, [filters, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: searchTerm }));
  };

  const handleFilterChange = (key: keyof UserQueryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const isEmpty = !isLoading && !isFetchingNextPage && allUsers.length === 0;

  // --- Mutations for User Actions ---
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({
      userId,
      isSuspended,
    }: {
      userId: string;
      isSuspended: boolean;
    }) => {
      const response = await api.patch(`/admin/users/${userId}/status`, {
        isSuspended,
      });
      return response.data;
    },
    onMutate: async ({ userId, isSuspended }) => {
      await queryClient.cancelQueries({ queryKey: ["adminUsers"] });
      const previousUsers = queryClient.getQueryData<UsersPaginatedResponse>([
        "adminUsers",
      ]);
      queryClient.setQueryData<UsersPaginatedResponse>(
        ["adminUsers"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: (old as any).pages.map((page: any) => ({
              ...page,
              users: page.users.map((user: any) =>
                user.id === userId ? { ...user, isSuspended } : user
              ),
            })),
          };
        }
      );
      return { previousUsers };
    },
    onSuccess: (response, { userId }) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(error.message);
      queryClient.setQueryData(["adminUsers"], context?.previousUsers); // Rollback
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: ["adminUsers"] });
      const previousUsers = queryClient.getQueryData<UsersPaginatedResponse>([
        "adminUsers",
      ]);
      queryClient.setQueryData<UsersPaginatedResponse>(
        ["adminUsers"],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: (old as any).pages.map((page: any) => ({
              ...page,
              users: page.users.filter((user: any) => user.id !== userId),
            })),
          };
        }
      );
      return { previousUsers };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      } else {
        toast.error(response.message);
      }
    },
    onError: (error, _variables, context) => {
      toast.error(error.message);
      queryClient.setQueryData(["adminUsers"], context?.previousUsers); // Rollback
    },
  });

  return (
    <div className="flex flex-col space-y-8">
      <h1 className="text-display-md font-extrabold">Admin User Management</h1>
      <p className="text-body-md">
        Manage all users on the platform: view, suspend, and delete accounts.
      </p>

      {/* Filters and Search */}
      <div className="mb-6 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <form
          onSubmit={handleSearch}
          className="md:col-span-2 lg:col-span-2 relative"
        >
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 shadow-soft dark:shadow-soft-dark"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10 hover:text-primary-500"
            aria-label="Search"
          >
            <FilterIcon className="h-5 w-5" />
          </Button>
        </form>

        <Select
          value={filters.role || ""}
          onValueChange={(value) =>
            handleFilterChange(
              "role",
              value === "" ? undefined : (value as UserRole)
            )
          }
        >
          <SelectTrigger className="shadow-soft dark:shadow-soft-dark">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.CLIENT}>Client</SelectItem>
            <SelectItem value={UserRole.FREELANCER}>Freelancer</SelectItem>
            <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={
            filters.isSuspended === true
              ? "true"
              : filters.isSuspended === false
                ? "false"
                : ""
          }
          onValueChange={(value) =>
            handleFilterChange(
              "isSuspended",
              value === "" ? undefined : value === "true"
            )
          }
        >
          <SelectTrigger className="shadow-soft dark:shadow-soft-dark">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="shadow-soft dark:shadow-soft-dark hover:text-destructive-500"
        >
          <XIcon className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      </div>

      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <CardTitle className="text-h3">User Accounts</CardTitle>
          <CardDescription className="text-body-md">
            Overview of all registered users on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <AvatarTextSkeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-6 w-20 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))}

                {allUsers.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={
                              user.profile?.avatarUrl ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
                            }
                            alt={user.email}
                          />
                          <AvatarFallback>
                            {(user.profile?.firstName || user.email)
                              ?.charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-body-md font-semibold">
                            {user.profile?.firstName} {user.profile?.lastName}
                          </p>
                          <p className="text-caption">
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          user.isSuspended
                            ? "bg-error-50 text-error-600 border-error-200"
                            : "bg-success-50 text-success-600 border-success-200"
                        }
                      >
                        {user.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <UserCogIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {user.role !== UserRole.ADMIN && ( // Cannot modify admin via this UI
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateUserStatusMutation.mutate({
                                    userId: user.id,
                                    isSuspended: !user.isSuspended,
                                  })
                                }
                                disabled={updateUserStatusMutation.isPending}
                              >
                                {user.isSuspended ? (
                                  <>
                                    <UserCheckIcon className="mr-2 h-4 w-4" />{" "}
                                    Activate Account
                                  </>
                                ) : (
                                  <>
                                    <BanIcon className="mr-2 h-4 w-4" /> Suspend
                                    Account
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteUserMutation.mutate(user.id)
                                }
                                disabled={deleteUserMutation.isPending}
                                className="text-destructive-500"
                              >
                                {deleteUserMutation.isPending ? (
                                  <>
                                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />{" "}
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2Icon className="mr-2 h-4 w-4" />{" "}
                                    Delete Account
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                          {user.role === UserRole.ADMIN && (
                            <DropdownMenuItem disabled className="">
                              <SlashIcon className="mr-2 h-4 w-4" /> Cannot
                              modify Admin
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
          {isEmpty && (
            <div className="py-6 text-center text-body-md">
              <FilterIcon className="h-16 w-16 mb-4 mx-auto" />
              <h2 className="text-h3">
                No users found matching your criteria.
              </h2>
              <p className="text-body-md">
                Try adjusting your filters or search terms.
              </p>
              <Button onClick={handleClearFilters} className="mt-4">
                Reset Filters
              </Button>
            </div>
          )}
          {hasNextPage && (
            <div ref={ref} className="mt-8 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="shadow-primary dark:shadow-primary-dark group"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoadingSpinner
                      size="sm"
                      color="text-primary-foreground"
                      className="mr-2"
                    />{" "}
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More{" "}
                    <MoveRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
