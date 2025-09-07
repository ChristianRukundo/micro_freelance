"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/cards/TaskCard";
import { TaskCardSkeleton } from "@/components/common/SkeletonLoaders";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import api from "@/lib/api";
import { Task, TaskStatus, PaginatedResponse } from "@/lib/types";
import {
  SearchIcon,
  XCircleIcon,
  PlusCircleIcon,
  ListChecksIcon,
  MoveRightIcon,
} from "lucide-react";
import Link from "next/link";

interface TaskQueryFilters {
  q?: string;
  status?: TaskStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TasksPaginatedResponse extends PaginatedResponse<Task> {
  tasks: Task[];
}

export function ClientProjectsClient() {
  const [filters, setFilters] = React.useState<TaskQueryFilters>({
    sortBy: "createdAt",
    sortOrder: "desc",
    status: TaskStatus.OPEN,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { ref, inView } = useInView();

  React.useEffect(() => {
    setFilters((prev) => ({ ...prev, q: debouncedSearchTerm || undefined }));
  }, [debouncedSearchTerm]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<TasksPaginatedResponse, Error>({
    queryKey: ["clientProjects", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get("/tasks", {
        params: { ...filters, page: pageParam, limit: 9 },
      });
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

  const handleFilterChange = (key: keyof TaskQueryFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "ALL" ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({ sortBy: "createdAt", sortOrder: "desc" });
    setSearchTerm("");
  };

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const isEmpty = !isLoading && !isFetchingNextPage && allTasks.length === 0;

  return (
    <div className="flex flex-col space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-display-md font-extrabold">My Projects</h1>
        <p className="text-body-md mt-2 text-muted-foreground">
          View, manage, and track the progress of all your posted projects.
        </p>
      </motion.div>

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by project title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 shadow-soft dark:shadow-soft-dark"
          />
        </div>

        <Select
          value={filters.status || "OPEN"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="shadow-soft dark:shadow-soft-dark">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TaskStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </SelectItem>
            ))}
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
        <p className="text-destructive-500">Error: {error.message}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
        {allTasks.map((task: Task) => (
          <TaskCard key={task.id} task={task} showApplyButton={false} />
        ))}
        {isFetchingNextPage &&
          Array.from({ length: 3 }).map((_, i) => (
            <TaskCardSkeleton key={`loading-${i}`} />
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
        <div className="text-center py-16 rounded-lg border-2 border-dashed border-neutral-200">
          <ListChecksIcon className="h-16 w-16 mb-4 mx-auto text-muted-foreground" />
          <h2 className="text-h3 font-bold">No Projects Found</h2>
          <p className="text-body-md mt-2 text-muted-foreground">
            You haven&apos;t posted any projects that match the current filters.
          </p>
          <Link
            href="/dashboard/tasks/new"
            passHref
            className="mt-6 inline-block"
          >
            <Button
              variant="gradient"
              className="shadow-primary dark:shadow-primary-dark group"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Post Your First
              Project
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
