import { useEffect } from 'react'
import { siteConfig } from '../config/siteConfig'

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

export function upsertJsonLd(id: string, data: unknown | null) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!data) {
    if (el) el.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

export function siteBaseUrl(): string {
  const configured = (siteConfig.siteUrl || '').replace(/\/$/, '')
  if (configured) return configured
  return typeof window !== 'undefined' ? window.location.origin : ''
}

/** Mark the current (admin) page as noindex,nofollow so search engines skip it. */
export function useNoIndex() {
  useEffect(() => {
    upsertMeta('name', 'robots', 'noindex,nofollow')
    document.title = 'Admin · Puerto Viejo Properties'
  }, [])
}

interface SeoOptions {
  title: string
  description?: string
  image?: string
  type?: string
  jsonLd?: unknown
  noindex?: boolean
}

/** Per-page SEO: title, meta description, canonical, Open Graph, Twitter, JSON-LD. */
export function useSeo(opts: SeoOptions) {
  const { title, description = '', image = '', type = 'website', jsonLd = null, noindex = false } = opts
  useEffect(() => {
    const url = siteBaseUrl() + window.location.pathname
    document.title = title
    upsertMeta('name', 'description', description)
    upsertCanonical(url)

    upsertMeta('property', 'og:site_name', `${siteConfig.brand} ${siteConfig.brandSuffix}`)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    if (image) upsertMeta('property', 'og:image', image)

    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    if (image) upsertMeta('name', 'twitter:image', image)

    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')

    upsertJsonLd('seo-page-jsonld', jsonLd)
  }, [title, description, image, type, noindex, JSON.stringify(jsonLd)])
}
