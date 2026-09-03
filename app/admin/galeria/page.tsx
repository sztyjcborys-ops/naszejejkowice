import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye, EyeOff, Trash2, Images } from 'lucide-react'
import { getAdminGallery, formatGalleryDate } from '@/lib/gallery'
import { deleteGalleryImageAction, toggleGalleryPublishAction } from './actions'

export const metadata: Metadata = {
  title: 'Galeria — panel | Jejkowice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const images = await getAdminGallery()

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Galeria</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? 'zdjęcie' : 'pozycji'} · zdjęcia mieszkańców
          </p>
        </div>
        <Link
          href="/admin/galeria/nowe"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Dodaj zdjęcie</span>
          <span className="sm:hidden">Dodaj</span>
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Images className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Brak zdjęć</h2>
          <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
            Dodaj pierwsze zdjęcie, aby pojawiło się w galerii mieszkańców.
          </p>
          <Link
            href="/admin/galeria/nowe"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Dodaj zdjęcie
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <li
              key={img.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-sm"
            >
              <div className="relative aspect-square bg-muted">
                <Image
                  src={img.src || '/placeholder.svg'}
                  alt={img.alt || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <span
                  className={`absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                    img.published ? 'bg-eco/15 text-eco' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {img.published ? 'Widoczne' : 'Ukryte'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={img.alt}>
                    {img.alt || <span className="text-muted-foreground">Bez opisu</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{img.sort_order} · {formatGalleryDate(img.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center">
                  <form action={toggleGalleryPublishAction}>
                    <input type="hidden" name="id" value={img.id} />
                    <input type="hidden" name="next" value={String(!img.published)} />
                    <button
                      type="submit"
                      aria-label={img.published ? 'Ukryj' : 'Pokaż'}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {img.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </form>
                  <Link
                    href={`/admin/galeria/${img.id}`}
                    aria-label="Edytuj"
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <form action={deleteGalleryImageAction}>
                    <input type="hidden" name="id" value={img.id} />
                    <button
                      type="submit"
                      aria-label="Usuń"
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
