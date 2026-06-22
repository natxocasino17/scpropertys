import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { STAT_ICONS } from '../../lib/statIcons'

export function Stats({ count }: { count: number }) {
  const { lang } = useLanguage()
  const { settings } = useSettings()
  const items = settings.stats ?? []

  if (!items.length) return null

  return (
    <section className="border-y border-white/10 bg-ink-800">
      <div className="container-luxe grid grid-cols-2 gap-px md:grid-cols-4">
        {items.map((s, i) => {
          const value = s.value.replace('{count}', String(count))
          const label = lang === 'es' ? s.labelEs : s.labelEn
          const Icon = STAT_ICONS[s.icon]
          const isStars = s.icon === 'stars'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="flex flex-col items-center py-10 text-center md:py-14"
            >
              {isStars ? (
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} size={22} className="fill-gold text-gold" />
                  ))}
                </div>
              ) : (
                <>
                  {Icon && <Icon size={22} className="mb-3 text-gold/90" strokeWidth={1.5} />}
                  <div className="font-display text-3xl text-gilt md:text-4xl">{value}</div>
                </>
              )}
              <div className="mt-2 text-xs uppercase tracking-wide2 text-mist">{label}</div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
