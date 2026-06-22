import { getSupabase, TABLES, STORAGE_BUCKET, isSupabaseConfigured } from './supabase'
import { demoProperties } from '../data/demoProperties'
import type { Property, PropertyInput, Lead } from '../types/property'

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
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Property[]
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
