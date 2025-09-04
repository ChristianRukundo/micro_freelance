import { PageSkeleton, Skeleton } from "@/components/common/SkeletonLoaders";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-background px-4 py-12">
      <Card className="w-full max-w-md shadow-hard dark:shadow-hard-dark border-neutral-200 p-6 space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto" /> {/* Title */}
        <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Description */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10" /> {/* First Name */}
          <Skeleton className="h-10" /> {/* Last Name */}
        </div>
        <Skeleton className="h-10 w-full" /> {/* Email */}
        <Skeleton className="h-10 w-full" /> {/* Password */}
        <Skeleton className="h-10 w-full" /> {/* Role Select */}
        <Skeleton className="h-12 w-full" /> {/* Button */}
        <Skeleton className="h-px w-full" /> {/* Separator */}
        <Skeleton className="h-4 w-2/3 mx-auto" /> {/* Link */}
      </Card>
    </div>
  );
}
