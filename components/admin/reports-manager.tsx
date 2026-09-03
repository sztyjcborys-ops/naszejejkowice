'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  MapPin,
  Mail,
  Calendar,
  Trash2,
  ImageIcon,
  X,
  ChevronDown,
  Inbox,
} from 'lucide-react'
import {
  REPORT_STATUSES,
  REPORT_CATEGORY_LABELS,
  formatReportDate,
  statusBadgeClass,
  type ReportRow,
  type ReportStatus,
} from '@/lib/reports'
import { updateReportStatusAction, deleteReportAction } from '@/app/admin/zgloszenia/actions'
import { cn } from '@/lib/utils'

type Filter = 'Wszystkie' | ReportStatus

function StatusSelect({ report }: { report: ReportRow }) {
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <form ref={formRef} action={updateReportStatusAction} className="relative">
      <input type="hidden" name="id" value={report.id} />
      <select
        name="status"
        defaultValue={report.status}
        onChange={() => formRef.current?.requestSubmit()}
        aria-label="Zmień status zgłoszenia"
        className={cn(
          'w-full cursor-pointer appearance-none rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40',
        )}
      >
        {REPORT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </form>
  )
}

function ReportCard({
  report,
  images,
  onZoom,
}: {
  report: ReportRow
  images: string[]
  onZoom: (src: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const longDescription = report.description.length > 160

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-4">
        {/* Nagłówek: kategoria + status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-primary">
            {REPORT_CATEGORY_LABELS[report.category] ?? report.category}
          </span>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold',
              statusBadgeClass(report.status),
            )}
          >
            {report.status}
          </span>
        </div>

        {/* Lokalizacja */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="font-semibold leading-snug">{report.location}</p>
        </div>

        {/* Opis */}
        <p
          className={cn(
            'text-sm leading-relaxed text-muted-foreground',
            !expanded && longDescription && 'line-clamp-3',
          )}
        >
          {report.description}
        </p>
        {longDescription && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-fit text-xs font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {expanded ? 'Zwiń' : 'Czytaj więcej'}
          </button>
        )}

        {/* Zdjęcia */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => onZoom(src)}
                className="relative size-16 overflow-hidden rounded-lg border border-border transition-transform hover:scale-[1.03] sm:size-20"
                aria-label={`Powiększ zdjęcie ${i + 1}`}
              >
                <Image src={src || '/placeholder.svg'} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
        {report.image_paths.length > 0 && images.length === 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImageIcon className="size-3.5" />
            {report.image_paths.length} zdjęć — nie udało się wczytać podglądu
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatReportDate(report.created_at)}
          </span>
          {report.contact_email && (
            <a
              href={`mailto:${report.contact_email}`}
              className="flex w-fit items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="size-3.5" />
              {report.contact_email}
            </a>
          )}
        </div>
      </div>

      {/* Akcje */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/40 p-3">
        <div className="min-w-0 flex-1">
          <StatusSelect report={report} />
        </div>
        <form
          action={deleteReportAction}
          onSubmit={(e) => {
            if (!confirm('Usunąć to zgłoszenie? Tej operacji nie można cofnąć.')) e.preventDefault()
          }}
        >
          <input type="hidden" name="id" value={report.id} />
          <button
            type="submit"
            aria-label="Usuń zgłoszenie"
            className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </form>
      </div>
    </li>
  )
}

export function ReportsManager({
  reports,
  signedImages,
}: {
  reports: ReportRow[]
  signedImages: Record<string, string>
}) {
  const [filter, setFilter] = useState<Filter>('Wszystkie')
  const [zoom, setZoom] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c: Record<string, number> = { Wszystkie: reports.length }
    for (const s of REPORT_STATUSES) c[s] = 0
    for (const r of reports) c[r.status] = (c[r.status] ?? 0) + 1
    return c
  }, [reports])

  const filtered = filter === 'Wszystkie' ? reports : reports.filter((r) => r.status === filter)

  const tabs: Filter[] = ['Wszystkie', ...REPORT_STATUSES]

  return (
    <div className="grid gap-5">
      {/* Filtry */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {tabs.map((t) => {
          const active = filter === t
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
              <span
                className={cn(
                  'rounded-full px-1.5 text-xs tabular-nums',
                  active ? 'bg-primary-foreground/20' : 'bg-background',
                )}
              >
                {counts[t] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Inbox className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Brak zgłoszeń</h2>
          <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
            {filter === 'Wszystkie'
              ? 'Nie wpłynęły jeszcze żadne zgłoszenia od mieszkańców.'
              : `Brak zgłoszeń o statusie „${filter}”.`}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <ReportCard
              key={r.id}
              report={r}
              images={r.image_paths.map((p) => signedImages[p]).filter(Boolean)}
              onZoom={setZoom}
            />
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
        >
          <button
            type="button"
            aria-label="Zamknij podgląd"
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-card/90 text-foreground transition-colors hover:bg-card"
            onClick={() => setZoom(null)}
          >
            <X className="size-5" />
          </button>
          <div className="relative h-[80svh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image src={zoom || '/placeholder.svg'} alt="Zdjęcie zgłoszenia" fill className="object-contain" sizes="768px" />
          </div>
        </div>
      )}
    </div>
  )
}
