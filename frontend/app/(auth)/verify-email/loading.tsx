import { Skeleton } from "@/components/common/SkeletonLoaders";
import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <Card className="w-full max-w-md p-6 space-y-6">
      <Skeleton className="h-10 w-3/4 mx-auto" /> {/* Title */}
      <Skeleton className="h-6 w-1/2 mx-auto" /> {/* Description */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-10 w-full" /> {/* Email */}
        <Skeleton className="h-12 w-full" /> {/* OTP */}
        <Skeleton className="h-12 w-full mt-2" /> {/* Verify Button */}
        <Skeleton className="h-12 w-full" /> {/* Resend Button */}
      </div>
    </Card>
  );
}
