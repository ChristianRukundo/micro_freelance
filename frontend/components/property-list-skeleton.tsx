import { PropertySkeleton } from "@/components/property-skeleton"

export function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <PropertySkeleton key={i} />
      ))}
    </div>
  )
}
