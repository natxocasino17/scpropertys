import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Property } from '../../types/property'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { SectionHeading } from '../ui/SectionHeading'
import { PropertyCard } from '../property/PropertyCard'
import { Reveal } from '../ui/Reveal'

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  const { lang } = useLanguage()
  const { settings } = useSettings()
  const featured = (properties.filter((p) => p.featured).length
    ? properties.filter((p) => p.featured)
    : properties
  ).slice(0, 3)

  if (!featured.length) return null

  const eyebrow = lang === 'es' ? settings.featuredEyebrowEs : settings.featuredEyebrowEn
  const title = lang === 'es' ? settings.featuredTitleEs : settings.featuredTitleEn
  const subtitle = lang === 'es' ? settings.featuredSubtitleEs : settings.featuredSubtitleEn
  const cta = lang === 'es' ? settings.featuredCtaEs : settings.featuredCtaEn

  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Reveal>
          <Link
            to="/propiedades"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-gold transition-colors hover:text-gold-light"
          >
            {cta}
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </section>
  )
}
