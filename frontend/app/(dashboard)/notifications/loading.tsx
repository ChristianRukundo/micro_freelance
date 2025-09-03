import { PageSkeleton, Skeleton } from '@/components/common/SkeletonLoaders';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function NotificationsLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Card className="w-full shadow-medium border-neutral-200 p-6">
        <CardHeader className="flex items-center justify-between pb-4">
          <Skeleton className="h-10 w-1/3" /> {/* Title */}
          <Skeleton className="h-9 w-32" /> {/* Mark All Read Button */}
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" /> 
          ))}
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}