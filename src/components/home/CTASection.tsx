import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'

export function CTASection() {
  const { lang } = useLanguage()
  const { settings } = useSettings()
  const eyebrow = lang === 'es' ? settings.ctaEyebrowEs : settings.ctaEyebrowEn
  const title = lang === 'es' ? settings.ctaTitleEs : settings.ctaTitleEn
  const subtitle = lang === 'es' ? settings.ctaSubtitleEs : settings.ctaSubtitleEn
  const btn1 = lang === 'es' ? settings.ctaButton1Es : settings.ctaButton1En
  const btn2 = lang === 'es' ? settings.ctaButton2Es : settings.ctaButton2En

  return (
    <section className="container-luxe py-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <motion.img
          src={settings.ctaImage}
          alt=""
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/40" />

        <div className="relative px-6 py-20 text-center md:px-16 md:py-28">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="eyebrow"
          >
            {eyebrow}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-5 max-w-3xl font-display text-4xl font-medium leading-tight text-cream md:text-6xl"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream/75"
            >
              {subtitle}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            {btn1 && (
              <Link to="/contacto" className="btn-gold">
                {btn1}
              </Link>
            )}
            {btn2 && (
              <Link to="/propiedades" className="btn-ghost">
                {btn2}
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
