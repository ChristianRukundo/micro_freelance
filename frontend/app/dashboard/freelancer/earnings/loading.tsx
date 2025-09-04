import { PageSkeleton, Skeleton } from "@/components/common/SkeletonLoaders";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function FreelancerEarningsLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Skeleton className="h-12 w-1/4 mb-8" /> {/* Page Title */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-32" /> {/* Total Earnings Card */}
        <Skeleton className="h-32" /> {/* Avg Monthly Earnings Card */}
      </div>
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" /> {/* Chart Title */}
          <Skeleton className="h-4 w-2/3 mt-2" /> {/* Chart Description */}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" /> {/* Chart Area */}
        </CardContent>
      </Card>
      <Card className="shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" /> {/* Detailed Payouts Title */}
          <Skeleton className="h-4 w-2/3 mt-2" />{" "}
          {/* Detailed Payouts Description */}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" /> {/* Placeholder text */}
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}
