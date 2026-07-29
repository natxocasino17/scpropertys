/* ══════════════════════════════════════════════════════════════════════
   sitemap.xml dinámico
   ----------------------------------------------------------------------
   El sitemap estático de /public solo listaba las 4 páginas fijas, así que
   Google no tenía por dónde descubrir las fichas de las propiedades.

   Esta edge function arma el sitemap en cada visita con los slugs que hay
   en Supabase. Al publicar una propiedad entra al sitemap sola, sin volver
   a desplegar. Si Supabase falla, se sirve el archivo estático de /public.
   ══════════════════════════════════════════════════════════════════════ */

interface EdgeContext {
  next: () => Promise<Response>
}

interface Row {
  slug?: string
  created_at?: string
}

const LOOKUP_TIMEOUT_MS = 2500
/** Tope defensivo: un sitemap admite 50.000 URLs, no vamos a llegar. */
const MAX_URLS = 5000

const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/propiedades', changefreq: 'daily', priority: '0.9' },
  { path: '/nosotros', changefreq: 'monthly', priority: '0.7' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
]

function readEnv(key: string): string {
  const globals = globalThis as Record<string, any>
  const fromNetlify = globals.Netlify?.env?.get?.(key)
  if (fromNetlify) return String(fromNetlify)
  const fromDeno = globals.Deno?.env?.get?.(key)
  return fromDeno ? String(fromDeno) : ''
}

function escXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** YYYY-MM-DD, o '' si la fecha no es usable. */
function isoDay(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

async function fetchSlugs(): Promise<Row[] | null> {
  const base = readEnv('VITE_SUPABASE_URL').replace(/\/$/, '')
  const key = readEnv('VITE_SUPABASE_ANON_KEY')
  if (!base || !key) return null
  const prefix = readEnv('VITE_DB_PREFIX') || 'sc_'

  const stop = new AbortController()
  const timer = setTimeout(() => stop.abort(), LOOKUP_TIMEOUT_MS)
  try {
    const res = await fetch(
      `${base}/rest/v1/${prefix}properties?select=slug,created_at&order=created_at.desc&limit=${MAX_URLS}`,
      {
        headers: { apikey: key, authorization: `Bearer ${key}`, accept: 'application/json' },
        signal: stop.signal,
      },
    )
    if (!res.ok) return null
    const rows = await res.json()
    return Array.isArray(rows) ? (rows as Row[]) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export function buildSitemap(origin: string, rows: Row[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ]

  for (const page of STATIC_PAGES) {
    lines.push(
      '  <url>',
      `    <loc>${escXml(origin + page.path)}</loc>`,
      `    <changefreq>${page.changefreq}</changefreq>`,
      `    <priority>${page.priority}</priority>`,
      '  </url>',
    )
  }

  const seen = new Set<string>()
  for (const row of rows) {
    const slug = typeof row.slug === 'string' ? row.slug.trim() : ''
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    const lastmod = isoDay(row.created_at)
    lines.push('  <url>', `    <loc>${escXml(`${origin}/propiedades/${encodeURIComponent(slug)}`)}</loc>`)
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`)
    lines.push('    <changefreq>weekly</changefreq>', '    <priority>0.8</priority>', '  </url>')
  }

  lines.push('</urlset>', '')
  return lines.join('\n')
}

export default async function handler(request: Request, context: EdgeContext): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return context.next()

  const rows = await fetchSlugs()
  // Sin datos no hay nada que agregar: mejor el archivo estático de /public.
  if (!rows || rows.length === 0) return context.next()

  const url = new URL(request.url)
  const origin = url.origin.replace(/^http:/, 'https:')

  return new Response(buildSitemap(origin, rows), {
    status: 200,
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      // Una hora en el CDN: Google no lo pide tan seguido y ahorra consultas.
      'cache-control': 'public, max-age=0, s-maxage=3600, must-revalidate',
    },
  })
}
