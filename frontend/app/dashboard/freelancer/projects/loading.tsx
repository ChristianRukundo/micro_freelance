import {
  PageSkeleton,
  TaskCardSkeleton,
  Skeleton,
} from "@/components/common/SkeletonLoaders";

export default function ProjectsLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/3 mb-4" /> {/* Page Title */}
      <Skeleton className="h-4 w-2/3 mb-8" /> {/* Page Description */}
      {/* Stat Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      {/* Filter Bar Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Skeleton className="h-10 md:col-span-2" /> {/* Search Input */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Select */}
      </div>
      {/* Task Cards Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </PageSkeleton>
  );
}
