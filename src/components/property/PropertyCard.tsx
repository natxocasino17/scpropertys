import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, BedDouble, Bath, Maximize } from 'lucide-react'
import type { Property } from '../../types/property'
import { useLanguage } from '../../i18n/LanguageContext'
import { formatPrice, formatArea, classNames } from '../../lib/format'
import { StatusBadge } from './StatusBadge'
import { typeIcon } from '../../lib/amenityIcons'

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const { t, lang } = useLanguage()
  const title = lang === 'es' ? property.title_es : property.title_en
  const TypeIcon = typeIcon[property.type]
  const cover = property.images[0]

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link to={`/propiedades/${property.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-ink-700">
          {/* Image */}
          <div className="aspect-[4/5] w-full overflow-hidden">
            {cover ? (
              <img
                src={cover}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1.2s] ease-luxe group-hover:scale-110"
              />
            ) : (
              <div className="grid h-full place-items-center text-faint">
                <TypeIcon size={40} />
              </div>
            )}
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent opacity-90" />

          {/* Top badges */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/50 px-3 py-1 text-[11px] uppercase tracking-wide text-cream/90 backdrop-blur-md">
              <TypeIcon size={13} className="text-gold" />
              {t.types[property.type]}
            </span>
            <StatusBadge status={property.status} />
          </div>

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center gap-1.5 text-xs text-gold">
              <MapPin size={13} />
              <span className="tracking-wide">{property.zone}</span>
            </div>
            <h3 className="mt-1.5 font-display text-2xl font-medium leading-tight text-cream transition-colors duration-300 group-hover:text-gold-light">
              {title}
            </h3>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl text-cream">
                {property.price > 0 ? formatPrice(property.price) : t.detail.priceOnRequest}
              </span>
            </div>

            {/* Specs — revealed on hover (desktop), always visible on mobile */}
            <div
              className={classNames(
                'mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mist',
                'md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-500 md:ease-luxe',
                'md:group-hover:max-h-20 md:group-hover:opacity-100',
              )}
            >
              {property.has_dwelling && property.bedrooms > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <BedDouble size={14} className="text-gold/80" /> {property.bedrooms}
                </span>
              )}
              {property.has_dwelling && property.bathrooms > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Bath size={14} className="text-gold/80" /> {property.bathrooms}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Maximize size={14} className="text-gold/80" /> {formatArea(property.land_size)}
              </span>
            </div>
          </div>

          {/* Hover ring */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 transition-all duration-500 group-hover:ring-gold/40" />
        </div>
      </Link>
    </motion.article>
  )
}
