"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import {
  Route,
  Lightbulb,
  Trees,
  Trash2,
  Building2,
  MoreHorizontal,
  MapPin,
  Send,
  ListChecks,
  Camera,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react"
import { StatusBadge } from "@/components/shared/badges"
import { cn } from "@/lib/utils"
import { compressReportImage, validateInputFile, REPORT_IMAGE_LIMITS } from "@/lib/image-compression"
import { submitReportAction } from "@/app/zglos-sprawe/actions"
import type { PublicReport } from "@/lib/public-reports"

const categories = [
  { id: "drogi", label: "Drogi i chodniki", icon: Route },
  { id: "oswietlenie", label: "Oświetlenie", icon: Lightbulb },
  { id: "zielen", label: "Zieleń i porządek", icon: Trees },
  { id: "odpady", label: "Odpady", icon: Trash2 },
  { id: "infrastruktura", label: "Infrastruktura", icon: Building2 },
  { id: "inne", label: "Inne", icon: MoreHorizontal },
]

const steps = [
  { n: 1, title: "Wybierz kategorię", desc: "np. droga, oświetlenie, śmieci, zieleń…", icon: ListChecks },
  { n: 2, title: "Dodaj lokalizację i opis", desc: "Możesz dodać zdjęcie, by lepiej pokazać problem.", icon: MapPin },
  { n: 3, title: "Wyślij zgłoszenie", desc: "Otrzymasz potwierdzenie, a my zajmiemy się sprawą.", icon: Send },
]

type Photo = { file: File; url: string }

export function ReportForm({ recentReports = [] }: { recentReports?: PublicReport[] }) {
  const [category, setCategory] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    setPhotoError(null)
    const remaining = REPORT_IMAGE_LIMITS.maxFiles - photos.length
    if (remaining <= 0) {
      setPhotoError(`Możesz dodać maksymalnie ${REPORT_IMAGE_LIMITS.maxFiles} zdjęcia.`)
      return
    }

    const selected = Array.from(fileList)
    if (selected.length > remaining) {
      setPhotoError(`Możesz dodać jeszcze ${remaining} zdj. (maks. ${REPORT_IMAGE_LIMITS.maxFiles}).`)
    }

    setProcessing(true)
    try {
      const next: Photo[] = []
      for (const raw of selected.slice(0, remaining)) {
        const invalid = validateInputFile(raw)
        if (invalid) {
          setPhotoError(invalid)
          continue
        }
        const { blob, fileName } = await compressReportImage(raw)
        const file = new File([blob], fileName, { type: "image/webp" })
        next.push({ file, url: URL.createObjectURL(file) })
      }
      if (next.length) setPhotos((prev) => [...prev, ...next])
    } catch {
      setPhotoError("Nie udało się przetworzyć zdjęcia. Spróbuj inne.")
    } finally {
      setProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const clone = [...prev]
      const [removed] = clone.splice(index, 1)
      if (removed) URL.revokeObjectURL(removed.url)
      return clone
    })
    setPhotoError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    if (!category) {
      setFormError("Wybierz kategorię zgłoszenia.")
      return
    }

    const fd = new FormData(e.currentTarget)
    fd.set("category", category)
    for (const photo of photos) fd.append("photos", photo.file, photo.file.name)

    startTransition(async () => {
      const res = await submitReportAction({}, fd)
      if (res.ok) {
        setSent(true)
        setCategory(null)
        photos.forEach((p) => URL.revokeObjectURL(p.url))
        setPhotos([])
        formRef.current?.reset()
      } else {
        setFormError(res.error ?? "Nie udało się wysłać zgłoszenia.")
      }
    })
  }

  const busy = processing || isPending
  const canAddMore = photos.length < REPORT_IMAGE_LIMITS.maxFiles

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-6">
        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-7">
          <h3 className="text-lg font-bold">Nowe zgłoszenie</h3>

          <fieldset className="mt-5">
            <legend className="mb-3 text-sm font-semibold">Wybierz kategorię</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => {
                const Icon = c.icon
                const active = category === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 text-foreground hover:border-primary/40",
                    )}
                  >
                    <Icon className="size-6" />
                    <span className="text-xs font-semibold leading-tight text-balance">{c.label}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="mt-5">
            <label htmlFor="location" className="mb-1.5 block text-sm font-semibold">
              Lokalizacja
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="location"
                name="location"
                type="text"
                placeholder="np. ul. Główna 12"
                className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">
              Opis problemu
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Opisz, co wymaga uwagi…"
              className="w-full resize-none rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAddMore || busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-3.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            {canAddMore
              ? `Dodaj zdjęcie (opcjonalnie) · ${photos.length}/${REPORT_IMAGE_LIMITS.maxFiles}`
              : `Dodano maksymalną liczbę zdjęć (${REPORT_IMAGE_LIMITS.maxFiles})`}
          </button>

          {photos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {photos.map((photo, i) => (
                <li key={photo.url} className="relative size-20 overflow-hidden rounded-xl border border-border">
                    <Image src={photo.url || "/placeholder.svg"} alt={`Załączone zdjęcie ${i + 1}`} fill sizes="80px" unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Usuń zdjęcie ${i + 1}`}
                    className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-navy/80 text-navy-foreground transition-colors hover:bg-navy"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {photoError && (
            <p role="alert" className="mt-2 text-sm font-medium text-destructive">
              {photoError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isPending ? "Wysyłanie…" : "Wyślij zgłoszenie"}
          </button>

          {formError && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {formError}
            </p>
          )}

          {sent && (
            <p
              role="status"
              className="mt-4 flex items-center gap-2 rounded-2xl bg-eco/10 px-4 py-3 text-sm font-medium text-eco"
            >
              <CheckCircle2 className="size-4 shrink-0" />
              Dziękujemy! Twoje zgłoszenie zostało przyjęte. Otrzymasz potwierdzenie na e-mail.
            </p>
          )}
        </form>
      </div>

      <div className="flex flex-col gap-4 md:gap-6">
        {/* How to */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <h3 className="text-base font-bold md:text-lg">Jak zgłosić problem?</h3>
          <ol className="mt-4 space-y-3 md:mt-5 md:space-y-4">
            {steps.map((s) => {
              const Icon = s.icon
              return (
                <li key={s.n} className="flex gap-3 md:gap-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary md:size-11 md:rounded-2xl">
                    <Icon className="size-4 md:size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold md:text-base">
                      <span className="text-primary">{s.n}. </span>
                      {s.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground text-pretty md:text-sm">{s.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Recent reports */}
        <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
          <h3 className="mb-3 text-base font-bold md:mb-4 md:text-lg">Ostatnie zgłoszenia</h3>
          <ul className="space-y-2.5 md:space-y-3">
            {recentReports.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-2xl border border-border p-2.5 md:p-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary md:size-14">
                  <MapPin className="size-5 md:size-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="truncate text-sm font-semibold leading-tight md:text-base">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.place} · {r.date}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
