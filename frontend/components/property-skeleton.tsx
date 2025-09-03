import { Skeleton } from "@/components/ui/skeleton"

export function PropertySkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex flex-wrap gap-4 mt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-16 mt-2" />
      </div>
    </div>
  )
}
