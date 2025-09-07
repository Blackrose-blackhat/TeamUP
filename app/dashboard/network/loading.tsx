// app/users/loading.tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingUsers() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shadow-md rounded-2xl p-4 space-y-4 border">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-40 h-3" />
              </div>
            </div>
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-24 h-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
