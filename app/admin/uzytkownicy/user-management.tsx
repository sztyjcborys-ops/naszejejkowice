'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import {
  UserPlus,
  Loader2,
  TriangleAlert,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import {
  createUserAction,
  changeRoleAction,
  deleteUserAction,
  type CreateUserState,
  type UserRow,
  type Role,
} from './actions'

const ROLE_LABELS: Record<Role, string> = {
  resident: 'Mieszkaniec',
  editor: 'Redaktor',
  admin: 'Administrator',
}

function CreateSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
      {pending ? 'Tworzenie…' : 'Dodaj użytkownika'}
    </button>
  )
}

function AddUserForm() {
  const [state, formAction] = useActionState<CreateUserState, FormData>(createUserAction, {})
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form
      ref={formRef}
      action={formAction}
      key={state.success /* reset pól po sukcesie */}
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlus className="size-4" />
        </span>
        <h2 className="text-base font-semibold">Dodaj użytkownika</h2>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="new-email" className="text-sm font-medium">
            Adres e-mail
          </label>
          <input
            id="new-email"
            name="email"
            type="email"
            required
            autoComplete="off"
            className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="redaktor@jejkowice.pl"
          />
          {state.fieldErrors?.email && (
            <span className="text-xs text-destructive">{state.fieldErrors.email}</span>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-name" className="text-sm font-medium">
            Imię i nazwisko <span className="text-muted-foreground">(opcjonalnie)</span>
          </label>
          <input
            id="new-name"
            name="full_name"
            type="text"
            autoComplete="off"
            className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="Jan Kowalski"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-password" className="text-sm font-medium">
            Hasło
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="min. 8 znaków"
          />
          {state.fieldErrors?.password && (
            <span className="text-xs text-destructive">{state.fieldErrors.password}</span>
          )}
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-role" className="text-sm font-medium">
            Rola
          </label>
          <select
            id="new-role"
            name="role"
            defaultValue="editor"
            className="rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="editor">Redaktor</option>
            <option value="admin">Administrator</option>
            <option value="resident">Mieszkaniec</option>
          </select>
        </div>
      </div>

      {state.error && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-eco/15 px-3.5 py-2.5 text-sm text-eco">
          <CheckCircle2 className="size-4 shrink-0" />
          {state.success}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <CreateSubmit />
      </div>
    </form>
  )
}

function RoleSelect({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  return (
    <form action={changeRoleAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={user.id} />
      <select
        name="role"
        defaultValue={user.role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        disabled={isSelf}
        aria-label={`Rola użytkownika ${user.email ?? ''}`}
        className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="resident">Mieszkaniec</option>
        <option value="editor">Redaktor</option>
        <option value="admin">Administrator</option>
      </select>
      <noscript>
        <button type="submit" className="rounded-lg bg-muted px-2 py-1.5 text-xs">
          Zapisz
        </button>
      </noscript>
    </form>
  )
}

export function UserManagement({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  return (
    <div className="mt-6 grid gap-6">
      <AddUserForm />

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <Users className="size-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">
            Użytkownicy{' '}
            <span className="font-normal text-muted-foreground">({users.length})</span>
          </h2>
        </div>

        <ul className="divide-y divide-border">
          {users.map((u) => {
            const isSelf = u.id === currentUserId
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {u.full_name || u.email || 'Bez nazwy'}
                    {isSelf && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                        <ShieldCheck className="size-3" /> To Ty
                      </span>
                    )}
                  </p>
                  {u.full_name && (
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                    Rola: {ROLE_LABELS[u.role]}
                  </p>
                </div>

                <RoleSelect user={u} isSelf={isSelf} />

                <form action={deleteUserAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <button
                    type="submit"
                    disabled={isSelf}
                    aria-label={`Usuń użytkownika ${u.email ?? ''}`}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
