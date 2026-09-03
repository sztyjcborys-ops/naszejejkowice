import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminBar } from '@/components/admin/admin-bar'
import { ArticleForm } from '@/components/admin/article-form'

export const metadata: Metadata = {
  title: 'Nowy artykuł | Panel Jejkowice',
  robots: { index: false, follow: false },
}

export default function NewArticlePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-10">
      <AdminBar />

      <Link
        href="/admin"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Wróć do listy
      </Link>

      <h1 className="mb-6 mt-4 text-2xl font-bold tracking-tight md:text-3xl">Nowy artykuł</h1>
      <ArticleForm />
    </div>
  )
}
