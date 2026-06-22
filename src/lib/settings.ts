import { getSupabase, TABLES, isSupabaseConfigured } from './supabase'
import { siteConfig } from '../config/siteConfig'

export interface SiteSettings {
  brand: string
  brandSuffix: string
  taglineEs: string
  taglineEn: string
  whatsapp: string
  phoneDisplay: string
  email: string
  locationEs: string
  locationEn: string
  instagram: string
  facebook: string
  youtube: string
  tiktok: string
  heroImage: string
  regionLat: number
  regionLng: number
  regionZoom: number
}

export const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=2400&q=85'

/** Defaults come from siteConfig — the DB overrides them when present. */
export const defaultSettings: SiteSettings = {
  brand: siteConfig.brand,
  brandSuffix: siteConfig.brandSuffix,
  taglineEs: siteConfig.tagline.es,
  taglineEn: siteConfig.tagline.en,
  whatsapp: siteConfig.contact.whatsapp,
  phoneDisplay: siteConfig.contact.phoneDisplay,
  email: siteConfig.contact.email,
  locationEs: siteConfig.contact.location.es,
  locationEn: siteConfig.contact.location.en,
  instagram: siteConfig.social.instagram,
  facebook: siteConfig.social.facebook,
  youtube: siteConfig.social.youtube,
  tiktok: siteConfig.social.tiktok,
  heroImage: DEFAULT_HERO,
  regionLat: siteConfig.region.center.lat,
  regionLng: siteConfig.region.center.lng,
  regionZoom: siteConfig.region.zoom,
}

// Module-level copy so non-React helpers (e.g. whatsappLink) can read it.
let active: SiteSettings = { ...defaultSettings }
export function getSettings(): SiteSettings {
  return active
}
export function setActiveSettings(s: SiteSettings) {
  active = s
}

const SETTINGS_ID = 'main'

export async function fetchSettings(): Promise<SiteSettings> {
  const supabase = getSupabase()
  if (!supabase) return { ...defaultSettings }
  const { data, error } = await supabase
    .from(TABLES.settings)
    .select('data')
    .eq('id', SETTINGS_ID)
    .maybeSingle()
  if (error || !data?.data) return { ...defaultSettings }
  // Merge so any missing/new field falls back to a sensible default.
  return { ...defaultSettings, ...(data.data as Partial<SiteSettings>) }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) throw new Error('not-configured')
  const { error } = await supabase
    .from(TABLES.settings)
    .upsert({ id: SETTINGS_ID, data: settings, updated_at: new Date().toISOString() })
  if (error) throw error
  setActiveSettings(settings)
}

export { isSupabaseConfigured }
