import { getSupabase, TABLES, isSupabaseConfigured } from './supabase'
import { siteConfig } from '../config/siteConfig'
import { translations } from '../i18n/translations'

export interface StatItem {
  icon: string // key from STAT_ICONS, or 'stars' for a 5-star rating
  value: string // e.g. "3+", "100%", "★★★★★", or "{count}" for the live count
  labelEs: string
  labelEn: string
}

export interface ServiceItem {
  icon: string
  titleEs: string
  titleEn: string
  descEs: string
  descEn: string
}

export interface Agent {
  id: string // stable key, e.g. 'yael' — used to assign properties
  name: string
  photo: string
  bioEs: string
  bioEn: string
  whatsapp: string // international digits only
  phoneDisplay: string
  instagram: string
  facebook: string
  tiktok: string
  email: string
}

export interface SiteSettings {
  brand: string
  brandSuffix: string
  taglineEs: string
  taglineEn: string
  // Home hero
  heroEyebrowEs: string
  heroEyebrowEn: string
  heroTitleEs: string
  heroTitleEn: string
  heroSubtitleEs: string
  heroSubtitleEn: string
  // Home stats strip
  stats: StatItem[]
  // Featured section (home)
  featuredEyebrowEs: string
  featuredEyebrowEn: string
  featuredTitleEs: string
  featuredTitleEn: string
  featuredSubtitleEs: string
  featuredSubtitleEn: string
  featuredCtaEs: string
  featuredCtaEn: string
  // Services section (home)
  servicesEyebrowEs: string
  servicesEyebrowEn: string
  servicesTitleEs: string
  servicesTitleEn: string
  services: ServiceItem[]
  // Final CTA section (home)
  ctaEyebrowEs: string
  ctaEyebrowEn: string
  ctaTitleEs: string
  ctaTitleEn: string
  ctaSubtitleEs: string
  ctaSubtitleEn: string
  ctaButton1Es: string
  ctaButton1En: string
  ctaButton2Es: string
  ctaButton2En: string
  ctaImage: string
  // Portfolio page header
  portfolioEyebrowEs: string
  portfolioEyebrowEn: string
  portfolioTitleEs: string
  portfolioTitleEn: string
  portfolioSubtitleEs: string
  portfolioSubtitleEn: string
  // Contact page header
  contactEyebrowEs: string
  contactEyebrowEn: string
  contactTitleEs: string
  contactTitleEn: string
  contactSubtitleEs: string
  contactSubtitleEn: string
  // Footer
  footerTaglineEs: string
  footerTaglineEn: string
  // About / "Conózcanos" page
  aboutEyebrowEs: string
  aboutEyebrowEn: string
  aboutTitleEs: string
  aboutTitleEn: string
  aboutSubtitleEs: string
  aboutSubtitleEn: string
  // The two (or more) agents / sellers
  agents: Agent[]
  // Managed list of property locations / zones (single source of truth)
  zones: string[]
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

const es = translations.es
const en = translations.en

export const DEFAULT_STATS: StatItem[] = [
  { icon: 'home', value: '{count}', labelEs: es.stats.properties, labelEn: en.stats.properties },
  { icon: 'pin', value: '5', labelEs: es.stats.zones, labelEn: en.stats.zones },
  { icon: 'handshake', value: '100%', labelEs: es.stats.experience, labelEn: en.stats.experience },
  { icon: 'stars', value: '★★★★★', labelEs: es.stats.satisfaction, labelEn: en.stats.satisfaction },
]

export const DEFAULT_SERVICES: ServiceItem[] = [
  { icon: 'gem', titleEs: es.services.items.curated.title, titleEn: en.services.items.curated.title, descEs: es.services.items.curated.desc, descEn: en.services.items.curated.desc },
  { icon: 'pin', titleEs: es.services.items.local.title, titleEn: en.services.items.local.title, descEs: es.services.items.local.desc, descEn: en.services.items.local.desc },
  { icon: 'eye', titleEs: es.services.items.tour.title, titleEn: en.services.items.tour.title, descEs: es.services.items.tour.desc, descEn: en.services.items.tour.desc },
  { icon: 'handshake', titleEs: es.services.items.support.title, titleEn: en.services.items.support.title, descEs: es.services.items.support.desc, descEn: en.services.items.support.desc },
]

/** Defaults come from siteConfig / translations — the DB overrides them when present. */
export const defaultSettings: SiteSettings = {
  brand: siteConfig.brand,
  brandSuffix: siteConfig.brandSuffix,
  taglineEs: siteConfig.tagline.es,
  taglineEn: siteConfig.tagline.en,
  heroEyebrowEs: es.hero.eyebrow,
  heroEyebrowEn: en.hero.eyebrow,
  heroTitleEs: es.hero.title,
  heroTitleEn: en.hero.title,
  heroSubtitleEs: es.hero.subtitle,
  heroSubtitleEn: en.hero.subtitle,
  stats: DEFAULT_STATS,
  featuredEyebrowEs: es.featured.eyebrow,
  featuredEyebrowEn: en.featured.eyebrow,
  featuredTitleEs: es.featured.title,
  featuredTitleEn: en.featured.title,
  featuredSubtitleEs: es.featured.subtitle,
  featuredSubtitleEn: en.featured.subtitle,
  featuredCtaEs: es.featured.viewAll,
  featuredCtaEn: en.featured.viewAll,
  servicesEyebrowEs: es.services.eyebrow,
  servicesEyebrowEn: en.services.eyebrow,
  servicesTitleEs: es.services.title,
  servicesTitleEn: en.services.title,
  services: DEFAULT_SERVICES,
  ctaEyebrowEs: es.contact.eyebrow,
  ctaEyebrowEn: en.contact.eyebrow,
  ctaTitleEs: es.contact.subtitle,
  ctaTitleEn: en.contact.subtitle,
  ctaSubtitleEs: '',
  ctaSubtitleEn: '',
  ctaButton1Es: es.nav.enquire,
  ctaButton1En: en.nav.enquire,
  ctaButton2Es: es.hero.cta,
  ctaButton2En: en.hero.cta,
  ctaImage:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=80',
  portfolioEyebrowEs: es.portfolio.eyebrow,
  portfolioEyebrowEn: en.portfolio.eyebrow,
  portfolioTitleEs: es.portfolio.title,
  portfolioTitleEn: en.portfolio.title,
  portfolioSubtitleEs: es.portfolio.subtitle,
  portfolioSubtitleEn: en.portfolio.subtitle,
  contactEyebrowEs: es.contact.eyebrow,
  contactEyebrowEn: en.contact.eyebrow,
  contactTitleEs: es.contact.title,
  contactTitleEn: en.contact.title,
  contactSubtitleEs: es.contact.subtitle,
  contactSubtitleEn: en.contact.subtitle,
  footerTaglineEs: es.footer.tagline,
  footerTaglineEn: en.footer.tagline,
  aboutEyebrowEs: 'Conócenos',
  aboutEyebrowEn: 'Meet us',
  aboutTitleEs: 'Las personas detrás de cada propiedad',
  aboutTitleEn: 'The people behind every property',
  aboutSubtitleEs: 'Un equipo local que conoce el Caribe Sur como su casa.',
  aboutSubtitleEn: 'A local team that knows the South Caribbean like home.',
  agents: [
    {
      id: 'iael',
      name: 'Iael',
      photo: '',
      bioEs: 'Agente inmobiliario en el Caribe Sur. Escribe una breve descripción aquí.',
      bioEn: 'Real estate agent in the South Caribbean. Write a short bio here.',
      whatsapp: siteConfig.contact.whatsapp,
      phoneDisplay: siteConfig.contact.phoneDisplay,
      instagram: '',
      facebook: '',
      tiktok: '',
      email: '',
    },
    {
      id: 'ailana',
      name: 'Ailana',
      photo: '',
      bioEs: 'Agente inmobiliaria en el Caribe Sur. Escribe una breve descripción aquí.',
      bioEn: 'Real estate agent in the South Caribbean. Write a short bio here.',
      whatsapp: siteConfig.contact.whatsapp,
      phoneDisplay: siteConfig.contact.phoneDisplay,
      instagram: '',
      facebook: '',
      tiktok: '',
      email: '',
    },
  ],
  zones: [
    'Cahuita',
    'Cocles',
    'Hone Creek',
    'Manzanillo',
    'Playa Chiquita',
    'Playa Negra',
    'Puerto Viejo',
    'Punta Cocles',
    'Punta Uva',
  ],
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

// ── Local cache: avoids the "old image flashes before the real one" on load ──
const CACHE_KEY = 'sc_settings_cache'

export function loadCachedSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) return { ...defaultSettings, ...(JSON.parse(raw) as Partial<SiteSettings>) }
  } catch {
    /* ignore */
  }
  return { ...defaultSettings }
}

export function cacheSettings(s: SiteSettings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
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

/** Add a zone to the managed list (case-insensitive dedup) and persist it. */
export async function addZone(name: string): Promise<string[]> {
  const clean = name.trim()
  if (!clean) return getSettings().zones
  const current = await fetchSettings()
  const exists = current.zones.some((z) => z.toLowerCase() === clean.toLowerCase())
  const zones = exists
    ? current.zones
    : [...current.zones, clean].sort((a, b) => a.localeCompare(b))
  if (!exists) await saveSettings({ ...current, zones })
  return zones
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
