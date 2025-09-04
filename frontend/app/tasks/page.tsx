'use client';

import { Metadata } from 'next';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import React from 'react';
import api from '@/lib/api';
import { Task, UserRole, Category } from '@/lib/types';
import { TaskCard } from '@/components/cards/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterIcon, SearchIcon, XCircleIcon, MoveRightIcon } from 'lucide-react';
import { TaskCardSkeleton, PageSkeleton, Skeleton } from '@/components/common/SkeletonLoaders';
import { useAuthStore } from '@/lib/zustand';
import Link from 'next/link';
import { useCategories } from '@/hooks/useTasks'; // Reusing useTasks for Categories hook
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlertIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';


// NOTE: Metadata for client components should be exported from a layout.tsx or a generateMetadata function in a server component
// This example is for illustrative purposes of data fetching
// export const metadata: Metadata = {
//   title: 'Browse Tasks - Micro Freelance Marketplace',
//   description: 'Discover available freelance projects and tasks.',
// };

interface TaskQueryFilters {
  q?: string;
  categoryId?: string;
  minBudget?: number;
  maxBudget?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TasksPaginatedResponse {
  tasks: Task[];
  totalTasks: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}


export default function TaskBrowsePage() {
  const { user } = useAuthStore();
  const { categories, isLoadingCategories, isErrorCategories, errorCategories } = useCategories();
  const [filters, setFilters] = React.useState<TaskQueryFilters>({ status: 'OPEN', sortBy: 'createdAt', sortOrder: 'desc' });
  const [searchTerm, setSearchTerm] = React.useState<string>('');

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
  } = useInfiniteQuery<TasksPaginatedResponse, Error>({
    queryKey: ['tasks', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = { ...filters, q: searchTerm || undefined, page: pageParam, limit: 10 };
      const response = await api.get('/tasks', { params });
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

  // Refetch when filters change (debounced search term is applied when search button is clicked)
  React.useEffect(() => {
    refetch();
  }, [filters, refetch]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, q: searchTerm, page: 1 })); // Apply search term to filters
  };

  const handleFilterChange = (key: keyof TaskQueryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const handleClearFilters = () => {
    setFilters({ status: 'OPEN', sortBy: 'createdAt', sortOrder: 'desc' });
    setSearchTerm('');
  };

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const isEmpty = !isLoading && !isFetchingNextPage && allTasks.length === 0;

  return (
    <div className="container py-8">
      <h1 className="text-display-md font-extrabold mb-8 text-neutral-800">Browse Projects</h1>

      <ErrorBoundary fallback={
        <Alert variant="destructive">
          <TriangleAlertIcon className="h-4 w-4" />
          <AlertTitle>Error loading tasks</AlertTitle>
          <AlertDescription>
            There was an issue loading the task list. Please try refreshing.
          </AlertDescription>
        </Alert>
      }>
        {/* Filter and Search Bar */}
        <div className="mb-8 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 lg:col-span-2 relative">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-soft"
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-neutral-500 hover:text-primary-500" aria-label="Search">
              <MoveRightIcon className="h-5 w-5" />
            </Button>
          </form>

          <Select
            value={filters.categoryId || ''}
            onValueChange={(value) => handleFilterChange('categoryId', value === '' ? undefined : value)}
          >
            <SelectTrigger className="shadow-soft">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {isLoadingCategories ? (
                <div className="p-2 text-center text-neutral-500">Loading...</div>
              ) : isErrorCategories ? (
                <div className="p-2 text-center text-destructive-500">Error loading categories</div>
              ) : (
                categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Budget"
            value={filters.minBudget || ''}
            onChange={(e) => handleFilterChange('minBudget', parseFloat(e.target.value) || undefined)}
            className="shadow-soft"
          />
          <Input
            type="number"
            placeholder="Max Budget"
            value={filters.maxBudget || ''}
            onChange={(e) => handleFilterChange('maxBudget', parseFloat(e.target.value) || undefined)}
            className="shadow-soft"
          />
          <Button type="button" variant="outline" onClick={handleClearFilters} className="shadow-soft text-neutral-600 hover:text-destructive-500">
            <XCircleIcon className="h-4 w-4 mr-2" /> Clear Filters
          </Button>
        </div>

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-destructive-500">
            <h2 className="text-h3">Failed to load tasks</h2>
            <p className="text-body-md">{error?.message || 'An unexpected error occurred.'}</p>
            <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isLoading && !isFetchingNextPage) && Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)}
          {allTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} showApplyButton={user?.role === UserRole.FREELANCER} />
          ))}
          {isFetchingNextPage && Array.from({ length: 3 }).map((_, i) => <TaskCardSkeleton key={`fetching-${i}`} />)}
        </div>

        {hasNextPage && (
          <div ref={ref} className="mt-8 flex justify-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage || isLoading}
              className="shadow-primary group"
            >
              {isFetchingNextPage ? (
                <>
                  <LoadingSpinner size="sm" color="text-primary-foreground" className="mr-2" /> Loading more...
                </>
              ) : (
                <>
                  Load More <MoveRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-500">
            <FilterIcon className="h-16 w-16 mb-4 text-neutral-300" />
            <h2 className="text-h3">No tasks found matching your criteria.</h2>
            <p className="text-body-md">Try adjusting your filters or search terms.</p>
            <Button onClick={handleClearFilters} className="mt-4">Reset Filters</Button>
            {user?.role === UserRole.CLIENT && (
              <Link href="/tasks/new" passHref className="mt-4">
                <Button variant="gradient">Post Your First Project</Button>
              </Link>
            )}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}