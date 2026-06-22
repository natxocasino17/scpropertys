import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Property } from '../../types/property'
import { useLanguage } from '../../i18n/LanguageContext'
import { SectionHeading } from '../ui/SectionHeading'
import { PropertyCard } from '../property/PropertyCard'
import { Reveal } from '../ui/Reveal'

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  const { t } = useLanguage()
  const featured = (properties.filter((p) => p.featured).length
    ? properties.filter((p) => p.featured)
    : properties
  ).slice(0, 3)

  if (!featured.length) return null

  return (
    <section className="container-luxe py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow={t.featured.eyebrow}
          title={t.featured.title}
          subtitle={t.featured.subtitle}
        />
        <Reveal>
          <Link
            to="/propiedades"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-gold transition-colors hover:text-gold-light"
          >
            {t.featured.viewAll}
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
