import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Ruler,
  Home as HomeIcon,
  User as UserIcon,
  Share2,
  Check,
  Play,
} from 'lucide-react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { Gallery } from '../components/property/Gallery'
import { LazyMap } from '../components/property/LazyMap'
import { isValidLat, isValidLng } from '../lib/geo'
import { StatusBadge } from '../components/property/StatusBadge'
import { PropertyCard } from '../components/property/PropertyCard'
import { Spinner } from '../components/ui/Spinner'
import { Reveal } from '../components/ui/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { useProperties } from '../hooks/useProperties'
import { fetchPropertyBySlug } from '../lib/propertiesService'
import { formatPrice, formatArea, whatsappLink, whatsappLinkTo, pickLang } from '../lib/format'
import { parseVideo } from '../lib/video'
import { useSettings } from '../context/SettingsContext'
import { useSeo } from '../lib/seo'
import { amenityIcon, typeIcon } from '../lib/amenityIcons'
import type { Property } from '../types/property'

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, lang } = useLanguage()
  const { settings } = useSettings()
  const { properties } = useProperties()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchPropertyBySlug(slug ?? '')
      .then((p) => active && setProperty(p))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  // SEO (hook must run every render — build from property when available)
  const seoName = property ? pickLang(lang, property.title_es, property.title_en) : settings.brand
  const seoDesc = property
    ? pickLang(lang, property.description_es, property.description_en).replace(/\s+/g, ' ').slice(0, 160)
    : ''
  const availabilityMap: Record<string, string> = {
    available: 'https://schema.org/InStock',
    reserved: 'https://schema.org/LimitedAvailability',
    sold: 'https://schema.org/SoldOut',
  }
  useSeo({
    title: property ? `${seoName} · ${property.zone} — ${settings.brand}` : settings.brand,
    description: seoDesc,
    image: property?.images?.[0],
    type: 'article',
    jsonLd: property
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: seoName,
          description: seoDesc,
          image: property.images,
          category: 'Real Estate',
          areaServed: property.zone,
          offers: {
            '@type': 'Offer',
            price: property.price || undefined,
            priceCurrency: 'USD',
            availability: availabilityMap[property.status] ?? 'https://schema.org/InStock',
          },
        }
      : null,
  })

  if (loading) {
    return (
      <PublicLayout>
        <div className="pt-32">
          <Spinner />
        </div>
      </PublicLayout>
    )
  }

  if (!property) {
    return (
      <PublicLayout>
        <div className="container-luxe flex min-h-[60vh] flex-col items-center justify-center pt-32 text-center">
          <h1 className="font-display text-4xl text-cream">{t.detail.notFound}</h1>
          <p className="mt-3 text-mist">{t.detail.notFoundDesc}</p>
          <Link to="/propiedades" className="btn-gold mt-8">
            {t.detail.back}
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const title = pickLang(lang, property.title_es, property.title_en)
  const description = pickLang(lang, property.description_es, property.description_en)
  const TypeIcon = typeIcon[property.type]

  const specs = [
    property.has_dwelling && property.bedrooms > 0
      ? { Icon: BedDouble, label: t.detail.bedrooms, value: String(property.bedrooms) }
      : null,
    property.has_dwelling && property.bathrooms > 0
      ? { Icon: Bath, label: t.detail.bathrooms, value: String(property.bathrooms) }
      : null,
    { Icon: Maximize, label: t.detail.land, value: formatArea(property.land_size) },
    property.construction_size > 0
      ? { Icon: Ruler, label: t.detail.construction, value: formatArea(property.construction_size) }
      : null,
    { Icon: TypeIcon, label: t.detail.type, value: t.types[property.type] },
  ].filter(Boolean) as { Icon: typeof BedDouble; label: string; value: string }[]

  const waMessage = t.contact.prefill + title
  const agent = settings.agents?.find((a) => a.id === property.agent_id) ?? null
  const waHref = agent ? whatsappLinkTo(agent.whatsapp, waMessage) : whatsappLink(waMessage)
  const similar = properties
    .filter((p) => p.id !== property.id && (p.zone === property.zone || p.type === property.type))
    .slice(0, 3)

  function share() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const video = parseVideo(property.video_url)

  return (
    <PublicLayout>
      <div className="container-luxe pt-28 md:pt-32">
        <Link
          to="/propiedades"
          className="group inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-gold"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {t.detail.back}
        </Link>

        {/* Title row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge status={property.status} />
              <span className="flex items-center gap-1.5 text-sm text-gold">
                <MapPin size={15} /> {property.zone}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight text-cream md:text-6xl">
              {title}
            </h1>
          </div>
          <div className="text-left md:text-right">
            <span className="font-display text-4xl text-gilt md:text-5xl">
              {property.price > 0 ? formatPrice(property.price) : t.detail.priceOnRequest}
            </span>
          </div>
        </motion.div>

        {/* Gallery */}
        <div className="mt-8">
          <Gallery images={property.images} title={title} />
        </div>

        {/* Video — right after the photos */}
        {video && (
          <Reveal className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-3xl text-cream">
              <Play size={22} className="text-gold" /> {t.detail.video}
            </h2>
            <div className="divider-gold mt-4 !mx-0" />
            <div className="mt-6 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
              {video.kind === 'iframe' ? (
                <iframe
                  src={video.src}
                  title={title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={video.src} controls playsInline className="h-full w-full object-cover">
                  {title}
                </video>
              )}
            </div>
          </Reveal>
        )}

        {/* Body grid */}
        <div className="mt-14 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Left column */}
          <div className="space-y-12">
            {/* Specs */}
            <Reveal>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {specs.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-ink-800 p-5 text-center"
                  >
                    <s.Icon size={22} className="mx-auto text-gold" strokeWidth={1.5} />
                    <div className="mt-3 font-display text-xl text-cream">{s.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wide text-faint">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Map — antes de la descripción: la ubicación es lo primero que
                se pregunta. Se oculta entero si la coordenada no es dibujable. */}
            {isValidLat(property.lat) && isValidLng(property.lng) && (
              <Reveal>
                <h2 className="flex items-center gap-2 font-display text-3xl text-cream">
                  <MapPin size={22} className="text-gold" /> {t.detail.location}
                </h2>
                <div className="divider-gold mt-4 !mx-0" />
                <LazyMap
                  lat={property.lat}
                  lng={property.lng}
                  label={title}
                  className="mt-6 h-80"
                />
              </Reveal>
            )}

            {/* Overview */}
            <Reveal>
              <h2 className="font-display text-3xl text-cream">{t.detail.overview}</h2>
              <div className="divider-gold mt-4 !mx-0" />
              <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-mist">
                {description}
              </p>
            </Reveal>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <Reveal>
                <h2 className="font-display text-3xl text-cream">{t.detail.amenities}</h2>
                <div className="divider-gold mt-4 !mx-0" />
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.amenities.map((a) => {
                    const Icon = amenityIcon[a]
                    return (
                      <div
                        key={a}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-800 px-4 py-3"
                      >
                        <Icon size={18} className="shrink-0 text-gold" strokeWidth={1.5} />
                        <span className="text-sm text-cream/85">{t.amenities[a]}</span>
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            )}
          </div>

          {/* Right column — sticky enquiry card */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="glass rounded-3xl p-7">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold">
                      <HomeIcon size={20} strokeWidth={1.5} />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-faint">
                        {t.common.from}
                      </div>
                      <div className="font-display text-2xl text-cream">
                        {property.price > 0 ? formatPrice(property.price) : t.detail.priceOnRequest}
                      </div>
                    </div>
                  </div>

                  <div className="my-6 h-px bg-white/10" />

                  {/* Assigned agent */}
                  {agent && (
                    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      {agent.photo ? (
                        <img
                          src={agent.photo}
                          alt={agent.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                          <UserIcon size={20} strokeWidth={1.5} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wide text-faint">
                          {t.detail.agentLabel}
                        </div>
                        <div className="font-display text-lg leading-tight text-cream">
                          {agent.name}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-sm leading-relaxed text-mist">{t.detail.enquire}</p>

                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold mt-5 w-full"
                  >
                    {agent ? `${t.detail.whatsapp} · ${agent.name}` : t.detail.whatsapp}
                  </a>
                  <Link to="/contacto" className="btn-ghost mt-3 w-full">
                    {t.contact.title}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-24">
            <h2 className="font-display text-3xl text-cream md:text-4xl">{t.detail.similar}</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Share — bottom of the page, near the footer / socials */}
        <div className="mt-20 flex flex-col items-center gap-4 border-t border-white/10 pt-10 text-center">
          <span className="eyebrow">{t.detail.share}</span>
          <button
            onClick={share}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm text-cream transition-all duration-500 ease-luxe hover:border-gold hover:text-gold"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {t.detail.share}
          </button>
        </div>
      </div>
    </PublicLayout>
  )
}
