import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { ImageManager } from '../../components/admin/ImageManager'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { addZone } from '../../lib/settings'
import { Plus, Check as CheckIcon, X as XIcon } from 'lucide-react'
import {
  adminFetchPropertyById,
  createProperty,
  updateProperty,
} from '../../lib/propertiesService'
import { slugify, classNames } from '../../lib/format'
import type {
  PropertyInput,
  PropertyType,
  PropertyStatus,
  AmenityKey,
} from '../../types/property'
import { amenityIcon } from '../../lib/amenityIcons'

const TYPES: PropertyType[] = ['house', 'villa', 'apartment', 'lot', 'commercial']
const STATUSES: PropertyStatus[] = ['available', 'reserved', 'sold']
const ALL_AMENITIES: AmenityKey[] = [
  'ocean_view', 'beach_access', 'pool', 'furnished', 'solar', 'garden',
  'parking', 'security', 'wifi', 'ac', 'river', 'jungle', 'titled', 'water', 'electricity',
]

const empty: PropertyInput = {
  slug: '',
  title_es: '',
  title_en: '',
  description_es: '',
  description_en: '',
  type: 'house',
  status: 'available',
  price: 0,
  zone: '',
  has_dwelling: true,
  land_size: 0,
  construction_size: 0,
  bedrooms: 0,
  bathrooms: 0,
  amenities: [],
  images: [],
  video_url: '',
  lat: null,
  lng: null,
  featured: false,
}

export default function AdminPropertyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [form, setForm] = useState<PropertyInput>(empty)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    adminFetchPropertyById(id!)
      .then((p) => {
        if (p) {
          const { id: _id, created_at: _c, ...rest } = p
          setForm({ ...empty, ...rest, video_url: p.video_url ?? '' })
          setSlugTouched(true)
        }
      })
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function set<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onTitleEsChange(value: string) {
    setForm((f) => ({
      ...f,
      title_es: value,
      slug: slugTouched ? f.slug : slugify(value),
    }))
  }

  function toggleAmenity(a: AmenityKey) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload: PropertyInput = {
        ...form,
        slug: form.slug || slugify(form.title_es || form.title_en),
        price: Number(form.price) || 0,
        land_size: Number(form.land_size) || 0,
        construction_size: Number(form.construction_size) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        video_url: form.video_url || null,
      }
      if (isEdit) {
        await updateProperty(id!, payload)
      } else {
        await createProperty(payload)
      }
      setSaved(true)
      setTimeout(() => navigate('/admin'), 700)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  if (loading) {
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
      <Link
        to="/admin"
        className="group inline-flex items-center gap-2 text-sm text-mist transition-colors hover:text-gold"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {t.admin.backToList}
      </Link>

      <h1 className="mt-4 font-display text-4xl text-cream">
        {isEdit ? t.admin.editProperty : t.admin.newProperty}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Titles */}
        <Section title="ES / EN">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={label}>{t.detail.overview} (ES) · Título</label>
              <input
                required
                value={form.title_es}
                onChange={(e) => onTitleEsChange(e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Title (EN)</label>
              <input
                value={form.title_en}
                onChange={(e) => set('title_en', e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Descripción (ES)</label>
              <textarea
                rows={5}
                value={form.description_es}
                onChange={(e) => set('description_es', e.target.value)}
                className={`${input} resize-none`}
              />
            </div>
            <div>
              <label className={label}>Description (EN)</label>
              <textarea
                rows={5}
                value={form.description_en}
                onChange={(e) => set('description_en', e.target.value)}
                className={`${input} resize-none`}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={label}>Slug (URL)</label>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', slugify(e.target.value))
              }}
              className={input}
            />
          </div>
        </Section>

        {/* Key facts */}
        <Section title={t.detail.details}>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className={label}>{t.detail.type}</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value as PropertyType)}
                className={input}
              >
                {TYPES.map((ty) => (
                  <option key={ty} value={ty}>
                    {t.types[ty]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>{t.filters.status}</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as PropertyStatus)}
                className={input}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t.status[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Precio (USD)</label>
              <input
                type="number"
                min={0}
                value={form.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t.filters.zone}</label>
              <ZonePicker value={form.zone} onChange={(v) => set('zone', v)} />
            </div>
            <div>
              <label className={label}>{t.detail.land} (m²)</label>
              <input
                type="number"
                min={0}
                value={form.land_size || ''}
                onChange={(e) => set('land_size', Number(e.target.value))}
                className={input}
              />
            </div>
            <div>
              <label className={label}>{t.detail.construction} (m²)</label>
              <input
                type="number"
                min={0}
                value={form.construction_size || ''}
                onChange={(e) => set('construction_size', Number(e.target.value))}
                className={input}
              />
            </div>
          </div>

          {/* Dwelling toggle + beds/baths */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Toggle
              label={t.filters.withDwelling}
              checked={form.has_dwelling}
              onChange={(v) => set('has_dwelling', v)}
            />
            <div>
              <label className={label}>{t.detail.bedrooms}</label>
              <input
                type="number"
                min={0}
                disabled={!form.has_dwelling}
                value={form.bedrooms || ''}
                onChange={(e) => set('bedrooms', Number(e.target.value))}
                className={classNames(input, !form.has_dwelling && 'opacity-40')}
              />
            </div>
            <div>
              <label className={label}>{t.detail.bathrooms}</label>
              <input
                type="number"
                min={0}
                disabled={!form.has_dwelling}
                value={form.bathrooms || ''}
                onChange={(e) => set('bathrooms', Number(e.target.value))}
                className={classNames(input, !form.has_dwelling && 'opacity-40')}
              />
            </div>
          </div>
        </Section>

        {/* Amenities */}
        <Section title={t.detail.amenities}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {ALL_AMENITIES.map((a) => {
              const Icon = amenityIcon[a]
              const active = form.amenities.includes(a)
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={classNames(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all',
                    active
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-white/12 bg-ink-800 text-cream/70 hover:border-white/25',
                  )}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="truncate">{t.amenities[a]}</span>
                </button>
              )
            })}
          </div>
        </Section>

        {/* Images */}
        <Section title={t.detail.gallery}>
          <ImageManager images={form.images} onChange={(imgs) => set('images', imgs)} />
        </Section>

        {/* Media + location */}
        <Section title={`${t.detail.video} · ${t.detail.location}`}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label className={label}>{t.detail.video} (YouTube / Vimeo URL)</label>
              <input
                value={form.video_url ?? ''}
                onChange={(e) => set('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Latitud</label>
              <input
                type="number"
                step="any"
                value={form.lat ?? ''}
                onChange={(e) => set('lat', e.target.value ? Number(e.target.value) : null)}
                placeholder="9.6553"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Longitud</label>
              <input
                type="number"
                step="any"
                value={form.lng ?? ''}
                onChange={(e) => set('lng', e.target.value ? Number(e.target.value) : null)}
                placeholder="-82.7541"
                className={input}
              />
            </div>
            <div className="flex items-end">
              <Toggle
                label={t.featured.eyebrow}
                checked={form.featured}
                onChange={(v) => set('featured', v)}
              />
            </div>
          </div>
        </Section>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        )}

        {/* Sticky actions */}
        <div className="sticky bottom-0 -mx-5 flex items-center justify-end gap-3 border-t border-white/10 bg-ink/90 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
          <Link to="/admin" className="btn-ghost !py-2.5">
            {t.admin.cancel}
          </Link>
          <button type="submit" disabled={saving} className="btn-gold !py-2.5 disabled:opacity-60">
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saved ? t.admin.saved : saving ? t.admin.saving : t.admin.save}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

function ZonePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage()
  const { settings, reload } = useSettings()
  const [adding, setAdding] = useState(false)
  const [newZone, setNewZone] = useState('')
  const [busy, setBusy] = useState(false)
  const zones = settings.zones ?? []

  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'

  async function confirmAdd() {
    const clean = newZone.trim()
    if (!clean) return
    setBusy(true)
    try {
      await addZone(clean)
      await reload()
      onChange(clean)
      setNewZone('')
      setAdding(false)
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirmAdd())}
          placeholder={t.admin.newZonePlaceholder}
          className={input}
        />
        <button type="button" onClick={confirmAdd} disabled={busy} className="grid h-10 w-11 shrink-0 place-items-center rounded-xl bg-gold text-ink disabled:opacity-60">
          <CheckIcon size={16} />
        </button>
        <button type="button" onClick={() => { setAdding(false); setNewZone('') }} className="grid h-10 w-11 shrink-0 place-items-center rounded-xl border border-white/15 text-cream/70">
          <XIcon size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <select required value={value} onChange={(e) => onChange(e.target.value)} className={input}>
        <option value="">{t.admin.selectZone}</option>
        {/* Keep a non-listed legacy value selectable so old data still shows */}
        {value && !zones.includes(value) && <option value={value}>{value}</option>}
        {zones.map((z) => (
          <option key={z} value={z}>
            {z}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => setAdding(true)}
        title={t.admin.newZone}
        className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-gold/40 bg-gold/10 px-3 text-sm text-gold hover:bg-gold/20"
      >
        <Plus size={15} /> {t.admin.newZone}
      </button>
    </div>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border border-white/12 bg-ink-800 px-4 py-2.5"
    >
      <span
        className={classNames(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-gold' : 'bg-white/15',
        )}
      >
        <span
          className={classNames(
            'absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className="text-sm text-cream/85">{label}</span>
    </button>
  )
}
