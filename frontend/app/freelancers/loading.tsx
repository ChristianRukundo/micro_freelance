import { PageSkeleton, FreelancerCardSkeleton } from '@/components/common/SkeletonLoaders';
import { Skeleton } from '@/components/ui/skeleton';

export default function FreelancersLoading() {
  return (
    <PageSkeleton className="container py-8">
      <Skeleton className="h-12 w-1/2 mb-8" /> {/* Page Title */}
      <div className="mb-8 grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <Skeleton className="h-10 md:col-span-2 lg:col-span-2" /> {/* Search Input */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Button */}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <FreelancerCardSkeleton key={i} />
        ))}
      </div>
    </PageSkeleton>
  );
}
