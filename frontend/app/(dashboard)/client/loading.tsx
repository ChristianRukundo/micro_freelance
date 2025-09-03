import { PageSkeleton, Skeleton } from '@/components/common/SkeletonLoaders';

export default function ClientDashboardLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/4 mb-8" /> {/* Dashboard Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-40" /> {/* Stat Card */}
        <Skeleton className="h-40" /> {/* Stat Card */}
        <Skeleton className="h-40" /> {/* Stat Card */}
      </div>
      <Skeleton className="h-8 w-1/3 mt-12 mb-6" /> {/* Quick Actions Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-20" /> {/* Action Button */}
        <Skeleton className="h-20" /> {/* Action Button */}
        <Skeleton className="h-20" /> {/* Action Button */}
      </div>
      <Skeleton className="h-8 w-1/4 mt-12 mb-6" /> {/* Recent Projects Title */}
      <Skeleton className="h-48 w-full" /> {/* Recent Projects Card */}
    </PageSkeleton>
  );
}