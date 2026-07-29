/* ══════════════════════════════════════════════════════════════════════
   Vistas previas de enlaces (WhatsApp, Facebook, Telegram, X…)
   ----------------------------------------------------------------------
   Los rastreadores de esas apps NO ejecutan JavaScript. Como la web es una
   SPA, todas las rutas servían el mismo <head> de index.html: al compartir
   /propiedades/<slug> salía el nombre del sitio y ninguna foto.

   Esta edge function reescribe el <head> antes de que el HTML salga del
   CDN, con los datos de la propiedad leídos de Supabase. No hace falta
   volver a desplegar cuando se agrega una propiedad o se cambian sus fotos.
   ══════════════════════════════════════════════════════════════════════ */

interface EdgeContext {
  next: () => Promise<Response>
}

interface PropertyRow {
  title_es?: string
  title_en?: string
  description_es?: string
  description_en?: string
  images?: string[] | null
  zone?: string
  price?: number
}

interface SiteBits {
  brand: string
  heroImage: string
}

interface Tags {
  /** <title> del navegador y de Google */
  title: string
  /** og:title — lo que ve WhatsApp (sin la marca, el dominio ya se muestra) */
  socialTitle: string
  description: string
  image: string
  url: string
  type: string
}

/** Si Supabase tarda más que esto, servimos el HTML tal cual: la página nunca espera. */
const LOOKUP_TIMEOUT_MS = 2500
/** WhatsApp muestra ~3 líneas de descripción. */
const DESC_MAX = 200
/** Evita que el fetch interno a /index.html vuelva a entrar aquí. */
const BYPASS_HEADER = 'x-og-preview-bypass'

const FALLBACK_BRAND = 'Puerto Viejo Properties'
/** Igual que DEFAULT_HERO pero pedida más liviana: WhatsApp ignora imágenes de más de ~600 KB. */
const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=80'

/** Títulos para las páginas fijas (la web pública está en español por defecto). */
const ROUTES: Record<string, { title: string; description: string }> = {
  '/propiedades': {
    title: 'Propiedades en venta en el Caribe Sur',
    description:
      'Villas, casas y lotes en Puerto Viejo, Cocles, Punta Uva, Manzanillo y Cahuita. Filtra por zona, precio y tipo de propiedad.',
  },
  '/nosotros': {
    title: 'Nosotros',
    description:
      'Somos una inmobiliaria del Caribe Sur de Costa Rica. Conocé al equipo que te acompaña en la compra o venta de tu propiedad.',
  },
  '/contacto': {
    title: 'Contacto',
    description:
      'Escribinos por WhatsApp o dejanos un mensaje. Te ayudamos a encontrar tu propiedad en el Caribe Sur de Costa Rica.',
  },
}

/* ─────────────────────────── helpers de HTML ─────────────────────────── */

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Recorta sin cortar entidades HTML a la mitad (se escapa después). */
function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).replace(/[\s,;:.!¡¿?—–-]+$/, '') + '…'
}

function metaContent(html: string, attr: 'name' | 'property', key: string): string {
  const match = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`, 'i'))
  return match ? match[1] : ''
}

function titleContent(html: string): string {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i)
  return match ? match[1].trim() : ''
}

/** Agrega el tag antes de </head>, respetando la sangría del documento. */
function appendToHead(html: string, tag: string): string {
  return html.replace(/([ \t]*)<\/head>/i, (_all, pad: string) => `${pad}  ${tag}\n${pad}</head>`)
}

/** Reemplaza el meta si ya existe; si no, lo agrega antes de </head>. */
function setMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  if (!content) return html
  const tag = `<meta ${attr}="${key}" content="${esc(content)}" />`
  const existing = new RegExp(`<meta\\s+${attr}="${key}"\\s+[^>]*>`, 'i')
  if (existing.test(html)) return html.replace(existing, tag)
  return appendToHead(html, tag)
}

function setTitle(html: string, title: string): string {
  if (!title) return html
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
}

function setCanonical(html: string, url: string): string {
  const tag = `<link rel="canonical" href="${esc(url)}" />`
  const existing = /<link\s+rel="canonical"\s+[^>]*>/i
  if (existing.test(html)) return html.replace(existing, tag)
  return appendToHead(html, tag)
}

export function writeTags(html: string, tags: Tags): string {
  let out = setTitle(html, tags.title)
  out = setMeta(out, 'name', 'description', tags.description)
  out = setMeta(out, 'property', 'og:title', tags.socialTitle)
  out = setMeta(out, 'property', 'og:description', tags.description)
  out = setMeta(out, 'property', 'og:type', tags.type)
  out = setMeta(out, 'property', 'og:url', tags.url)
  out = setMeta(out, 'name', 'twitter:title', tags.socialTitle)
  out = setMeta(out, 'name', 'twitter:description', tags.description)
  if (tags.image) {
    out = setMeta(out, 'property', 'og:image', tags.image)
    out = setMeta(out, 'property', 'og:image:secure_url', tags.image)
    out = setMeta(out, 'property', 'og:image:alt', tags.socialTitle)
    out = setMeta(out, 'name', 'twitter:image', tags.image)
    out = setMeta(out, 'name', 'twitter:card', 'summary_large_image')
  }
  return setCanonical(out, tags.url)
}

/* ─────────────────────────── datos ─────────────────────────── */

function readEnv(key: string): string {
  const globals = globalThis as Record<string, any>
  const fromNetlify = globals.Netlify?.env?.get?.(key)
  if (fromNetlify) return String(fromNetlify)
  const fromDeno = globals.Deno?.env?.get?.(key)
  return fromDeno ? String(fromDeno) : ''
}

async function getJson(endpoint: string, key: string): Promise<any> {
  const stop = new AbortController()
  const timer = setTimeout(() => stop.abort(), LOOKUP_TIMEOUT_MS)
  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, authorization: `Bearer ${key}`, accept: 'application/json' },
      signal: stop.signal,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function restBase(): { url: string; key: string; prefix: string } | null {
  const url = readEnv('VITE_SUPABASE_URL').replace(/\/$/, '')
  const key = readEnv('VITE_SUPABASE_ANON_KEY')
  if (!url || !key) return null
  return { url, key, prefix: readEnv('VITE_DB_PREFIX') || 'sc_' }
}

async function fetchProperty(slug: string): Promise<PropertyRow | null> {
  const db = restBase()
  if (!db) return null
  const select = 'title_es,title_en,description_es,description_en,images,zone,price'
  const rows = await getJson(
    `${db.url}/rest/v1/${db.prefix}properties?slug=eq.${encodeURIComponent(slug)}&select=${select}&limit=1`,
    db.key,
  )
  return Array.isArray(rows) && rows.length ? (rows[0] as PropertyRow) : null
}

/** Marca e imagen del hero, tal como se editan en /admin/settings. */
async function fetchSiteBits(): Promise<SiteBits> {
  const fallback = { brand: '', heroImage: '' }
  const db = restBase()
  if (!db) return fallback
  const rows = await getJson(
    `${db.url}/rest/v1/${db.prefix}settings?id=eq.main&select=data&limit=1`,
    db.key,
  )
  const data = Array.isArray(rows) && rows.length ? rows[0]?.data : null
  if (!data) return fallback
  const brand = [data.brand, data.brandSuffix].filter(Boolean).join(' ')
  return { brand, heroImage: typeof data.heroImage === 'string' ? data.heroImage : '' }
}

/* ─────────────────────────── armado del <head> ─────────────────────────── */

/** Devuelve el slug si la ruta es la ficha de una propiedad. */
export function propertySlug(pathname: string): string {
  const match = pathname.match(/^\/propiedades\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : ''
}

function formatUsd(price?: number): string {
  if (!price || price <= 0) return ''
  return 'US' + new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function firstImage(images?: string[] | null): string {
  if (!Array.isArray(images)) return ''
  const found = images.find((src) => typeof src === 'string' && /^https?:\/\//.test(src))
  return found || ''
}

async function buildHtml(html: string, pageUrl: string, pathname: string): Promise<string> {
  const brandFromHtml = metaContent(html, 'property', 'og:site_name') || FALLBACK_BRAND
  const slug = propertySlug(pathname)

  if (slug) {
    const property = await fetchProperty(slug)
    if (property) {
      // Los títulos cargados a mano suelen traer espacios de sobra.
      const name = (property.title_es || property.title_en || '').replace(/\s+/g, ' ').trim()
      const zoneName = (property.zone || '').trim()
      // No repetir la zona si el título ya la nombra ("Casa en Cocles" + "Cocles").
      const zone = zoneName && !name.toLowerCase().includes(zoneName.toLowerCase()) ? zoneName : ''
      const heading = [name, zone].filter(Boolean).join(' · ')
      const price = formatUsd(property.price)
      const socialTitle = price ? `${heading} — ${price}` : heading
      let image = firstImage(property.images)
      if (!image) image = (await fetchSiteBits()).heroImage || FALLBACK_HERO
      return writeTags(html, {
        title: heading ? `${heading} — ${brandFromHtml}` : titleContent(html),
        socialTitle: socialTitle || titleContent(html),
        description: clamp(property.description_es || property.description_en || '', DESC_MAX),
        image,
        url: pageUrl,
        type: 'article',
      })
    }
  }

  // Páginas fijas: al menos que siempre lleven una foto en la vista previa.
  const site = await fetchSiteBits()
  const brand = site.brand || brandFromHtml
  const route = ROUTES[pathname.replace(/\/+$/, '')]
  const title = route ? `${route.title} — ${brand}` : titleContent(html)
  return writeTags(html, {
    title,
    socialTitle: title,
    description: route ? route.description : metaContent(html, 'name', 'description'),
    image: site.heroImage || FALLBACK_HERO,
    url: pageUrl,
    type: 'website',
  })
}

/* ─────────────────────────── handler ─────────────────────────── */

export default async function handler(request: Request, context: EdgeContext): Promise<Response> {
  const response = await context.next()

  if (request.method !== 'GET') return response
  if (request.headers.get(BYPASS_HEADER)) return response

  const url = new URL(request.url)
  // El panel no se comparte y va con noindex.
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return response

  const isHtml = (response.headers.get('content-type') || '').includes('text/html')
  // Un archivo estático real (robots.txt, sitemap.xml, favicon…) se sirve tal cual.
  const looksLikeRoute = !/\.[a-z0-9]+$/i.test(url.pathname)

  let html = ''
  if (isHtml) {
    html = await response.text()
  } else if (response.status === 404 && looksLikeRoute) {
    // Red de seguridad: si el fallback SPA no se aplicó, servimos el shell.
    const shell = await fetch(new URL('/index.html', url.origin).toString(), {
      headers: { [BYPASS_HEADER]: '1' },
    }).catch(() => null)
    if (!shell || !shell.ok) return response
    html = await shell.text()
  } else {
    return response
  }

  if (!html.includes('</head>')) return response

  const pageUrl = `${url.origin.replace(/^http:/, 'https:')}${url.pathname}`
  let out = html
  try {
    out = await buildHtml(html, pageUrl, url.pathname)
  } catch {
    out = html // una vista previa nunca debe romper la página
  }

  const headers = new Headers(response.headers)
  headers.set('content-type', 'text/html; charset=utf-8')
  // El HTML se revalida siempre, así el preview refleja la foto actual.
  headers.set('cache-control', 'public, max-age=0, must-revalidate')
  headers.delete('content-length')
  headers.delete('content-encoding')

  return new Response(out, { status: 200, headers })
}
