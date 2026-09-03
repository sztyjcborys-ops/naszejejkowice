import { Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-10">
      <Skeleton className="h-10 w-full rounded-xl" />

      <div className="mt-8 grid gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="mt-6 grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
