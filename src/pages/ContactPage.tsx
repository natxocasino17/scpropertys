import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, Check, Instagram, Facebook } from 'lucide-react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { LazyMap } from '../components/property/LazyMap'
import { Reveal } from '../components/ui/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { useSettings } from '../context/SettingsContext'
import { useSeo } from '../lib/seo'
import { submitLead } from '../lib/propertiesService'
import { whatsappLink, whatsappLinkTo } from '../lib/format'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const { t, lang } = useLanguage()
  const { settings } = useSettings()

  useSeo({
    title: `${lang === 'es' ? settings.contactTitleEs : settings.contactTitleEn} — ${settings.brand}`,
    description: lang === 'es' ? settings.contactSubtitleEs : settings.contactSubtitleEn,
  })
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const res = await submitLead(form)
    if (res.ok) {
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
      // If there is no backend, also open the user's email client as a fallback.
      if (!res.stored) {
        const body = encodeURIComponent(
          `${form.message}\n\n${form.name} · ${form.email} · ${form.phone}`,
        )
        window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(
          'Web — ' + form.name,
        )}&body=${body}`
      }
    } else {
      setStatus('error')
    }
  }

  const field =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-3 text-sm text-cream placeholder:text-faint transition-colors focus:border-gold focus:outline-none'

  return (
    <PublicLayout>
      <section className="container-luxe pt-36 pb-16 md:pt-44">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow flex items-center gap-3"
        >
          <span className="h-px w-8 bg-gold" />
          {lang === 'es' ? settings.contactEyebrowEs : settings.contactEyebrowEn}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 font-display text-5xl font-medium text-cream md:text-6xl"
        >
          {lang === 'es' ? settings.contactTitleEs : settings.contactTitleEn}
        </motion.h1>
        <p className="mt-4 max-w-xl text-mist">
          {lang === 'es' ? settings.contactSubtitleEs : settings.contactSubtitleEn}
        </p>
      </section>

      <section className="container-luxe grid gap-12 pb-24 lg:grid-cols-[1.1fr_1fr]">
        {/* Form */}
        <Reveal>
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-7 md:p-9">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-faint">
                  {t.contact.name}
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={field}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-faint">
                  {t.contact.email}
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={field}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-faint">
                  {t.contact.phone}
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={field}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-faint">
                  {t.contact.message}
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t.contact.messagePlaceholder}
                  className={`${field} resize-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="btn-gold mt-6 w-full disabled:opacity-60"
            >
              {status === 'sending' ? (
                t.contact.sending
              ) : status === 'success' ? (
                <>
                  <Check size={16} /> {t.contact.success}
                </>
              ) : (
                <>
                  <Send size={16} /> {t.contact.send}
                </>
              )}
            </button>

            {status === 'success' && (
              <p className="mt-4 text-center text-sm text-emerald-300">{t.contact.success}</p>
            )}
            {status === 'error' && (
              <p className="mt-4 text-center text-sm text-rose-300">{t.contact.error}</p>
            )}

            <div className="mt-6 text-center text-sm text-mist">
              {t.contact.orWhatsapp}
              <a
                href={whatsappLink(t.contact.prefillGeneric)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-gold hover:text-gold-light"
              >
                WhatsApp →
              </a>
            </div>
          </form>
        </Reveal>

        {/* Contact info + map */}
        <Reveal delay={0.1}>
          <div className="space-y-5">
            <InfoRow
              Icon={MapPin}
              label={t.contact.office}
              value={lang === 'es' ? settings.locationEs : settings.locationEn}
            />

            {/* Both agents */}
            {(settings.agents ?? []).map((a) => (
              <a
                key={a.id}
                href={whatsappLinkTo(a.whatsapp, t.contact.prefillGeneric)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-800 p-4 transition-colors hover:border-gold/40"
              >
                {a.photo ? (
                  <img src={a.photo} alt={a.name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-lg text-gold">
                    {a.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-faint">{t.detail.agentLabel}</div>
                  <div className="font-display text-lg leading-tight text-cream">{a.name}</div>
                  <div className="text-xs text-gold">{a.phoneDisplay || 'WhatsApp'}</div>
                </div>
              </a>
            ))}
            <InfoRow
              Icon={Mail}
              label={t.contact.email}
              value={settings.email}
              href={`mailto:${settings.email}`}
            />

            <div className="flex items-center gap-3 pt-1">
              {settings.instagram && <SocialBtn href={settings.instagram} Icon={Instagram} />}
              {settings.facebook && <SocialBtn href={settings.facebook} Icon={Facebook} />}
            </div>

            <LazyMap
              lat={settings.regionLat}
              lng={settings.regionLng}
              zoom={settings.regionZoom}
              label={lang === 'es' ? settings.locationEs : settings.locationEn}
              className="h-72"
            />
          </div>
        </Reveal>
      </section>
    </PublicLayout>
  )
}

function InfoRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Mail
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-800 p-5 transition-colors hover:border-gold/40">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 text-gold">
        <Icon size={18} strokeWidth={1.5} />
      </span>
      <div>
        <div className="text-[11px] uppercase tracking-wide text-faint">{label}</div>
        <div className="mt-0.5 text-sm text-cream">{value}</div>
      </div>
    </div>
  )
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  )
}

function SocialBtn({ href, Icon }: { href: string; Icon: typeof Instagram }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-cream/70 transition-all hover:border-gold hover:text-gold"
    >
      <Icon size={18} />
    </a>
  )
}
