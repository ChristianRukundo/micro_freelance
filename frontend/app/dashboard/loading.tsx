import { PageSkeleton, Skeleton } from '@/components/common/SkeletonLoaders';

export default function DashboardLoading() {
  return (
    <PageSkeleton>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        {/* Sidebar/additional info */}
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    </PageSkeleton>
  );
}
