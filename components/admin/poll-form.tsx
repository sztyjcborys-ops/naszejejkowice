'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Loader2, TriangleAlert, Save, Plus, X, BarChart3 } from 'lucide-react'
import { savePollAction, type PollFormState } from '@/app/admin/ankiety/actions'
import type { PollWithOptions, PollResultRow } from '@/lib/polls'

function fieldClass(hasError?: boolean) {
  return `rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 ${
    hasError ? 'border-destructive' : 'border-input focus-visible:border-ring'
  }`
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? 'Zapisywanie…' : 'Zapisz ankietę'}
    </button>
  )
}

/** Data ISO -> wartość dla <input type="datetime-local"> w czasie lokalnym. */
function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function PollForm({
  poll,
  results,
}: {
  poll?: PollWithOptions
  results?: PollResultRow[]
}) {
  const [state, formAction] = useActionState<PollFormState, FormData>(savePollAction, {})
  const errors = state.fieldErrors ?? {}

  const initialOptions =
    poll && poll.options.length > 0 ? poll.options.map((o) => o.label) : ['', '']
  const [options, setOptions] = useState<string[]>(initialOptions)

  const resultByLabel = new Map((results ?? []).map((r) => [r.label, Number(r.votes) || 0]))
  const totalVotes = (results ?? []).reduce((s, r) => s + (Number(r.votes) || 0), 0)

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
  }
  function addOption() {
    setOptions((prev) => [...prev, ''])
  }
  function removeOption(index: number) {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)))
  }

  return (
    <form action={formAction} className="grid gap-6">
      {poll?.id && <input type="hidden" name="id" value={poll.id} />}

      <div className="grid gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Tytuł ankiety
        </label>
        <input
          id="title"
          name="title"
          defaultValue={poll?.title}
          className={fieldClass(!!errors.title)}
          placeholder="np. Czy potrzebna jest nowa ścieżka rowerowa?"
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Opis <span className="text-muted-foreground">(opcjonalnie)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={poll?.description}
          className={fieldClass()}
          placeholder="Krótko wyjaśnij, czego dotyczy ankieta."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={poll?.status ?? 'Aktywna'}
            className={fieldClass(!!errors.status)}
          >
            <option value="Aktywna">Aktywna</option>
            <option value="Zakończona">Zakończona</option>
          </select>
          {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="ends_at" className="text-sm font-medium">
            Data zakończenia <span className="text-muted-foreground">(opcjonalnie)</span>
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toLocalInput(poll?.ends_at ?? null)}
            className={fieldClass()}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="image" className="text-sm font-medium">
          Zdjęcie (adres URL) <span className="text-muted-foreground">(opcjonalnie)</span>
        </label>
        <input
          id="image"
          name="image"
          defaultValue={poll?.image ?? ''}
          className={fieldClass()}
          placeholder="/images/bike-path.png lub https://…"
        />
      </div>

      {/* Odpowiedzi */}
      <div className="grid gap-2">
        <span className="text-sm font-medium">Odpowiedzi</span>
        <div className="grid gap-2">
          {options.map((opt, i) => {
            const votes = poll ? resultByLabel.get(opt) : undefined
            return (
              <div key={i} className="flex items-center gap-2">
                <input
                  name="options"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className={`flex-1 ${fieldClass(!!errors.options)}`}
                  placeholder={`Odpowiedź ${i + 1}`}
                />
                {typeof votes === 'number' && (
                  <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {votes} {votes === 1 ? 'głos' : 'głosów'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  aria-label="Usuń odpowiedź"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            )
          })}
        </div>
        {errors.options && <p className="text-xs text-destructive">{errors.options}</p>}
        <button
          type="button"
          onClick={addOption}
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-4" />
          Dodaj odpowiedź
        </button>
      </div>

      {/* Podsumowanie wyników przy edycji */}
      {poll && (results?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="size-4 text-primary" />
            Wyniki głosowania · {totalVotes} {totalVotes === 1 ? 'głos' : 'głosów'}
          </p>
          <ul className="mt-3 grid gap-2">
            {results!.map((r) => {
              const pct = totalVotes > 0 ? Math.round((Number(r.votes) / totalVotes) * 100) : 0
              return (
                <li key={r.option_id} className="grid gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{r.label}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {r.votes} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: r.color ?? 'var(--primary)' }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Uwaga: zmiana treści odpowiedzi tworzy je na nowo i zeruje dotychczasowe głosy.
          </p>
        </div>
      )}

      {state.error && (
        <p className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link
          href="/admin/ankiety"
          className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Anuluj
        </Link>
      </div>
    </form>
  )
}
