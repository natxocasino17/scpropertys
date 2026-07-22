import { useEffect, useState, useRef } from 'react'
import { Save, Loader2, Check, Upload, Link2, Image as ImageIcon, Star, Plus, Trash2 } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { fetchSettings, saveSettings, SiteSettings, StatItem, ServiceItem, Agent } from '../../lib/settings'
import { uploadImage } from '../../lib/propertiesService'
import { compressImage } from '../../lib/imageCompress'
import { isSupabaseConfigured } from '../../lib/supabase'
import { STAT_ICONS, STAT_ICON_KEYS } from '../../lib/statIcons'
import { classNames } from '../../lib/format'

export default function AdminSettingsPage() {
  const { t } = useLanguage()
  const { reload } = useSettings()
  const [form, setForm] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSettings()
      .then(setForm)
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setError('')
    setSaving(true)
    try {
      await saveSettings(form)
      await reload()
      setSaved(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) {
    return (
      <AdminLayout>
        <Spinner />
      </AdminLayout>
    )
  }

  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'
  const label = 'mb-1.5 block text-xs uppercase tracking-wide text-faint'

  // Helper: a bilingual (ES + EN) field pair
  const bi = (
    caption: string,
    esKey: keyof SiteSettings,
    enKey: keyof SiteSettings,
    multiline = false,
  ) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={label}>{caption} (ES)</label>
        {multiline ? (
          <textarea rows={2} value={form[esKey] as string} onChange={(e) => set(esKey, e.target.value as never)} className={`${input} resize-none`} />
        ) : (
          <input value={form[esKey] as string} onChange={(e) => set(esKey, e.target.value as never)} className={input} />
        )}
      </div>
      <div>
        <label className={label}>{caption} (EN)</label>
        {multiline ? (
          <textarea rows={2} value={form[enKey] as string} onChange={(e) => set(enKey, e.target.value as never)} className={`${input} resize-none`} />
        ) : (
          <input value={form[enKey] as string} onChange={(e) => set(enKey, e.target.value as never)} className={input} />
        )}
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl text-cream">{t.admin.settings}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Brand */}
        <Section title={t.admin.brandSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t.admin.brandName}</label>
              <input value={form.brand} onChange={(e) => set('brand', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.brandSuffix}</label>
              <input value={form.brandSuffix} onChange={(e) => set('brandSuffix', e.target.value)} className={input} />
            </div>
          </div>
        </Section>

        {/* Hero image */}
        <Section title={t.admin.heroSection}>
          <label className={label}>{t.admin.heroImage}</label>
          <SingleImageInput value={form.heroImage} onChange={(v) => set('heroImage', v)} placeholder={t.admin.imgUrlPlaceholder} />
        </Section>

        {/* Home texts */}
        <Section title={t.admin.homeSection}>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>{t.admin.heroEyebrowLabel} (ES)</label>
                <input value={form.heroEyebrowEs} onChange={(e) => set('heroEyebrowEs', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>{t.admin.heroEyebrowLabel} (EN)</label>
                <input value={form.heroEyebrowEn} onChange={(e) => set('heroEyebrowEn', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>{t.admin.heroTitleLabel} (ES)</label>
                <input value={form.heroTitleEs} onChange={(e) => set('heroTitleEs', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>{t.admin.heroTitleLabel} (EN)</label>
                <input value={form.heroTitleEn} onChange={(e) => set('heroTitleEn', e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>{t.admin.heroSubtitleLabel} (ES)</label>
                <textarea rows={3} value={form.heroSubtitleEs} onChange={(e) => set('heroSubtitleEs', e.target.value)} className={`${input} resize-none`} />
              </div>
              <div>
                <label className={label}>{t.admin.heroSubtitleLabel} (EN)</label>
                <textarea rows={3} value={form.heroSubtitleEn} onChange={(e) => set('heroSubtitleEn', e.target.value)} className={`${input} resize-none`} />
              </div>
            </div>
          </div>
        </Section>

        {/* Stats editor */}
        <Section title={t.admin.statsSection}>
          <p className="mb-4 text-xs text-faint">{t.admin.statsHint}</p>
          <div className="space-y-4">
            {form.stats.map((stat, i) => (
              <StatEditor
                key={i}
                index={i}
                stat={stat}
                onChange={(next) =>
                  set(
                    'stats',
                    form.stats.map((s, idx) => (idx === i ? next : s)),
                  )
                }
              />
            ))}
          </div>
        </Section>

        {/* Featured section */}
        <Section title={t.admin.featuredSection}>
          <div className="space-y-4">
            {bi(t.admin.eyebrowLabel, 'featuredEyebrowEs', 'featuredEyebrowEn')}
            {bi(t.admin.titleLabel, 'featuredTitleEs', 'featuredTitleEn')}
            {bi(t.admin.subtitleLabel, 'featuredSubtitleEs', 'featuredSubtitleEn')}
            {bi(t.admin.linkLabel, 'featuredCtaEs', 'featuredCtaEn')}
          </div>
        </Section>

        {/* Services section */}
        <Section title={t.admin.servicesSection}>
          <div className="space-y-4">
            {bi(t.admin.eyebrowLabel, 'servicesEyebrowEs', 'servicesEyebrowEn')}
            {bi(t.admin.titleLabel, 'servicesTitleEs', 'servicesTitleEn')}
            <div className="space-y-4 pt-2">
              {form.services.map((svc, i) => (
                <ServiceEditor
                  key={i}
                  index={i}
                  service={svc}
                  onChange={(next) =>
                    set('services', form.services.map((s, idx) => (idx === i ? next : s)))
                  }
                />
              ))}
            </div>
          </div>
        </Section>

        {/* Final CTA section */}
        <Section title={t.admin.ctaSection}>
          <div className="space-y-4">
            <div>
              <label className={label}>{t.admin.heroImage}</label>
              <SingleImageInput value={form.ctaImage} onChange={(v) => set('ctaImage', v)} placeholder={t.admin.imgUrlPlaceholder} />
            </div>
            {bi(t.admin.eyebrowLabel, 'ctaEyebrowEs', 'ctaEyebrowEn')}
            {bi(t.admin.titleLabel, 'ctaTitleEs', 'ctaTitleEn', true)}
            {bi(t.admin.subtitleLabel, 'ctaSubtitleEs', 'ctaSubtitleEn', true)}
            {bi(`${t.admin.linkLabel} 1`, 'ctaButton1Es', 'ctaButton1En')}
            {bi(`${t.admin.linkLabel} 2`, 'ctaButton2Es', 'ctaButton2En')}
          </div>
        </Section>

        {/* Portfolio page header */}
        <Section title={t.admin.portfolioSection}>
          <div className="space-y-4">
            {bi(t.admin.eyebrowLabel, 'portfolioEyebrowEs', 'portfolioEyebrowEn')}
            {bi(t.admin.titleLabel, 'portfolioTitleEs', 'portfolioTitleEn')}
            {bi(t.admin.subtitleLabel, 'portfolioSubtitleEs', 'portfolioSubtitleEn')}
          </div>
        </Section>

        {/* Contact page header */}
        <Section title={t.admin.contactHeaderSection}>
          <div className="space-y-4">
            {bi(t.admin.eyebrowLabel, 'contactEyebrowEs', 'contactEyebrowEn')}
            {bi(t.admin.titleLabel, 'contactTitleEs', 'contactTitleEn')}
            {bi(t.admin.subtitleLabel, 'contactSubtitleEs', 'contactSubtitleEn')}
          </div>
        </Section>

        {/* Footer */}
        <Section title="Footer">
          {bi(t.admin.footerTagline, 'footerTaglineEs', 'footerTaglineEn')}
        </Section>

        {/* Agents / sellers */}
        <Section title={t.admin.agentsSection}>
          <p className="mb-4 text-xs text-faint">{t.admin.agentsHint}</p>
          <div className="space-y-5">
            {form.agents.map((agent, i) => (
              <AgentEditor
                key={agent.id}
                agent={agent}
                onChange={(next) =>
                  set('agents', form.agents.map((a, idx) => (idx === i ? next : a)))
                }
              />
            ))}
          </div>
        </Section>

        {/* About page header */}
        <Section title={t.admin.aboutSection}>
          <div className="space-y-4">
            {bi(t.admin.eyebrowLabel, 'aboutEyebrowEs', 'aboutEyebrowEn')}
            {bi(t.admin.titleLabel, 'aboutTitleEs', 'aboutTitleEn')}
            {bi(t.admin.subtitleLabel, 'aboutSubtitleEs', 'aboutSubtitleEn')}
          </div>
        </Section>

        {/* Zones / locations */}
        <Section title={t.admin.zonesSection}>
          <p className="mb-4 text-xs text-faint">{t.admin.zonesHint}</p>
          <ZonesEditor zones={form.zones} onChange={(z) => set('zones', z)} />
        </Section>

        {/* Contact */}
        <Section title={t.admin.contactSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>{t.admin.whatsappNum}</label>
              <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="50688887777" className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.phoneLabel}</label>
              <input value={form.phoneDisplay} onChange={(e) => set('phoneDisplay', e.target.value)} placeholder="+506 8888 7777" className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>{t.admin.emailLabel}</label>
              <input value={form.email} onChange={(e) => set('email', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.locationEsLabel}</label>
              <input value={form.locationEs} onChange={(e) => set('locationEs', e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.locationEnLabel}</label>
              <input value={form.locationEn} onChange={(e) => set('locationEn', e.target.value)} className={input} />
            </div>
          </div>
        </Section>

        {/* Social */}
        <Section title={t.admin.socialSection}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Instagram</label>
              <input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/…" className={input} />
            </div>
            <div>
              <label className={label}>Facebook</label>
              <input value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/…" className={input} />
            </div>
            <div>
              <label className={label}>YouTube</label>
              <input value={form.youtube} onChange={(e) => set('youtube', e.target.value)} placeholder="https://youtube.com/…" className={input} />
            </div>
            <div>
              <label className={label}>TikTok</label>
              <input value={form.tiktok} onChange={(e) => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" className={input} />
            </div>
          </div>
        </Section>

        {/* Map */}
        <Section title={t.admin.mapSection}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>{t.admin.mapLat}</label>
              <input type="number" step="any" value={form.regionLat} onChange={(e) => set('regionLat', Number(e.target.value))} className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.mapLng}</label>
              <input type="number" step="any" value={form.regionLng} onChange={(e) => set('regionLng', Number(e.target.value))} className={input} />
            </div>
            <div>
              <label className={label}>{t.admin.mapZoom}</label>
              <input type="number" min={1} max={18} value={form.regionZoom} onChange={(e) => set('regionZoom', Number(e.target.value))} className={input} />
            </div>
          </div>
        </Section>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">{error}</p>
        )}

        <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-3 border-t border-white/10 bg-ink/90 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
          {saved && <span className="text-sm text-emerald-300">{t.admin.settingsSaved}</span>}
          <button type="submit" disabled={saving} className="btn-gold !py-2.5 disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? t.admin.saving : t.admin.save}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink-800/50 p-6">
      <h2 className="mb-5 font-display text-xl text-cream">{title}</h2>
      {children}
    </section>
  )
}

function StatEditor({
  index,
  stat,
  onChange,
}: {
  index: number
  stat: StatItem
  onChange: (s: StatItem) => void
}) {
  const { t } = useLanguage()
  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'
  const label = 'mb-1 block text-[10px] uppercase tracking-wide text-faint'

  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
      <div className="mb-3 text-xs font-medium text-gold">#{index + 1}</div>

      {/* Icon picker */}
      <label className={label}>{t.admin.statIconLabel}</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {STAT_ICON_KEYS.map((key) => {
          const active = stat.icon === key
          const Icon = STAT_ICONS[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...stat, icon: key })}
              title={key}
              className={classNames(
                'grid h-9 w-9 place-items-center rounded-lg border transition-all',
                active ? 'border-gold bg-gold/15 text-gold' : 'border-white/12 text-cream/60 hover:border-white/30',
              )}
            >
              {key === 'stars' ? <Star size={16} className="fill-current" /> : Icon ? <Icon size={16} strokeWidth={1.5} /> : null}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={label}>{t.admin.statValueLabel}</label>
          <input
            value={stat.value}
            onChange={(e) => onChange({ ...stat, value: e.target.value })}
            placeholder="3+, 100%, {count}…"
            className={input}
          />
        </div>
        <div>
          <label className={label}>{t.admin.statLabelEsLabel}</label>
          <input value={stat.labelEs} onChange={(e) => onChange({ ...stat, labelEs: e.target.value })} className={input} />
        </div>
        <div>
          <label className={label}>{t.admin.statLabelEnLabel}</label>
          <input value={stat.labelEn} onChange={(e) => onChange({ ...stat, labelEn: e.target.value })} className={input} />
        </div>
      </div>
    </div>
  )
}

function AgentEditor({ agent, onChange }: { agent: Agent; onChange: (a: Agent) => void }) {
  const { t } = useLanguage()
  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'
  const label = 'mb-1 block text-[10px] uppercase tracking-wide text-faint'

  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div>
          <label className={label}>{t.admin.agentPhoto}</label>
          <SingleImageInput
            value={agent.photo}
            onChange={(v) => onChange({ ...agent, photo: v })}
            placeholder={t.admin.imgUrlPlaceholder}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>{t.admin.agentName}</label>
            <input value={agent.name} onChange={(e) => onChange({ ...agent, name: e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>{t.admin.whatsappNum}</label>
            <input value={agent.whatsapp} onChange={(e) => onChange({ ...agent, whatsapp: e.target.value })} placeholder="50688887777" className={input} />
            <p className="mt-1 text-[11px] text-faint">{t.admin.agentWhatsappHint}</p>
          </div>
          <div>
            <label className={label}>{t.admin.phoneLabel}</label>
            <input value={agent.phoneDisplay} onChange={(e) => onChange({ ...agent, phoneDisplay: e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>{t.admin.agentInstagram}</label>
            <input value={agent.instagram} onChange={(e) => onChange({ ...agent, instagram: e.target.value })} placeholder="https://instagram.com/…" className={input} />
          </div>
          <div>
            <label className={label}>🔑 {t.admin.emailLabel} (login)</label>
            <input value={agent.email} onChange={(e) => onChange({ ...agent, email: e.target.value })} placeholder="ailana@gmail.com" className={input} />
            <p className="mt-1 text-[11px] text-amber-300/80">{t.admin.agentEmailHint}</p>
          </div>
          <div>
            <label className={label}>{t.admin.agentBio} (ES)</label>
            <textarea rows={2} value={agent.bioEs} onChange={(e) => onChange({ ...agent, bioEs: e.target.value })} className={`${input} resize-none`} />
          </div>
          <div>
            <label className={label}>{t.admin.agentBio} (EN)</label>
            <textarea rows={2} value={agent.bioEn} onChange={(e) => onChange({ ...agent, bioEn: e.target.value })} className={`${input} resize-none`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ZonesEditor({ zones, onChange }: { zones: string[]; onChange: (z: string[]) => void }) {
  const { t } = useLanguage()
  const [newZone, setNewZone] = useState('')
  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'

  function add() {
    const clean = newZone.trim()
    if (!clean) return
    if (zones.some((z) => z.toLowerCase() === clean.toLowerCase())) {
      setNewZone('')
      return
    }
    onChange([...zones, clean].sort((a, b) => a.localeCompare(b)))
    setNewZone('')
  }

  function rename(i: number, name: string) {
    onChange(zones.map((z, idx) => (idx === i ? name : z)))
  }

  function remove(i: number) {
    onChange(zones.filter((_, idx) => idx !== i))
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <input
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={t.admin.newZonePlaceholder}
          className={input}
        />
        <button type="button" onClick={add} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 px-4 text-sm text-gold hover:bg-gold/20">
          <Plus size={15} /> {t.admin.newZone}
        </button>
      </div>
      <div className="space-y-2">
        {zones.map((z, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={z} onChange={(e) => rename(i, e.target.value)} className={input} />
            <button type="button" onClick={() => remove(i)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-cream/60 hover:bg-white/5 hover:text-rose-300">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceEditor({
  index,
  service,
  onChange,
}: {
  index: number
  service: ServiceItem
  onChange: (s: ServiceItem) => void
}) {
  const { t } = useLanguage()
  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-3 py-2 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'
  const label = 'mb-1 block text-[10px] uppercase tracking-wide text-faint'
  const iconKeys = Object.keys(STAT_ICONS)

  return (
    <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
      <div className="mb-3 text-xs font-medium text-gold">#{index + 1}</div>

      <label className={label}>{t.admin.statIconLabel}</label>
      <div className="mb-3 flex flex-wrap gap-2">
        {iconKeys.map((key) => {
          const active = service.icon === key
          const Icon = STAT_ICONS[key]
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ ...service, icon: key })}
              title={key}
              className={classNames(
                'grid h-9 w-9 place-items-center rounded-lg border transition-all',
                active ? 'border-gold bg-gold/15 text-gold' : 'border-white/12 text-cream/60 hover:border-white/30',
              )}
            >
              {Icon ? <Icon size={16} strokeWidth={1.5} /> : null}
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label}>{t.admin.titleLabel} (ES)</label>
          <input value={service.titleEs} onChange={(e) => onChange({ ...service, titleEs: e.target.value })} className={input} />
        </div>
        <div>
          <label className={label}>{t.admin.titleLabel} (EN)</label>
          <input value={service.titleEn} onChange={(e) => onChange({ ...service, titleEn: e.target.value })} className={input} />
        </div>
        <div>
          <label className={label}>{t.admin.subtitleLabel} (ES)</label>
          <textarea rows={2} value={service.descEs} onChange={(e) => onChange({ ...service, descEs: e.target.value })} className={`${input} resize-none`} />
        </div>
        <div>
          <label className={label}>{t.admin.subtitleLabel} (EN)</label>
          <textarea rows={2} value={service.descEn} onChange={(e) => onChange({ ...service, descEn: e.target.value })} className={`${input} resize-none`} />
        </div>
      </div>
    </div>
  )
}

function SingleImageInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const { t } = useLanguage()
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const optimized = await compressImage(file, { maxSize: 2400, quality: 0.85 })
      const url = await uploadImage(optimized)
      onChange(url)
    } catch {
      /* ignore */
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-white/15 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
          />
        </div>
        {isSupabaseConfigured && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? t.admin.uploading : t.admin.uploadImg}
            </button>
          </>
        )}
      </div>
      <div className="mt-3 aspect-[21/9] w-full overflow-hidden rounded-xl border border-white/10 bg-ink-700">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-faint">
            <ImageIcon size={28} />
          </div>
        )}
      </div>
    </div>
  )
}
