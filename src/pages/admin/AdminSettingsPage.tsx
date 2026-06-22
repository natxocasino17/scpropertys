import { useEffect, useState, useRef } from 'react'
import { Save, Loader2, Check, Upload, Link2, Image as ImageIcon } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { fetchSettings, saveSettings, SiteSettings } from '../../lib/settings'
import { uploadImage } from '../../lib/propertiesService'
import { compressImage } from '../../lib/imageCompress'
import { isSupabaseConfigured } from '../../lib/supabase'

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
