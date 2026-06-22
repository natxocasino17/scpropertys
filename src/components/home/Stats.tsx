import { motion } from 'framer-motion'
import { useLanguage } from '../../i18n/LanguageContext'

export function Stats({ count }: { count: number }) {
  const { t } = useLanguage()
  const items = [
    { value: `${count}+`, label: t.stats.properties },
    { value: '5', label: t.stats.zones },
    { value: '100%', label: t.stats.experience },
    { value: '★★★★★', label: t.stats.satisfaction },
  ]
  return (
    <section className="border-y border-white/10 bg-ink-800">
      <div className="container-luxe grid grid-cols-2 gap-px md:grid-cols-4">
        {items.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="py-10 text-center md:py-14"
          >
            <div className="font-display text-3xl text-gilt md:text-4xl">{s.value}</div>
            <div className="mt-2 text-xs uppercase tracking-wide2 text-mist">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
