import { motion } from 'framer-motion'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { SectionHeading } from '../ui/SectionHeading'
import { STAT_ICONS } from '../../lib/statIcons'
import { Sparkles } from 'lucide-react'

export function Services() {
  const { lang } = useLanguage()
  const { settings } = useSettings()
  const eyebrow = lang === 'es' ? settings.servicesEyebrowEs : settings.servicesEyebrowEn
  const title = lang === 'es' ? settings.servicesTitleEs : settings.servicesTitleEn
  const items = settings.services ?? []

  return (
    <section className="container-luxe py-24 md:py-32">
      <SectionHeading eyebrow={eyebrow} title={title} center />

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => {
          const Icon = STAT_ICONS[item.icon] ?? Sparkles
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-8 transition-colors duration-500 hover:border-gold/40"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/5 blur-2xl transition-opacity duration-500 group-hover:bg-gold/10" />
              <div className="relative mb-6 grid h-14 w-14 place-items-center rounded-xl border border-gold/30 text-gold transition-all duration-500 group-hover:border-gold group-hover:bg-gold/10">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <h3 className="relative font-display text-2xl text-cream">
                {lang === 'es' ? item.titleEs : item.titleEn}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-mist">
                {lang === 'es' ? item.descEs : item.descEn}
              </p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
