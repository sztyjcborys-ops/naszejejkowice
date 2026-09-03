'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireStaff } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'gallery-images'
const ACCEPTED_TYPES = ['image/webp', 'image/jpeg', 'image/png']
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB — twardy limit również po stronie serwera

export type GalleryFormState = { error?: string; fieldErrors?: Record<string, string> }

/** Best-effort usunięcie pliku z bucketa (RLS pozwala redakcji, ale używamy
 *  klienta service_role, aby sprzątanie nie zależało od kontekstu sesji). */
async function removeStorageObject(path: string | null | undefined) {
  if (!path) return
  try {
    const admin = createAdminClient()
    await admin.storage.from(BUCKET).remove([path])
  } catch (cleanupError) {
    console.error('[v0] Nie udało się usunąć zdjęcia galerii:', cleanupError)
  }
}

export async function saveGalleryImageAction(formData: FormData): Promise<GalleryFormState> {
  const { supabase, user } = await requireStaff()

  const id = String(formData.get('id') ?? '').trim()
  const alt = String(formData.get('alt') ?? '').trim()
  const sortOrderRaw = String(formData.get('sort_order') ?? '0').trim()
  const published = formData.get('published') === 'on'
  const existingSrc = String(formData.get('existing_src') ?? '').trim()
  const existingPath = String(formData.get('existing_path') ?? '').trim() || null

  const file = formData.get('image_file')
  const hasFile = file instanceof File && file.size > 0

  const fieldErrors: Record<string, string> = {}
  if (!alt) fieldErrors.alt = 'Opis alternatywny jest wymagany (dostępność).'
  if (!id && !hasFile) fieldErrors.image_file = 'Wybierz zdjęcie do wgrania.'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const sortOrder = Number.parseInt(sortOrderRaw, 10)

  // --- Wgranie nowego pliku (opcjonalne przy edycji) ---
  let src = existingSrc
  let storagePath = existingPath

  if (hasFile) {
    const f = file as File
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return { fieldErrors: { image_file: 'Dozwolone są zdjęcia JPEG, PNG lub WebP.' } }
    }
    if (f.size > MAX_BYTES) {
      return { fieldErrors: { image_file: 'Zdjęcie może mieć maksymalnie 8 MB.' } }
    }

    const ext = f.type === 'image/png' ? 'png' : f.type === 'image/jpeg' ? 'jpg' : 'webp'
    const path = `gallery/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, f, { contentType: f.type, upsert: false })
    if (uploadError) {
      return { error: 'Nie udało się wgrać zdjęcia: ' + uploadError.message }
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    // Podmieniamy stary plik dopiero po udanym wgraniu nowego.
    const previousPath = storagePath
    src = pub.publicUrl
    storagePath = path
    if (id && previousPath) await removeStorageObject(previousPath)
  }

  const payload = {
    src,
    alt,
    storage_path: storagePath,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    published,
  }

  if (id) {
    const { error } = await supabase.from('gallery').update(payload).eq('id', id)
    if (error) {
      if (hasFile) await removeStorageObject(storagePath)
      return { error: 'Nie udało się zapisać zmian: ' + error.message }
    }
  } else {
    const { error } = await supabase
      .from('gallery')
      .insert({ ...payload, author_id: user.id })
    if (error) {
      if (hasFile) await removeStorageObject(storagePath)
      return { error: 'Nie udało się dodać zdjęcia: ' + error.message }
    }
  }

  revalidatePath('/admin/galeria')
  revalidatePath('/admin')
  revalidatePath('/galeria')
  redirect('/admin/galeria')
}

export async function deleteGalleryImageAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  const { supabase } = await requireStaff()

  // Pobierz ścieżkę pliku, aby usunąć go również z Storage.
  const { data: row } = await supabase
    .from('gallery')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()

  await supabase.from('gallery').delete().eq('id', id)
  await removeStorageObject((row as { storage_path: string | null } | null)?.storage_path)

  revalidatePath('/admin/galeria')
  revalidatePath('/admin')
  revalidatePath('/galeria')
}

export async function toggleGalleryPublishAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const next = formData.get('next') === 'true'
  if (!id) return

  const { supabase } = await requireStaff()

  await supabase.from('gallery').update({ published: next }).eq('id', id)
  revalidatePath('/admin/galeria')
  revalidatePath('/galeria')
}
