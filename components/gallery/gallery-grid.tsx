"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import type { GalleryImage } from "@/lib/gallery"
import { cn } from "@/lib/utils"

const tabs = ["Najnowsze", "Popularne", "Okolice"] as const

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Najnowsze")
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          <Camera className="size-4" />
          Dodaj swoje zdjęcie
        </button>
      </div>

      {images.length === 0 && (
        <p className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Galeria jest jeszcze pusta. Podziel się swoim zdjęciem Jejkowic!
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightbox(i)}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-muted",
              i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square",
            )}
          >
            <Image
              src={img.src || "/placeholder.svg"}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-navy/0 transition-colors group-hover:bg-navy/20" />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Podgląd zdjęcia"
        >
          <button
            type="button"
            aria-label="Zamknij podgląd"
            className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white/10 text-navy-foreground transition-colors hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <div
            className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightbox].src || "/placeholder.svg"}
              alt={images[lightbox].alt}
              fill
              sizes="(min-width: 768px) 48rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}
