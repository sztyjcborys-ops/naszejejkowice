import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Eye, EyeOff, Trash2, FileText, Pin, PinOff } from 'lucide-react'
import { getAllArticles, formatArticleDate } from '@/lib/articles'
import { deleteArticleAction, togglePublishAction, togglePinAction } from '../actions'

export const metadata: Metadata = {
  title: 'Artykuły — panel | Jejkowice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ArticlesPage() {
  const articles = await getAllArticles()

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Artykuły</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articles.length} {articles.length === 1 ? 'artykuł' : 'pozycji'} · zarządzaj aktualnościami
          </p>
        </div>
        <Link
          href="/admin/nowy"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nowy artykuł</span>
          <span className="sm:hidden">Nowy</span>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FileText className="size-7" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Brak artykułów</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
            Nie masz jeszcze żadnych aktualności. Dodaj pierwszy artykuł, aby pojawił się na stronie.
          </p>
          <Link
            href="/admin/nowy"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Dodaj artykuł
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {articles.map((a) => (
            <li
              key={a.id}
              className="flex min-w-0 items-start gap-4 rounded-2xl border border-border bg-card p-3 transition-shadow hover:shadow-sm"
            >
              <div className="relative hidden size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
                <Image
                  src={a.cover_image || '/placeholder.svg'}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.7rem] font-bold uppercase tracking-wide text-primary">
                    {a.category}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                      a.published ? 'bg-eco/15 text-eco' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {a.published ? 'Opublikowany' : 'Szkic'}
                  </span>
                  {a.pinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                      <Pin className="size-3" />
                      Przypięty
                    </span>
                  )}
                </div>
                <h3 className="mt-0.5 break-words font-semibold text-pretty">{a.title}</h3>
                <time className="text-xs text-muted-foreground">
                  {formatArticleDate(a.created_at)}
                </time>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <form action={togglePinAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="next" value={String(!a.pinned)} />
                  <button
                    type="submit"
                    aria-label={a.pinned ? 'Odepnij artykuł' : 'Przypnij artykuł na górze'}
                    className={`flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-muted ${
                      a.pinned
                        ? 'text-primary hover:text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {a.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                  </button>
                </form>
                <form action={togglePublishAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="next" value={String(!a.published)} />
                  <button
                    type="submit"
                    aria-label={a.published ? 'Cofnij publikację' : 'Opublikuj'}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {a.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </form>
                <Link
                  href={`/admin/${a.id}`}
                  aria-label="Edytuj"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </Link>
                <form action={deleteArticleAction}>
                  <input type="hidden" name="id" value={a.id} />
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
