import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Newspaper,
  Inbox,
  CalendarDays,
  BarChart3,
  Images,
  Plus,
  ArrowRight,
  FileText,
  MapPin,
  Lightbulb,
} from 'lucide-react'
import { formatArticleDate } from '@/lib/articles'
import { formatReportDate, statusBadgeClass, REPORT_CATEGORY_LABELS } from '@/lib/reports'
import { getAdminDashboardData } from '@/lib/admin-dashboard'

export const metadata: Metadata = {
  title: 'Pulpit — panel | Jejkowice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Tile = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count: number
  hint: string
  accent: string
}

export default async function AdminDashboard() {
  const { articles, reports, events, polls, gallery, ideas } = await getAdminDashboardData()

  const tiles: Tile[] = [
    {
      href: '/admin/artykuly',
      label: 'Artykuły',
      icon: Newspaper,
      count: articles.total,
      hint: `${articles.published} opublikowanych · ${articles.draft} szkiców`,
      accent: 'bg-primary/10 text-primary',
    },
    {
      href: '/admin/zgloszenia',
      label: 'Zgłoszenia',
      icon: Inbox,
      count: reports.total,
      hint: reports.newCount > 0 ? `${reports.newCount} nowych do obsługi` : 'Brak nowych',
      accent: 'bg-gold/25 text-gold-foreground',
    },
    {
      href: '/admin/pomysly',
      label: 'Pomysły',
      icon: Lightbulb,
      count: ideas.total,
      hint: ideas.pending > 0 ? `${ideas.pending} oczekuje na zatwierdzenie` : 'Brak oczekujących',
      accent: 'bg-gold/25 text-gold-foreground',
    },
    {
      href: '/admin/wydarzenia',
      label: 'Wydarzenia',
      icon: CalendarDays,
      count: events.total,
      hint: 'Nadchodzące wydarzenia',
      accent: 'bg-eco/15 text-eco',
    },
    {
      href: '/admin/ankiety',
      label: 'Ankiety',
      icon: BarChart3,
      count: polls.total,
      hint: `${polls.active} aktywnych`,
      accent: 'bg-primary/10 text-primary',
    },
    {
      href: '/admin/galeria',
      label: 'Galeria',
      icon: Images,
      count: gallery.total,
      hint: 'Zdjęcia mieszkańców',
      accent: 'bg-eco/15 text-eco',
    },
  ]

  const recentArticles = articles.recent
  const recentReports = reports.recent

  return (
    <div className="grid gap-8">
      {/* Nagłówek */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Pulpit</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Zarządzaj treścią serwisu Jejkowice — artykułami, zgłoszeniami i wydarzeniami.
          </p>
        </div>
        <Link
          href="/admin/nowy"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nowy artykuł
        </Link>
      </header>

      {/* Kafelki sekcji */}
      <section aria-label="Sekcje panelu" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${t.accent}`}>
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums">{t.count}</span>
                  <span className="truncate text-sm font-semibold">{t.label}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{t.hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          )
        })}
      </section>

      {/* Dwie kolumny: ostatnie zgłoszenia + ostatnie artykuły */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Zgłoszenia */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Inbox className="size-4 text-muted-foreground" />
              Ostatnie zgłoszenia
            </h2>
            <Link
              href="/admin/zgloszenia"
              className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Wszystkie
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Brak zgłoszeń od mieszkańców.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentReports.map((r) => (
                <li key={r.id}>
                  <Link
                    href="/admin/zgloszenia"
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{r.location}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${statusBadgeClass(r.status)}`}
                        >
                          {r.status}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {REPORT_CATEGORY_LABELS[r.category] ?? r.category} ·{' '}
                        {formatReportDate(r.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Artykuły */}
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Newspaper className="size-4 text-muted-foreground" />
              Ostatnie artykuły
            </h2>
            <Link
              href="/admin/artykuly"
              className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Wszystkie
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FileText className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Brak artykułów.</p>
              <Link
                href="/admin/nowy"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                <Plus className="size-4" /> Dodaj pierwszy
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/${a.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 items-start gap-2">
                        <span className="min-w-0 break-words text-sm font-medium">{a.title}</span>
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                            a.published ? 'bg-eco/15 text-eco' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {a.published ? 'Opublikowany' : 'Szkic'}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {a.category} · {formatArticleDate(a.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
