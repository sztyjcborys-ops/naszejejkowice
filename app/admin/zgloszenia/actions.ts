'use server'

import { revalidatePath } from 'next/cache'
import { requireStaff } from '@/lib/supabase/auth'
import { REPORT_STATUSES, type ReportStatus } from '@/lib/reports'

/** Zmiana statusu zgłoszenia (redakcja/admin). */
export async function updateReportStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim() as ReportStatus
  if (!id || !REPORT_STATUSES.includes(status)) return

  const { supabase } = await requireStaff()

  const { error } = await supabase.from('reports').update({ status }).eq('id', id)
  if (error) {
    console.log('[v0] updateReportStatusAction error:', error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/zgloszenia')
  // Publiczny widok korzysta z cache (revalidate) — odświeżamy go natychmiast.
  revalidatePath('/zglos-sprawe')
}

/** Usunięcie zgłoszenia wraz z jego zdjęciami w prywatnym buckecie. */
export async function deleteReportAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const { supabase } = await requireStaff()

  // Pobierz ścieżki zdjęć, aby posprzątać Storage po usunięciu rekordu.
  const { data: report } = await supabase
    .from('reports')
    .select('image_paths')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('reports').delete().eq('id', id)
  if (error) {
    console.log('[v0] deleteReportAction error:', error.message)
    return
  }

  const paths = (report?.image_paths as string[] | undefined) ?? []
  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage.from('report-images').remove(paths)
    if (storageError) {
      console.log('[v0] deleteReportAction storage error:', storageError.message)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/zgloszenia')
  // Publiczny widok korzysta z cache (revalidate) — odświeżamy go natychmiast.
  revalidatePath('/zglos-sprawe')
}
