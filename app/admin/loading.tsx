import { Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="grid gap-8">
      {/* Nagłówek */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-32 max-w-full md:h-9" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-11 w-36 max-w-full rounded-xl" />
      </header>

      {/* Kafelki sekcji */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
          >
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        ))}
      </section>

      {/* Dwie kolumny: ostatnie zgłoszenia + ostatnie artykuły */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, col) => (
          <section key={col} className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
            <ul className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, row) => (
                <li key={row} className="flex items-start gap-3 px-4 py-3">
                  <Skeleton className="mt-0.5 size-4 shrink-0 rounded" />
                  <div className="grid min-w-0 flex-1 gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
