import Link from 'next/link'
import {
  Recycle,
  TriangleAlert,
  CalendarDays,
  ChartColumn,
  Megaphone,
  Images,
} from 'lucide-react'
import { WasteTileNote } from './waste-tile-note'
import { WeatherWidget } from './weather-widget'
import { ResidentSearch } from './resident-search'
import { getActivePollCount } from '@/lib/polls'

const tiles = [
  { href: '/wywoz-smieci', label: 'Wywóz śmieci', note: 'Sprawdź terminy', icon: Recycle, tone: 'eco' },
  { href: '/zglos-sprawe', label: 'Zgłoś sprawę', note: 'Szybko i łatwo', icon: TriangleAlert, tone: 'accent' },
  { href: '/wydarzenia', label: 'Wydarzenia', note: 'Zobacz co się dzieje', icon: CalendarDays, tone: 'primary' },
  { href: '/aktualnosci', label: 'Aktualności', note: 'Najnowsze informacje', icon: Megaphone, tone: 'primary' },
  { href: '/ankiety', label: 'Ankiety i opinie', note: '2 aktywne', icon: ChartColumn, tone: 'chart5' },
  { href: '/galeria', label: 'Galeria mieszkańców', note: 'Zobacz zdjęcia', icon: Images, tone: 'eco' },
]

/** Podpis kafelka ankiet zależny od liczby aktywnych ankiet. */
function pollsNote(count: number): string {
  if (count <= 0) return 'Zagłosuj teraz'
  if (count === 1) return '1 aktywna'
  if (count <= 4) return `${count} aktywne`
  return '4+ ankiety'
}

const toneStyles: Record<string, string> = {
  eco: 'bg-eco/12 text-eco',
  accent: 'bg-accent/25 text-accent-foreground',
  primary: 'bg-primary/12 text-primary',
  chart5: 'bg-chart-5/12 text-chart-5',
}

export async function QuickAccess() {
  const activePolls = await getActivePollCount()

  return (
    <section className="-mx-4 max-w-none px-0 py-10 md:mx-auto md:max-w-3xl md:px-6 md:py-12">
      <div className="px-4 sm:px-6">
        {/* Weather */}
        <WeatherWidget embedded />

        {/* Search */}
        <div className="mt-4">
          <ResidentSearch />
        </div>

        {/* Quick access */}
        <h3 className="mb-3 mt-6 text-sm font-bold text-foreground">Najczęściej używane</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Link
                key={tile.label}
                href={tile.href}
                className="group flex flex-col gap-3 rounded-2xl border border-border/70 bg-surface p-4 shadow-[0_1px_3px_oklch(0.23_0.03_262_/_0.07)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-md"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${toneStyles[tile.tone]}`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold leading-tight text-balance">
                  {tile.label}
                </span>
                {tile.href === '/wywoz-smieci' ? (
                  <WasteTileNote />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {tile.href === '/ankiety' ? pollsNote(activePolls) : tile.note}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
