import { useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { siteConfig } from '../config/siteConfig'
import { upsertJsonLd, siteBaseUrl } from '../lib/seo'

/**
 * Site-wide local-SEO structured data (RealEstateAgent / LocalBusiness).
 * Renders nothing; keeps a JSON-LD script in <head> in sync with settings.
 */
export function SeoBusiness() {
  const { settings } = useSettings()

  useEffect(() => {
    const base = siteBaseUrl()
    const sameAs = [settings.instagram, settings.facebook, settings.youtube, settings.tiktok].filter(
      Boolean,
    )
    const agentsSameAs = (settings.agents ?? [])
      .map((a) => a.instagram)
      .filter(Boolean)

    const data = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      name: `${settings.brand} ${settings.brandSuffix}`.trim(),
      description: settings.taglineEs,
      image: settings.heroImage || undefined,
      url: base || undefined,
      email: settings.email || undefined,
      telephone: settings.phoneDisplay || undefined,
      priceRange: '$$$',
      areaServed: [
        'Puerto Viejo de Talamanca',
        'Cocles',
        'Manzanillo',
        'Cahuita',
        'Punta Uva',
        'Playa Chiquita',
        'Caribe Sur, Costa Rica',
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Puerto Viejo de Talamanca',
        addressRegion: 'Limón',
        addressCountry: 'CR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: settings.regionLat,
        longitude: settings.regionLng,
      },
      sameAs: [...sameAs, ...agentsSameAs],
      employee: (settings.agents ?? []).map((a) => ({
        '@type': 'Person',
        name: a.name,
        image: a.photo || undefined,
        email: a.email || undefined,
        telephone: a.phoneDisplay || undefined,
        sameAs: a.instagram ? [a.instagram] : undefined,
      })),
      currenciesAccepted: siteConfig.currency.code,
    }

    upsertJsonLd('business-jsonld', data)
  }, [settings])

  return null
}
