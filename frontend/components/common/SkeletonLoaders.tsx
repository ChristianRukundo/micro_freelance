import { cn } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SkeletonProps {
  className?: string;
}

// Generic skeleton rectangle (already existing, but good for context)
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700",
        className
      )}
    />
  );
}

// TaskCard Skeleton (already existing, but good for context)
export function TaskCardSkeleton() {
  return (
    <Card className="h-[300px] w-full rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark">
      <CardHeader className="flex flex-row items-start justify-between p-6">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-6 w-1/4 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="flex items-center justify-between p-6 pt-0">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </CardFooter>
    </Card>
  );
}

// Generic Text Block Skeleton (e.g., for description - already existing)
export function TextBlockSkeleton({
  lines = 5,
  className,
}: { lines?: number } & SkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 && "w-3/4")} />
      ))}
    </div>
  );
}

// Avatar and Text Line Skeleton (already existing)
export function AvatarTextSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Full page loading skeleton (already existing)
export function PageSkeleton({
  children,
  className,
}: { children?: React.ReactNode } & SkeletonProps) {
  return (
    <div className={cn("animate-pulse space-y-8 p-6 md:p-8", className)}>
      {children || (
        <>
          <Skeleton className="h-10 w-1/3" /> {/* Page Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <TextBlockSkeleton lines={10} className="w-full" />
        </>
      )}
    </div>
  );
}

// --- NEW SKELETONS ---

// TaskDetails page skeleton (combines multiple elements)
export function TaskDetailsSkeleton() {
  return (
    <PageSkeleton>
      {/* Task Details Overview */}
      <Card className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6 space-y-6">
        <Skeleton className="h-10 w-3/4" /> {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <TextBlockSkeleton lines={8} /> {/* Description */}
        <div className="flex items-center justify-between">
          <AvatarTextSkeleton />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </Card>

      {/* Bids Section Skeleton */}
      <Card className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" /> {/* Bids Title */}
        {Array.from({ length: 2 }).map((_, i) => (
          <Card
            key={i}
            className="h-56 w-full rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark"
          >
            <CardHeader className="flex flex-row items-start justify-between p-6 pb-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-lg" />
            </CardFooter>
          </Card>
        ))}
      </Card>

      {/* Milestones Section Skeleton */}
      <Card className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" /> {/* Milestones Title */}
        <Skeleton className="h-4 w-full" /> {/* Progress Bar */}
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-lg border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-6 w-1/4 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="flex space-x-2 justify-end">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Chat Section Skeleton */}
      <Card className="rounded-xl border border-neutral-200 bg-card shadow-medium dark:shadow-medium-dark p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" /> {/* Chat Title */}
        <Skeleton className="h-[400px] w-full" /> {/* Chat Window */}
      </Card>
    </PageSkeleton>
  );
}

// FreelancerCard Skeleton
export function FreelancerCardSkeleton() {
  return (
    <Card className="group h-[350px] w-full rounded-xl border border-neutral-200 bg-card shadow-soft dark:shadow-soft-dark">
      <CardHeader className="flex flex-col items-center p-6 pb-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="mt-4 h-6 w-3/4" />
        <Skeleton className="mt-1 h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-4">
        <div>
          <Skeleton className="h-5 w-1/4 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <TextBlockSkeleton lines={2} />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

// Admin Users Table Skeleton
export function AdminUsersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">
            <Skeleton className="h-4 w-24" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-4 w-20" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-4 w-16" />
          </TableHead>
          <TableHead className="text-center">
            <Skeleton className="h-4 w-16 mx-auto" />
          </TableHead>
          <TableHead className="text-center">
            <Skeleton className="h-4 w-12 mx-auto" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <AvatarTextSkeleton />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-6 w-20 mx-auto" />
            </TableCell>
            <TableCell className="text-center">
              <Skeleton className="h-8 w-8 mx-auto rounded-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function NewTaskPageSkeleton() {
  return (
    <PageSkeleton>
      <Card className="w-full shadow-medium dark:shadow-medium-dark border-neutral-200">
        <CardHeader className="pb-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageSkeleton>
  );
}