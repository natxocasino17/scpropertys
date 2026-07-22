import { motion } from 'framer-motion'
import { Instagram, User } from 'lucide-react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { Reveal } from '../components/ui/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import { whatsappLinkTo } from '../lib/format'
import type { Agent } from '../lib/settings'

export default function AboutPage() {
  const { t, lang } = useLanguage()
  const { settings } = useSettings()
  const agents = settings.agents ?? []

  return (
    <PublicLayout>
      <section className="container-luxe pt-36 pb-10 text-center md:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow flex items-center justify-center gap-3"
        >
          <span className="h-px w-8 bg-gold" />
          {lang === 'es' ? settings.aboutEyebrowEs : settings.aboutEyebrowEn}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-4 max-w-3xl font-display text-5xl font-medium text-cream md:text-6xl"
        >
          {lang === 'es' ? settings.aboutTitleEs : settings.aboutTitleEn}
        </motion.h1>
        <p className="mx-auto mt-4 max-w-xl text-mist">
          {lang === 'es' ? settings.aboutSubtitleEs : settings.aboutSubtitleEn}
        </p>
      </section>

      <section className="container-luxe pb-24">
        {agents.length === 2 ? (
          <div className="grid items-start gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-4">
            <AgentBlock agent={agents[0]} lang={lang} align="right" />
            {/* Center divider */}
            <div className="hidden md:flex md:flex-col md:items-center md:self-stretch">
              <div className="h-full w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
            </div>
            <AgentBlock agent={agents[1]} lang={lang} align="left" />
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentBlock key={a.id} agent={a} lang={lang} align="center" />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  )
}

function AgentBlock({
  agent,
  lang,
  align,
}: {
  agent: Agent
  lang: 'es' | 'en'
  align: 'left' | 'right' | 'center'
}) {
  const { t } = useLanguage()
  const bio = lang === 'es' ? agent.bioEs : agent.bioEn
  const alignClass =
    align === 'right' ? 'md:items-end md:text-right' : align === 'left' ? 'md:items-start md:text-left' : 'items-center text-center'

  return (
    <Reveal className={`flex flex-col items-center text-center ${alignClass}`}>
      <div className="relative">
        {agent.photo ? (
          <img
            src={agent.photo}
            alt={agent.name}
            className="h-44 w-44 rounded-full object-cover ring-1 ring-white/15 md:h-52 md:w-52"
          />
        ) : (
          <div className="grid h-44 w-44 place-items-center rounded-full border border-white/15 bg-ink-800 text-faint md:h-52 md:w-52">
            <User size={48} strokeWidth={1} />
          </div>
        )}
        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-gold" />
      </div>

      <h2 className="mt-6 font-display text-3xl text-cream md:text-4xl">{agent.name}</h2>
      {bio && <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist">{bio}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={whatsappLinkTo(agent.whatsapp, t.contact.prefillGeneric)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold !px-5 !py-2.5"
        >
          WhatsApp
        </a>
        {agent.instagram && (
          <a
            href={agent.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-cream/80 transition-all hover:border-gold hover:text-gold"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
        )}
      </div>
    </Reveal>
  )
}
