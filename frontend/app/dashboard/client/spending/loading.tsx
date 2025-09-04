import { PageSkeleton, Skeleton } from "@/components/common/SkeletonLoaders";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AdminUsersTableSkeleton } from "@/components/common/SkeletonLoaders"; // Reusing for table structure

export default function ClientSpendingLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/4 mb-8" /> {/* Page Title */}
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-8 w-1/3" /> {/* Section Title */}
          <Skeleton className="h-6 w-6" /> {/* Icon */}
        </CardHeader>
        <CardContent>
          <AdminUsersTableSkeleton /> {/* Reusing for generic table skeleton */}
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}
