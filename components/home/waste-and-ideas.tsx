import Link from "next/link"
import { ArrowRight, Lightbulb, ThumbsUp } from "lucide-react"
import { getPublicIdeas } from "@/lib/ideas-server"

export async function WasteAndIdeas() {
  const popular = await getPublicIdeas(3)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <div className="overflow-hidden rounded-3xl border-2 border-gold/60 bg-gold/5 p-6 md:p-10">
        {/* Nagłówek + ilustracja */}
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-gold text-gold-foreground">
              <Lightbulb className="size-6" />
            </span>
            <p className="font-script text-xl leading-none text-gold md:text-2xl">Masz pomysł?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance md:text-3xl">
              Twoja idea może zmienić naszą gminę!
            </h2>
            <p className="mt-3 max-w-md text-pretty text-muted-foreground">
              Zgłoś swój pomysł i pomóż nam tworzyć Jejkowice jeszcze lepsze.
            </p>
            <Link
              href="/pomysly"
              prefetch={false}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-bold text-gold-foreground transition-transform active:scale-95"
            >
              Dodaj pomysł
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Ilustracja żarówki */}
          <div className="hidden justify-center md:flex">
            <div className="relative flex size-48 items-center justify-center">
              <div className="absolute inset-4 rounded-full bg-gold/20 blur-2xl" aria-hidden />
              <Lightbulb className="relative size-32 text-navy" strokeWidth={1.25} aria-hidden />
            </div>
          </div>
        </div>

        {/* Popularne pomysły */}
        <div className="mt-8 border-t border-accent/30 pt-6">
          <p className="mb-4 font-bold">Popularne pomysły</p>
          <ul className="space-y-3">
            {popular.map((idea) => (
              <li key={idea.id}>
                <Link
                  href="/pomysly"
                  prefetch={false}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 transition-colors hover:bg-card/70"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold leading-snug text-pretty">{idea.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{idea.category}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-eco/10 px-3 py-1.5 text-sm font-bold text-eco">
                    <ThumbsUp className="size-4" />
                    {idea.votes}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-end">
            <Link
              href="/pomysly"
              prefetch={false}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Zobacz wszystkie pomysły
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
