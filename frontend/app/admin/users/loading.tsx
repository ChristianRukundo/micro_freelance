import { PageSkeleton, AdminUsersTableSkeleton } from '@/components/common/SkeletonLoaders';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminUsersLoading() {
  return (
    <PageSkeleton className="space-y-8">
      <Skeleton className="h-12 w-1/2" /> {/* Page Title */}
      <Skeleton className="h-4 w-3/4" /> {/* Page Description */}

      {/* Filters and Search */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
        <Skeleton className="h-10 md:col-span-2 lg:col-span-2" /> {/* Search */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Select */}
        <Skeleton className="h-10" /> {/* Button */}
      </div>

      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <AdminUsersTableSkeleton />
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}
