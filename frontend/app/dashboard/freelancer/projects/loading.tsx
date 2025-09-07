import {
  PageSkeleton,
  TaskCardSkeleton,
  Skeleton,
} from "@/components/common/SkeletonLoaders";

export default function ProjectsLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/3 mb-8" /> {/* Page Title */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Skeleton className="h-10 md:col-span-2" /> {/* Search Input */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Button */}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    </PageSkeleton>
  );
}
