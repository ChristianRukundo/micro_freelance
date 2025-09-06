// frontend/app/freelancers/page.tsx

"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import api from "@/lib/api";
import { User, PaginatedResponse } from "@/lib/types";
import { FreelancerCard } from "@/components/cards/FreelancerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FilterIcon,
  SearchIcon,
  XCircleIcon,
  MoveRightIcon,
} from "lucide-react";
import { FreelancerCardSkeleton } from "@/components/common/SkeletonLoaders";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface FreelancersPaginatedResponse extends PaginatedResponse<User> {
  freelancers: User[];
}

export default function FreelancerDiscoveryPage() {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [filters, setFilters] = React.useState({ q: "" });
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
      const response = await api.get("/freelancers", {
        params: { ...filters, page: pageParam, limit: 12 },
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) => {
      if ((lastPage as any).page < lastPage.totalPages) {
        return (lastPage as any).page + 1;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ q: searchTerm });
  };

  const allFreelancers = data?.pages.flatMap((page) => page.freelancers) || [];
  const isEmpty =
    !isLoading && !isFetchingNextPage && allFreelancers.length === 0;

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-display-md font-extrabold mb-4">
          Discover Top Talent
        </h1>
        <p className="text-body-lg text-muted-foreground">
          Browse our curated community of expert freelancers, ready to bring
          your project to life.
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-12 relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by skill, name, or keyword (e.g., 'React Developer')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 h-12 rounded-full text-body-md"
        />
      </form>

      {isError && (
        <div className="text-center text-destructive-500 py-12">
          <h2 className="text-h3">Failed to load freelancers</h2>
          <p>{error?.message || "An unexpected error occurred."}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <FreelancerCardSkeleton key={i} />
          ))}
        {allFreelancers.map((freelancer: User) => (
          <FreelancerCard key={freelancer.id} freelancer={freelancer} />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 4 }).map((_, i) => (
            <FreelancerCardSkeleton key={`loading-${i}`} />
          ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="mt-12 flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="group"
          >
            {isFetchingNextPage ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Loading...
              </>
            ) : (
              <>
                Load More{" "}
                <MoveRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-12">
          <FilterIcon className="h-16 w-16 mb-4 mx-auto text-muted-foreground" />
          <h2 className="text-h3">No Freelancers Found</h2>
          <p className="text-body-md text-muted-foreground">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </div>
  );
}
