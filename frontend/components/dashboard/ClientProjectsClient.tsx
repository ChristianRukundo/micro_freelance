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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/cards/TaskCard";
import { TaskCardSkeleton } from "@/components/common/SkeletonLoaders";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import api from "@/lib/api";
import { Task, TaskStatus, PaginatedResponse, TaskStats } from "@/lib/types";
import {
  SearchIcon,
  XCircleIcon,
  PlusCircleIcon,
  ListChecksIcon,
  MoveRightIcon,
  BriefcaseIcon,
  CheckCircle,
  ClockIcon,
  AwardIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from '@/lib/utils';


interface TaskQueryFilters {
  q?: string;
  status?: TaskStatus | "ALL";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TasksPaginatedResponse extends PaginatedResponse<Task> {
  tasks: Task[];
}

interface ClientProjectsClientProps {
  initialStats: TaskStats;
}

const StatCard = ({
  title,
  value,
  icon,
  colorClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card
      className={cn(
        "overflow-hidden relative shadow-lg dark:shadow-black/20 border-l-4",
        colorClass
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

export function ClientProjectsClient({
  initialStats,
}: ClientProjectsClientProps) {
  const [filters, setFilters] = React.useState<TaskQueryFilters>({
    sortBy: "updatedAt",
    sortOrder: "desc",
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
  } = useInfiniteQuery<TasksPaginatedResponse, Error>({
    queryKey: ["clientProjects", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get("/tasks", {
        params: {
          ...filters,
          page: pageParam,
          limit: 9,
          status: filters.status === "ALL" ? undefined : filters.status,
        },
      });
      return response.data.data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.currentPage < lastPage.totalPages
        ? lastPage.currentPage + 1
        : undefined,
    initialPageParam: 1,
  });

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const isEmpty = !isLoading && !isFetchingNextPage && allTasks.length === 0;

  const statCards = [
    {
      title: "Total Projects",
      value: initialStats.TOTAL,
      icon: <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />,
      colorClass: "border-primary-500",
    },
    {
      title: "In Progress",
      value: initialStats.IN_PROGRESS,
      icon: <ClockIcon className="h-4 w-4 text-muted-foreground" />,
      colorClass: "border-yellow-500",
    },
    {
      title: "In Review",
      value: initialStats.IN_REVIEW,
      icon: <CheckCircle className="h-4 w-4 text-muted-foreground" />,
      colorClass: "border-blue-500",
    },
    {
      title: "Completed",
      value: initialStats.COMPLETED,
      icon: <AwardIcon className="h-4 w-4 text-muted-foreground" />,
      colorClass: "border-green-500",
    },
  ];

  return (
    <div className="flex flex-col space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-display-md font-extrabold">
          My Projects Dashboard
        </h1>
        <p className="text-body-md mt-2 text-muted-foreground">
          View, manage, and track the progress of all your posted projects.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="p-4 bg-card border rounded-lg shadow-soft dark:shadow-soft-dark space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by project title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status || "ALL"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                status: value as TaskStatus | "ALL",
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(TaskStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.sortBy || "updatedAt"}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
              <SelectItem value="createdAt">Date Posted</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                <MoveRightIcon className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />{" "}
                Load More{" "}
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
