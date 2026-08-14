import {
  getSupabase,
  TABLES,
  STORAGE_BUCKET,
  STORAGE_PRIVATE_BUCKET,
  isSupabaseConfigured,
} from './supabase'
import { demoProperties } from '../data/demoProperties'
import type { Property, PropertyInput, Lead, AdminNote, ActivityLog } from '../types/property'

export interface FetchResult {
  properties: Property[]
  isDemo: boolean
}

/** Public read — used by the website. Falls back to demo data gracefully. */
export async function fetchProperties(): Promise<FetchResult> {
  const supabase = getSupabase()
  if (!supabase) return { properties: demoProperties, isDemo: true }

  const { data, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) {
    // Empty or misconfigured → show demo so the site never looks broken.
    return { properties: demoProperties, isDemo: true }
  }
  return { properties: data as Property[], isDemo: false }
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = getSupabase()
  if (!supabase) {
    return demoProperties.find((p) => p.slug === slug) ?? null
  }
  const { data, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) {
    return demoProperties.find((p) => p.slug === slug) ?? null
  }
  return data as Property
}

/* ───────────── Admin CRUD (requires Supabase) ───────────── */

export async function adminFetchProperties(): Promise<Property[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Property[]
}

/** Persist a new manual order (best on top). Writes position = index for each id. */
export async function setPropertyPositions(orderedIds: string[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(TABLES.properties).update({ position: index }).eq('id', id),
    ),
  )
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const { data, error } = await supabase
    .from(TABLES.properties)
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Property
}

export async function updateProperty(id: string, input: PropertyInput): Promise<Property> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const { data, error } = await supabase
    .from(TABLES.properties)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Property
}

export async function deleteProperty(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase.from(TABLES.properties).delete().eq('id', id)
  if (error) throw error
}

/** Insert the demo properties as real, editable rows. */
export async function importDemoProperties(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const rows = demoProperties.map(({ id, created_at, ...rest }) => rest)
  const { data, error } = await supabase
    .from(TABLES.properties)
    .upsert(rows, { onConflict: 'slug' })
    .select('id')
  if (error) throw error
  return data?.length ?? 0
}

export async function adminFetchPropertyById(id: string): Promise<Property | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as Property) ?? null
}

/* ───────────── Image upload (optional Supabase Storage) ───────────── */

export async function uploadImage(file: File): Promise<string> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/* ───────────── Activity log (change history) ───────────── */

export async function logActivity(entry: ActivityLog): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  try {
    await supabase.from(TABLES.activity).insert({
      action: entry.action,
      entity_title: entry.entity_title,
      detail: entry.detail ?? null,
      actor_email: entry.actor_email ?? null,
    })
  } catch {
    /* logging must never block the main action */
  }
}

export async function fetchActivity(limit = 200): Promise<ActivityLog[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLES.activity)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as ActivityLog[]
}

/* ───────────── Admin-only property notes (separate, private table) ───────────── */

/**
 * Notas de una propiedad.
 *
 * Devuelve `null` cuando la lectura FALLA, que no es lo mismo que "no hay
 * notas" (eso es `[]`). El formulario necesita distinguirlo: si al abrir no se
 * pudieron leer y guardara igual, sobrescribiría las notas existentes con una
 * lista vacía y se perderían sin dejar rastro.
 */
export async function fetchPropertyNotes(propertyId: string): Promise<AdminNote[] | null> {
  const supabase = getSupabase()
  if (!supabase || !propertyId) return []
  const { data, error } = await supabase
    .from(TABLES.notes)
    .select('notes')
    .eq('property_id', propertyId)
    .maybeSingle()
  if (error) return null
  return ((data?.notes as AdminNote[]) ?? [])
}

export interface NoteSummary {
  notes: number
  files: number
}

/**
 * Cuántas notas y cuántos adjuntos tiene cada propiedad, para poder marcarlas
 * en el tablón: si no se ven desde la lista, nadie sabe que existen.
 */
export async function fetchNoteSummaries(): Promise<Record<string, NoteSummary>> {
  const supabase = getSupabase()
  if (!supabase) return {}
  const { data, error } = await supabase.from(TABLES.notes).select('property_id, notes')
  if (error || !data) return {}

  const out: Record<string, NoteSummary> = {}
  for (const row of data as { property_id: string; notes: AdminNote[] | null }[]) {
    const list = row.notes ?? []
    if (!list.length) continue
    out[row.property_id] = {
      notes: list.length,
      files: list.reduce((n, note) => n + (note.files?.length ?? 0), 0),
    }
  }
  return out
}

export async function savePropertyNotes(propertyId: string, notes: AdminNote[]): Promise<void> {
  const supabase = getSupabase()
  if (!supabase || !propertyId) return
  const { error } = await supabase
    .from(TABLES.notes)
    .upsert({ property_id: propertyId, notes, updated_at: new Date().toISOString() })
  if (error) throw error
}

/* ───────────── Private admin files (plans, PDFs) ───────────── */

/** Upload a file to the PRIVATE bucket. Returns the storage path (not a URL). */
export async function uploadPrivateFile(
  file: File,
): Promise<{ path: string; name: string; type: string }> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage.from(STORAGE_PRIVATE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  return { path, name: file.name, type: file.type || 'application/octet-stream' }
}

/** Create a short-lived signed URL to view/download a private file (admin only). */
export async function signPrivateFile(path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(STORAGE_PRIVATE_BUCKET)
    .createSignedUrl(path, expiresIn)
  if (error) return null
  return data.signedUrl
}

/* ───────────── Leads ───────────── */

export async function submitLead(lead: Lead): Promise<{ ok: boolean; stored: boolean }> {
  const supabase = getSupabase()
  if (!supabase) {
    // No backend → caller should fall back to WhatsApp/email.
    return { ok: true, stored: false }
  }
  const { error } = await supabase.from(TABLES.leads).insert({
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    message: lead.message,
    property_id: lead.property_id ?? null,
    property_title: lead.property_title ?? null,
    read: false,
  })
  if (error) return { ok: false, stored: false }
  return { ok: true, stored: true }
}

export async function adminFetchLeads(): Promise<Lead[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TABLES.leads)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Lead[]
}

export async function markLeadRead(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from(TABLES.leads).update({ read: true }).eq('id', id)
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from(TABLES.leads).delete().eq('id', id)
}

export { isSupabaseConfigured }
