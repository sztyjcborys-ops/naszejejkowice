import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { ReportRow } from '@/lib/reports'

/** Wszystkie zgłoszenia (RLS ogranicza odczyt do redakcji/admina), najnowsze pierwsze. */
export async function getReports(): Promise<ReportRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log('[v0] getReports error:', error.message)
    return []
  }
  return (data as ReportRow[]) ?? []
}

/**
 * Podpisane, tymczasowe adresy URL zdjęć z prywatnego bucketa `report-images`.
 * Zwraca mapę: ścieżka → URL (pomija te, których nie udało się podpisać).
 */
export async function getSignedReportImages(
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('report-images')
    .createSignedUrls(paths, 60 * 60)

  if (error || !data) {
    console.log('[v0] getSignedReportImages error:', error?.message)
    return {}
  }

  const map: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl
  }
  return map
}
