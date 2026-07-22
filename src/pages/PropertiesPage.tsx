import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { PropertyCard } from '../components/property/PropertyCard'
import { Spinner } from '../components/ui/Spinner'
import { useProperties } from '../hooks/useProperties'
import { useLanguage } from '../i18n/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import { useSeo } from '../lib/seo'
import { classNames } from '../lib/format'
import type { PropertyType } from '../types/property'

type SortKey = 'new' | 'priceAsc' | 'priceDesc'
type DwellingFilter = 'all' | 'with' | 'without'

export default function PropertiesPage() {
  const { t, lang } = useLanguage()
  const { settings } = useSettings()
  const { properties, loading } = useProperties()

  useSeo({
    title: `${lang === 'es' ? settings.portfolioTitleEs : settings.portfolioTitleEn} — ${settings.brand}`,
    description: lang === 'es' ? settings.portfolioSubtitleEs : settings.portfolioSubtitleEn,
  })

  const [search, setSearch] = useState('')
  const [type, setType] = useState<PropertyType | 'all'>('all')
  const [zone, setZone] = useState<string>('all')
  const [dwelling, setDwelling] = useState<DwellingFilter>('all')
  const [sort, setSort] = useState<SortKey>('new')
  const [showFilters, setShowFilters] = useState(false)

  const zones = useMemo(
    () => Array.from(new Set(properties.map((p) => p.zone))).sort(),
    [properties],
  )
  const types = useMemo(
    () => Array.from(new Set(properties.map((p) => p.type))),
    [properties],
  )

  const filtered = useMemo(() => {
    let list = properties.filter((p) => {
      const title = (lang === 'es' ? p.title_es : p.title_en).toLowerCase()
      const matchSearch =
        !search ||
        title.includes(search.toLowerCase()) ||
        p.zone.toLowerCase().includes(search.toLowerCase())
      const matchType = type === 'all' || p.type === type
      const matchZone = zone === 'all' || p.zone === zone
      const matchDwelling =
        dwelling === 'all' ||
        (dwelling === 'with' && p.has_dwelling) ||
        (dwelling === 'without' && !p.has_dwelling)
      return matchSearch && matchType && matchZone && matchDwelling
    })

    if (sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price)
    else if (sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price)
    // 'new' = keep the manual admin order (best on top) that comes from the DB.
    return list
  }, [properties, search, type, zone, dwelling, sort, lang])

  const hasActiveFilters = type !== 'all' || zone !== 'all' || dwelling !== 'all' || search !== ''

  function clearFilters() {
    setSearch('')
    setType('all')
    setZone('all')
    setDwelling('all')
    setSort('new')
  }

  return (
    <PublicLayout>
      {/* Header */}
      <section className="container-luxe pt-36 pb-10 md:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow flex items-center gap-3"
        >
          <span className="h-px w-8 bg-gold" />
          {lang === 'es' ? settings.portfolioEyebrowEs : settings.portfolioEyebrowEn}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-5xl font-medium text-cream md:text-6xl"
        >
          {lang === 'es' ? settings.portfolioTitleEs : settings.portfolioTitleEn}
        </motion.h1>
        <p className="mt-4 max-w-xl text-mist">
          {lang === 'es' ? settings.portfolioSubtitleEs : settings.portfolioSubtitleEn}
        </p>
      </section>

      {/* Filter bar */}
      <section className="sticky top-[68px] z-30 border-y border-white/10 bg-ink/85 backdrop-blur-xl">
        <div className="container-luxe flex flex-wrap items-center gap-3 py-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.filters.search}
              className="w-full rounded-full border border-white/15 bg-ink-800 py-2.5 pl-11 pr-4 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
            />
          </div>

          {/* Type pills (desktop) */}
          <div className="hidden items-center gap-2 lg:flex">
            <FilterPill active={type === 'all'} onClick={() => setType('all')}>
              {t.filters.all}
            </FilterPill>
            {types.map((ty) => (
              <FilterPill key={ty} active={type === ty} onClick={() => setType(ty)}>
                {t.types[ty]}
              </FilterPill>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-full border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
          >
            <option value="new">{t.filters.sortNew}</option>
            <option value="priceAsc">{t.filters.sortPriceAsc}</option>
            <option value="priceDesc">{t.filters.sortPriceDesc}</option>
          </select>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-cream lg:hidden"
          >
            <SlidersHorizontal size={15} /> {t.filters.type}
          </button>
        </div>

        {/* Expanded filters (mobile + zones/dwelling) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <div className="container-luxe space-y-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={type === 'all'} onClick={() => setType('all')}>
                    {t.filters.all}
                  </FilterPill>
                  {types.map((ty) => (
                    <FilterPill key={ty} active={type === ty} onClick={() => setType(ty)}>
                      {t.types[ty]}
                    </FilterPill>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary row: zone + dwelling */}
        <div className="container-luxe flex flex-wrap items-center gap-2 pb-4">
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="rounded-full border border-white/15 bg-ink-800 px-4 py-2 text-xs text-cream focus:border-gold focus:outline-none"
          >
            <option value="all">{t.filters.zone}: {t.filters.all}</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <FilterPill small active={dwelling === 'with'} onClick={() => setDwelling(dwelling === 'with' ? 'all' : 'with')}>
            {t.filters.withDwelling}
          </FilterPill>
          <FilterPill small active={dwelling === 'without'} onClick={() => setDwelling(dwelling === 'without' ? 'all' : 'without')}>
            {t.filters.withoutDwelling}
          </FilterPill>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light"
            >
              <X size={13} /> {t.filters.clear}
            </button>
          )}
          <span className="ml-auto text-xs text-faint">
            {filtered.length} {filtered.length === 1 ? t.portfolio.resultsOne : t.portfolio.resultsMany}
          </span>
        </div>
      </section>

      {/* Grid */}
      <section className="container-luxe py-12 md:py-16">
        {loading ? (
          <Spinner />
        ) : filtered.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-28 text-center">
            <p className="font-display text-2xl text-cream">{t.portfolio.empty}</p>
            <button onClick={clearFilters} className="btn-ghost mt-6">
              {t.filters.clear}
            </button>
          </div>
        )}
      </section>
    </PublicLayout>
  )
}

function FilterPill({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'rounded-full border transition-all duration-300',
        small ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm',
        active
          ? 'border-gold bg-gold text-ink'
          : 'border-white/15 bg-ink-800 text-cream/70 hover:border-gold/50 hover:text-cream',
      )}
    >
      {children}
    </button>
  )
}
