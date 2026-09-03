import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye, EyeOff, Trash2, CalendarDays, MapPin } from 'lucide-react'
import { getAdminEvents, rowToEventItem } from '@/lib/events'
import { eventLongDate } from '@/lib/data'
import { deleteEventAction, toggleEventPublishAction } from './actions'

export const metadata: Metadata = {
  title: 'Wydarzenia — panel | Jejkowice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
  const events = await getAdminEvents()

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Wydarzenia</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {events.length} {events.length === 1 ? 'wydarzenie' : 'pozycji'} · kalendarz gminy
          </p>
        </div>
        <Link
          href="/admin/wydarzenia/nowy"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nowe wydarzenie</span>
          <span className="sm:hidden">Nowe</span>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <CalendarDays className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Brak wydarzeń</h2>
          <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
            Dodaj pierwsze wydarzenie, aby pojawiło się w kalendarzu gminy.
          </p>
          <Link
            href="/admin/wydarzenia/nowy"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Dodaj wydarzenie
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-sm"
            >
              <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
                <Image
                  src={e.image || '/placeholder.svg'}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                      e.published ? 'bg-eco/15 text-eco' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {e.published ? 'Widoczne' : 'Ukryte'}
                  </span>
                  {e.free && (
                    <span className="inline-flex items-center rounded-full bg-gold/25 px-2 py-0.5 text-[0.65rem] font-semibold text-gold-foreground">
                      Wstęp bezpłatny
                    </span>
                  )}
                </div>
                <h3 className="mt-0.5 truncate font-semibold">{e.title}</h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {eventLongDate(rowToEventItem(e))} · {e.event_time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {e.place}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={toggleEventPublishAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="next" value={String(!e.published)} />
                  <button
                    type="submit"
                    aria-label={e.published ? 'Ukryj' : 'Pokaż'}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {e.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </form>
                <Link
                  href={`/admin/wydarzenia/${e.id}`}
                  aria-label="Edytuj"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    aria-label="Usuń"
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
