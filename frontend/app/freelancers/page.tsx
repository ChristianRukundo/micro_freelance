"use client";

import { Metadata } from "next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import React from "react";
import api from "@/lib/api";
import { User, UserRole } from "@/lib/types";
import { FreelancerCard } from "@/components/cards/FreelancerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilterIcon,
  SearchIcon,
  XCircleIcon,
  MoveRightIcon,
} from "lucide-react";
import { FreelancerCardSkeleton } from "@/components/common/SkeletonLoaders"; // Custom skeleton
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface FreelancerQueryFilters {
  q?: string;
  skill?: string;
  minRating?: number; // Not implemented in backend yet, but can be added
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface FreelancersPaginatedResponse {
  users: User[]; // Backend endpoint returns 'users'
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export default function FreelancerDiscoveryPage() {
  const [filters, setFilters] = React.useState<FreelancerQueryFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [searchTerm, setSearchTerm] = React.useState<string>("");

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
  } = useInfiniteQuery<FreelancersPaginatedResponse, Error>({
    queryKey: ["freelancers", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        q: filters.q || undefined,
        role: UserRole.FREELANCER,
        page: pageParam,
        limit: 10,
      };
      const response = await api.get("/users", { params }); // Reusing admin/users endpoint with role filter
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

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  React.useEffect(() => {
    refetch(); // Refetch when filters change
  }, [filters, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: searchTerm }));
  };

  const handleFilterChange = (
    key: keyof FreelancerQueryFilters,
    value: any
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: "createdAt", sortOrder: "desc" });
    setSearchTerm("");
  };

  const allFreelancers = data?.pages.flatMap((page) => page.users) || [];
  const isEmpty =
    !isLoading && !isFetchingNextPage && allFreelancers.length === 0;

  return (
    <div className="container py-8">
      <h1 className="text-display-md font-extrabold mb-8">
        Discover Talented Freelancers
      </h1>

      {/* Filter and Search Bar */}
      <div className="mb-8 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <form
          onSubmit={handleSearch}
          className="md:col-span-2 lg:col-span-2 relative"
        >
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <Input
            placeholder="Search by name or email..."
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
            <MoveRightIcon className="h-5 w-5" />
          </Button>
        </form>

        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="shadow-soft dark:shadow-soft-dark">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Joined</SelectItem>
            {/* Add other sort options if available in backend, e.g., 'rating', 'projectsCompleted' */}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortOrder || "desc"}
          onValueChange={(value) => handleFilterChange("sortOrder", value)}
        >
          <SelectTrigger className="shadow-soft dark:shadow-soft-dark">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="shadow-soft dark:shadow-soft-dark hover:text-destructive-500"
        >
          <XCircleIcon className="h-4 w-4 mr-2" /> Clear Filters
        </Button>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-destructive-500">
          <h2 className="text-h3">Failed to load freelancers</h2>
          <p className="text-body-md">
            {error?.message || "An unexpected error occurred."}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <FreelancerCardSkeleton key={i} />
          ))}
        {allFreelancers.map((freelancer: User) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </div>

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

      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FilterIcon className="h-16 w-16 mb-4" />
          <h2 className="text-h3">
            No freelancers found matching your criteria.
          </h2>
          <p className="text-body-md">
            Try adjusting your filters or search terms.
          </p>
          <Button onClick={handleClearFilters} className="mt-4">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
