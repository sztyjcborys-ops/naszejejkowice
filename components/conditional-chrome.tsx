'use client'

import { usePathname } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

/**
 * Panel redakcyjny (/admin) ma własną powłokę dashboardu, dlatego publiczny
 * nagłówek i stopka są tam ukrywane. Poza panelem działają jak dotychczas.
 */
function isAdminRoute(pathname: string | null) {
  return !!pathname && pathname.startsWith('/admin')
}

export function ConditionalHeader() {
  const pathname = usePathname()
  if (isAdminRoute(pathname)) return null
  return <SiteHeader />
}

export function ConditionalFooter() {
  const pathname = usePathname()
  if (isAdminRoute(pathname)) return null
  return <SiteFooter />
}
