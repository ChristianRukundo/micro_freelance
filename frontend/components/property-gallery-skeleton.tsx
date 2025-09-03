import { Skeleton } from "@/components/ui/skeleton"

export function PropertyGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
      <Skeleton className="md:col-span-2 md:row-span-2 aspect-[4/3] rounded-tl-lg rounded-bl-lg" />
      <Skeleton className="aspect-[4/3] rounded-tr-lg" />
      <Skeleton className="aspect-[4/3]" />
      <Skeleton className="aspect-[4/3] rounded-bl-lg" />
      <Skeleton className="aspect-[4/3] rounded-br-lg" />
    </div>
  )
}
