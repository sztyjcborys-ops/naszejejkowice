import Link from 'next/link'
import { ExternalLink, LogOut } from 'lucide-react'
import { signOutAction } from '@/app/admin/actions'

export function AdminBar() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      <span className="text-sm font-semibold">
        <span className="text-muted-foreground">Panel redakcyjny · </span>
        Jejkowice
      </span>
      <div className="flex items-center gap-1.5">
        <Link
          href="/aktualnosci"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          <span className="hidden sm:inline">Zobacz stronę</span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4" />
            Wyloguj
          </button>
        </form>
      </div>
    </div>
  )
}
