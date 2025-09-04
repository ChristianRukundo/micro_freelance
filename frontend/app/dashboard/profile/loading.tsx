import {
  PageSkeleton,
  Skeleton,
  AvatarTextSkeleton,
} from "@/components/common/SkeletonLoaders";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function ProfileSettingsLoading() {
  return (
    <PageSkeleton className="max-w-7xl mx-auto">
      <Card className="w-full shadow-medium dark:shadow-medium-dark border-neutral-200 p-6">
        <CardHeader className="pb-4">
          <Skeleton className="h-10 w-1/3" /> {/* Title */}
          <Skeleton className="h-6 w-2/3 mt-2" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-12">
          <section className="space-y-6">
            <div className="flex flex-col items-center gap-4 mb-8">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-32" /> {/* Change Avatar Button */}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" /> {/* First Name */}
              <Skeleton className="h-10 w-full" /> {/* Last Name */}
            </div>
            <Skeleton className="h-32 w-full" /> {/* Bio */}
            <Skeleton className="h-10 w-full" /> {/* Skills Input */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-full" /> {/* Portfolio Input */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
            <Skeleton className="h-12 w-full" /> {/* Save Changes Button */}
          </section>

          <section className="space-y-6">
            <Skeleton className="h-10 w-1/3" /> {/* Change Password Title */}
            <Skeleton className="h-10 w-full" /> {/* Current Password */}
            <Skeleton className="h-10 w-full" /> {/* New Password */}
            <Skeleton className="h-10 w-full" /> {/* Confirm New Password */}
            <Skeleton className="h-12 w-full" /> {/* Change Password Button */}
          </section>
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}
