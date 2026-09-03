import { Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="grid gap-6">
      <header className="grid gap-2">
        <Skeleton className="h-8 w-40 max-w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </header>

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="size-16 rounded-xl" />
              <Skeleton className="size-16 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
