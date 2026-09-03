"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Bike,
  BookOpen,
  Check,
  ChevronDown,
  Lightbulb,
  LayoutGrid,
  Loader2,
  Lock,
  Plus,
  Route,
  ShieldCheck,
  ThumbsUp,
  Trees,
  type LucideIcon,
} from "lucide-react"
import type { PublicPoll } from "@/lib/polls"
import type { Idea } from "@/lib/ideas"
import { submitPollVoteAction } from "@/app/ankiety/actions"
import { IdeaModal } from "@/components/ideas/ideas-explorer"
import { cn } from "@/lib/utils"

const VOTER_KEY_STORAGE = "jejkowice_voter_key"
const VOTED_POLLS_STORAGE = "jejkowice_voted_polls"

const MONTHS_GENITIVE = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
]

/** Ikona przypisana do kategorii pomysłu (fallback: LayoutGrid dla „Inne”). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Rekreacja i sport": Bike,
  "Zieleń i środowisko": Trees,
  "Drogi i chodniki": Route,
  "Kultura i edukacja": BookOpen,
  Bezpieczeństwo: ShieldCheck,
  Inne: LayoutGrid,
}

function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? LayoutGrid
}

/** Polska odmiana słowa „głos”. */
function votesLabel(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (n === 1) return "głos"
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "głosy"
  return "głosów"
}

/** „Do 3 września” — czytelny termin zakończenia ankiety. */
function formatEndDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `Do ${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`
}

export function Surveys({ polls, ideas }: { polls: PublicPoll[]; ideas: Idea[] }) {
  const [mainTab, setMainTab] = useState<"ankiety" | "pomysly">("ankiety")
  const [subTab, setSubTab] = useState<"Aktywne" | "Zakończone">("Aktywne")
  const [votedPolls, setVotedPolls] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    try {
      let key = localStorage.getItem(VOTER_KEY_STORAGE)
      if (!key) {
        key = crypto.randomUUID()
        localStorage.setItem(VOTER_KEY_STORAGE, key)
      }
      const voted = JSON.parse(localStorage.getItem(VOTED_POLLS_STORAGE) || "[]")
      if (Array.isArray(voted)) setVotedPolls(voted)
    } catch {
      // localStorage niedostępny — głosowanie nadal działa, tylko bez pamięci lokalnej
    }
  }, [])

  const visible = useMemo(
    () => polls.filter((p) => (subTab === "Aktywne" ? p.status === "Aktywna" : p.status === "Zakończona")),
    [polls, subTab],
  )

  // Pierwsza ankieta z listy jest domyślnie rozwinięta — reszta zwinięta (kompaktowo).
  const defaultOpen = visible[0]?.id ?? null

  function persistVoted(pollId: string) {
    setVotedPolls((prev) => {
      const next = Array.from(new Set([...prev, pollId]))
      try {
        localStorage.setItem(VOTED_POLLS_STORAGE, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Główne zakładki: Pomysły / Ankiety */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 md:mb-6">
        {(
          [
            { key: "ankiety", label: "Ankiety" },
            { key: "pomysly", label: "Pomysły" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMainTab(t.key)}
            className={cn(
              "rounded-full py-1.5 text-[13px] font-semibold transition-colors md:py-2 md:text-sm",
              mainTab === t.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === "pomysly" ? (
        <IdeasWidget ideas={ideas} />
      ) : (
        <>
          {/* Podfiltr Aktywne / Zakończone */}
          <div className="mb-4 flex items-center gap-2">
            {(["Aktywne", "Zakończone"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSubTab(t)
                  setExpanded(null)
                }}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  subTab === t
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              {subTab === "Aktywne" ? "Nie ma teraz aktywnych ankiet." : "Brak zakończonych ankiet."}
            </p>
          ) : (
            <div className="space-y-2.5">
              {visible.map((poll) => {
                const open = (expanded ?? defaultOpen) === poll.id
                return (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    open={open}
                    onToggle={() => setExpanded(open ? "__none__" : poll.id)}
                    hasVoted={votedPolls.includes(poll.id)}
                    onVoted={() => persistVoted(poll.id)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Kompaktowa karta ankiety (rozwijana) ───────────────────────────── */
function PollCard({
  poll,
  open,
  onToggle,
  hasVoted,
  onVoted,
}: {
  poll: PublicPoll
  open: boolean
  onToggle: () => void
  hasVoted: boolean
  onVoted: () => void
}) {
  const isActive = poll.status === "Aktywna"
  const panelId = `poll-panel-${poll.id}`
  const endLabel = formatEndDate(poll.endsAt)

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-colors",
        open ? "border-primary/40 shadow-sm" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide",
                isActive ? "text-eco" : "text-muted-foreground",
              )}
            >
              <span className={cn("size-1.5 rounded-full", isActive ? "bg-eco" : "bg-muted-foreground/50")} />
              {isActive ? "Aktywna" : "Zakończona"}
            </span>
            {isActive && endLabel && (
              <span className="text-[11px] font-medium text-muted-foreground">· {endLabel}</span>
            )}
          </div>
          <h3 className="text-[15px] font-bold leading-snug text-balance">{poll.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {poll.totalVotes} {votesLabel(poll.totalVotes)}
            {hasVoted && isActive && <span className="ml-1.5 font-semibold text-eco">· zagłosowano</span>}
          </p>
        </div>
        <ChevronDown
          className={cn("mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div id={panelId} className="border-t border-border p-4">
          {poll.description && (
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{poll.description}</p>
          )}
          <PollVoting poll={poll} hasVoted={hasVoted} onVoted={onVoted} className="mt-4" />
        </div>
      )}
    </article>
  )
}

/* ── Głosowanie / wyniki (wspólne) ──────────────────────────────────── */
function PollVoting({
  poll,
  hasVoted,
  onVoted,
  className,
}: {
  poll: PublicPoll
  hasVoted: boolean
  onVoted: () => void
  className?: string
}) {
  const router = useRouter()
  const [choice, setChoice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const showResults = poll.status === "Zakończona" || hasVoted
  const leadingVotes = Math.max(0, ...poll.options.map((o) => o.votes))

  function handleVote() {
    if (!choice) {
      setError("Wybierz odpowiedź.")
      return
    }
    setError(null)
    startTransition(async () => {
      let key = ""
      try {
        key = localStorage.getItem(VOTER_KEY_STORAGE) || ""
      } catch {
        // ignore
      }
      const res = await submitPollVoteAction({ pollId: poll.id, optionId: choice, voterKey: key })
      if (res.ok) {
        onVoted()
        setChoice(null)
        router.refresh()
      } else {
        setError(res.error ?? "Nie udało się zapisać głosu.")
        if (res.error?.startsWith("Już")) onVoted()
      }
    })
  }

  if (poll.options.length === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Ta ankieta nie ma jeszcze odpowiedzi.</p>
  }

  if (showResults) {
    return (
      <div className={cn("", className)}>
        {hasVoted && poll.status === "Aktywna" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-eco/10 px-3 py-2.5 text-sm font-semibold text-eco">
            <Check className="size-4 shrink-0" />
            Dziękujemy za Twój głos!
          </div>
        )}
        <div className="space-y-3.5">
          {poll.options.map((o) => {
            const pct = poll.totalVotes > 0 ? Math.round((o.votes / poll.totalVotes) * 100) : 0
            const leading = o.votes > 0 && o.votes === leadingVotes
            return (
              <div key={o.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className={cn("text-sm leading-snug text-pretty", leading ? "font-bold" : "font-medium")}>
                    {o.label}
                  </span>
                  <span className="shrink-0 text-sm font-bold tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500",
                      leading ? "bg-primary" : "bg-primary/50",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ThumbsUp className="size-3.5" />
          {poll.totalVotes} {votesLabel(poll.totalVotes)} oddano
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-border">
        {poll.options.map((o, i) => {
          const active = choice === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setChoice(o.id)}
              aria-pressed={active}
              className={cn(
                "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                i > 0 && "border-t border-border",
                active ? "bg-primary/5" : "hover:bg-secondary/40",
              )}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  active ? "border-primary" : "border-muted-foreground/40",
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <span className={cn("text-sm leading-snug text-pretty", active ? "font-semibold" : "font-medium")}>
                {o.label}
              </span>
            </button>
          )
        })}
      </div>

      {error && <p className="mt-3 text-sm font-medium text-destructive">{error}</p>}

      <button
        type="button"
        onClick={handleVote}
        disabled={isPending}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-5 py-3 text-sm font-bold text-background transition-transform active:scale-[0.99] disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {isPending ? "Zapisywanie…" : "Zagłosuj"}
        {!isPending && <ArrowRight className="size-4" />}
      </button>

      <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" />
        Twój głos jest anonimowy.
      </p>
    </div>
  )
}

/* ── Widżet pomysłów (zakładka) ─────────────────────────────────────── */
function IdeasWidget({ ideas }: { ideas: Idea[] }) {
  // Optymistyczne, lokalne głosowanie — tak samo jak na pełnej podstronie /pomysly.
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [voted, setVoted] = useState<Set<string>>(new Set())
  const [active, setActive] = useState<Idea | null>(null)

  const voteCount = (idea: Idea) => idea.votes + (votes[idea.id] ?? 0)

  function toggleVote(id: string) {
    setVoted((prev) => {
      const next = new Set(prev)
      const has = next.has(id)
      if (has) next.delete(id)
      else next.add(id)
      setVotes((v) => ({ ...v, [id]: (v[id] ?? 0) + (has ? -1 : 1) }))
      return next
    })
  }

  const top = useMemo(
    () => [...ideas].sort((a, b) => voteCount(b) - voteCount(a)).slice(0, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ideas, votes],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold text-gold-foreground">
          <Lightbulb className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold leading-snug">Pomysły mieszkańców</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground text-pretty">
            Zagłosuj na propozycje sąsiadów — te z największym poparciem trafiają najwyżej. Masz swój pomysł? Dodaj go
            poniżej.
          </p>
        </div>
      </div>

      {/* CTA wyglądające jak pozycja do głosowania, ale tylko obrys — dodanie pomysłu.
          Umieszczone na początku, przed listą pomysłów. */}
      <Link
        href="/pomysly#dodaj"
        prefetch={false}
        className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/[0.03] p-3 transition-colors hover:border-primary/70 hover:bg-primary/[0.06]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Plus className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-primary">Dodaj swój pomysł</h3>
          <p className="truncate text-[11px] text-muted-foreground">Zgłoś propozycję i zbieraj głosy mieszkańców</p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
      </Link>

      {top.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Nie ma jeszcze zatwierdzonych pomysłów.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {top.map((idea) => {
            const hasVoted = voted.has(idea.id)
            const CategoryIcon = categoryIcon(idea.category)
            return (
              <li key={idea.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <CategoryIcon className="size-[18px]" />
                </span>
                {/* Klik w treść otwiera pełny podgląd pomysłu — jak na /pomysly */}
                <button
                  type="button"
                  onClick={() => setActive(idea)}
                  className="min-w-0 flex-1 text-left"
                  aria-label={`Zobacz cały pomysł „${idea.title}”`}
                >
                  <div className="mb-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">{idea.category}</span>
                    <span className="text-[11px] text-muted-foreground/70">· {idea.author}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-pretty">{idea.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                    {idea.description}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    Czytaj więcej
                    <ArrowRight className="size-3" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleVote(idea.id)}
                  aria-pressed={hasVoted}
                  aria-label={hasVoted ? `Cofnij głos na „${idea.title}”` : `Zagłosuj na „${idea.title}”`}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums transition-colors",
                    hasVoted
                      ? "border-eco bg-eco text-eco-foreground"
                      : "border-eco/50 bg-eco/5 text-eco hover:bg-eco/10",
                  )}
                >
                  <ThumbsUp className={cn("size-3.5", hasVoted && "fill-current")} />
                  {voteCount(idea)}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {active && (
        <IdeaModal
          idea={active}
          votes={voteCount(active)}
          hasVoted={voted.has(active.id)}
          onVote={() => toggleVote(active.id)}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}
