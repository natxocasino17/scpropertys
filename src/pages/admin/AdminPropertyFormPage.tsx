import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, Check, Languages } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { ImageManager } from '../../components/admin/ImageManager'
import { AdminNotes } from '../../components/admin/AdminNotes'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { addZone } from '../../lib/settings'
import { Plus, Check as CheckIcon, X as XIcon, Link2 } from 'lucide-react'
import {
  adminFetchPropertyById,
  createProperty,
  updateProperty,
  fetchPropertyNotes,
  savePropertyNotes,
  logActivity,
} from '../../lib/propertiesService'
import type { AdminNote, Property } from '../../types/property'
import { useAuth } from '../../context/AuthContext'
import { parseVideo } from '../../lib/video'
import { translateText } from '../../lib/translate'
import {
  parseCoordinate,
  parseMapsInput,
  isShortMapsLink,
  isValidLat,
  isValidLng,
  isValidLatLng,
  roundCoordinate,
} from '../../lib/geo'
import { slugify, classNames, formatPrice } from '../../lib/format'
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
  agent_id: '',
}

export default function AdminPropertyFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { t } = useLanguage()
  const { settings } = useSettings()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<PropertyInput>(empty)
  const [notes, setNotes] = useState<AdminNote[]>([])
  const [loading, setLoading] = useState(isEdit)
  const [translating, setTranslating] = useState(false)
  const [translateMsg, setTranslateMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const originalRef = useRef<Property | null>(null)

  /**
   * Rellena los campos en inglés a partir del español.
   * No pisa nada sin avisar y deja el resultado editable: la traducción
   * automática acierta casi siempre, pero conviene darle un repaso.
   */
  async function translateToEnglish() {
    const yaHayIngles = form.title_en.trim() || form.description_en.trim()
    if (yaHayIngles && !confirm('Ya hay texto en inglés. ¿Reemplazarlo por la traducción?')) return

    setTranslating(true)
    setTranslateMsg(null)
    try {
      // Una detrás de otra, no en paralelo: el servicio gratuito limita ráfagas.
      const title = await translateText(form.title_es)
      const description = await translateText(form.description_es)
      setForm((f) => ({ ...f, title_en: title, description_en: description }))
      setTranslateMsg({ ok: true, text: 'Listo — repasalo antes de guardar.' })
    } catch (err) {
      setTranslateMsg({
        ok: false,
        text: err instanceof Error ? err.message : 'No se pudo traducir. Probá de nuevo.',
      })
    } finally {
      setTranslating(false)
    }
  }

  /** The agent whose email matches the logged-in user (used to auto-assign). */
  const myAgent = settings.agents?.find(
    (a) => a.email && user?.email && a.email.toLowerCase() === user.email.toLowerCase(),
  )

  // New property → auto-assign to the logged-in agent (by email match).
  useEffect(() => {
    if (!isEdit && myAgent && !form.agent_id) {
      setForm((f) => ({ ...f, agent_id: myAgent.id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, myAgent?.id])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    Promise.all([adminFetchPropertyById(id!), fetchPropertyNotes(id!)])
      .then(([p, n]) => {
        if (p) {
          originalRef.current = p
          const { id: _id, created_at: _c, ...rest } = p
          setForm({ ...empty, ...rest, video_url: p.video_url ?? '' })
          setSlugTouched(true)
        }
        setNotes(n)
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
        // Última barrera: una coordenada fuera de rango nunca llega a la base.
        // Se guardan las dos o ninguna, porque media coordenada no dibuja nada.
        lat: isValidLatLng(form.lat, form.lng) ? Number(form.lat) : null,
        lng: isValidLatLng(form.lat, form.lng) ? Number(form.lng) : null,
        video_url: form.video_url || null,
        agent_id: form.agent_id || null,
      }
      const saved = isEdit
        ? await updateProperty(id!, payload)
        : await createProperty(payload)
      await savePropertyNotes(saved.id, notes)

      // Change history
      const propTitle = form.title_es || form.title_en || saved.slug
      if (isEdit) {
        const detail = buildChangeDetail(originalRef.current, payload)
        await logActivity({
          action: 'update',
          entity_title: propTitle,
          detail: detail || 'Editada',
          actor_email: user?.email ?? null,
        })
      } else {
        await logActivity({
          action: 'create',
          entity_title: propTitle,
          detail: payload.price > 0 ? formatPrice(payload.price) : null,
          actor_email: user?.email ?? null,
        })
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
          <div className="mb-4 rounded-xl border border-gold/25 bg-gold/5 px-3.5 py-2.5 text-xs leading-relaxed text-cream/80">
            <strong className="text-gold">Con el español alcanza.</strong> Si dejás los campos en
            inglés vacíos, la web en inglés muestra el texto en español en vez de un hueco. Y si
            querés el inglés de verdad, escribí el español y dale al botón de traducir.
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={translateToEnglish}
              disabled={translating || !form.title_es.trim()}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs text-gold transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {translating ? <Loader2 size={15} className="animate-spin" /> : <Languages size={15} />}
              {translating ? 'Traduciendo…' : 'Traducir al inglés'}
            </button>
            {translateMsg && (
              <span
                className={classNames(
                  'text-xs',
                  translateMsg.ok ? 'text-emerald-300' : 'text-rose-300',
                )}
              >
                {translateMsg.text}
              </span>
            )}
          </div>
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
              <label className={label}>Title (EN) · opcional</label>
              <input
                value={form.title_en}
                onChange={(e) => set('title_en', e.target.value)}
                placeholder={form.title_es || 'Se usa el título en español'}
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
              <label className={label}>Description (EN) · opcional</label>
              <textarea
                rows={5}
                value={form.description_en}
                onChange={(e) => set('description_en', e.target.value)}
                placeholder="Se usa la descripción en español"
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
              <label className={label}>{t.admin.agentLabel}</label>
              <select
                value={form.agent_id ?? ''}
                onChange={(e) => set('agent_id', e.target.value)}
                className={input}
              >
                <option value="">{t.admin.agentNone}</option>
                {settings.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {form.agent_id ? (
                <p className="mt-1.5 text-xs text-emerald-300/90">
                  ✓ {t.admin.agentAssigned}{' '}
                  {settings.agents.find((a) => a.id === form.agent_id)?.name}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-amber-300/90">
                  ⚠ {t.admin.agentUnassignedWarn}
                </p>
              )}
              {!myAgent && (
                <p className="mt-1 text-xs text-faint">
                  {t.admin.agentNoMatch} <span className="text-cream/80">{user?.email}</span>
                </p>
              )}
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
              <label className={label}>{t.detail.video}</label>
              <VideoInput value={form.video_url ?? ''} onChange={(v) => set('video_url', v)} />
            </div>
            <div className="md:col-span-2">
              <LocationInput
                lat={form.lat ?? null}
                lng={form.lng ?? null}
                onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
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

        {/* Private admin notes */}
        <Section title={`🔒 ${t.admin.notesSection}`}>
          <p className="mb-4 text-xs text-faint">{t.admin.notesHint}</p>
          <AdminNotes notes={notes} onChange={setNotes} />
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

function VideoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useLanguage()
  const parsed = parseVideo(value)
  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'

  return (
    <div>
      <div className="relative">
        <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=…  ó  https://youtu.be/…"
          className={input}
        />
      </div>
      <p className="mt-2 text-xs text-faint">{t.detail.videoHint}</p>

      {value && !parsed && (
        <p className="mt-2 text-xs text-rose-300">{t.detail.videoInvalid}</p>
      )}

      {parsed?.kind === 'iframe' && (
        <div className="mt-3 aspect-video max-w-md overflow-hidden rounded-xl border border-white/10 bg-ink-700">
          <iframe src={parsed.src} title="preview" className="h-full w-full" allowFullScreen />
        </div>
      )}
    </div>
  )
}

/**
 * Ubicación de la propiedad: enlace de Google Maps o coordenadas a mano.
 *
 * Los campos son de TEXTO a propósito. Con <input type="number"> y el equipo en
 * español, el navegador leía el punto como separador de miles y guardaba
 * "-82.8020075916093" como -828020075916093, lo que reventaba el mapa.
 */
function LocationInput({
  lat,
  lng,
  onChange,
}: {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}) {
  const [link, setLink] = useState('')
  const [linkState, setLinkState] = useState<'idle' | 'ok' | 'short' | 'error'>('idle')
  // Texto crudo mientras se escribe, para no pelear con el cursor al teclear "-" o "9,"
  const [draft, setDraft] = useState<{ lat: string; lng: string } | null>(null)

  const input =
    'w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-2.5 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'
  const labelCls = 'mb-1.5 block text-xs uppercase tracking-wide text-faint'

  const shownLat = draft ? draft.lat : lat ?? ''
  const shownLng = draft ? draft.lng : lng ?? ''

  const commit = (nextLat: string, nextLng: string) => {
    setDraft({ lat: nextLat, lng: nextLng })
    const a = parseCoordinate(nextLat)
    const b = parseCoordinate(nextLng)
    onChange(
      a !== null && isValidLat(a) ? roundCoordinate(a) : null,
      b !== null && isValidLng(b) ? roundCoordinate(b) : null,
    )
  }

  const applyLink = (value: string) => {
    setLink(value)
    if (!value.trim()) return setLinkState('idle')
    if (isShortMapsLink(value)) return setLinkState('short')
    const found = parseMapsInput(value)
    if (!found) return setLinkState('error')
    setDraft({ lat: String(found.lat), lng: String(found.lng) })
    onChange(roundCoordinate(found.lat), roundCoordinate(found.lng))
    setLinkState('ok')
  }

  const latError = shownLat !== '' && !isValidLat(parseCoordinate(String(shownLat)) ?? NaN)
  const lngError = shownLng !== '' && !isValidLng(parseCoordinate(String(shownLng)) ?? NaN)

  return (
    <div>
      <label className={labelCls}>Ubicación en el mapa</label>

      <div className="relative">
        <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={link}
          onChange={(e) => applyLink(e.target.value)}
          placeholder="Pegá aquí el enlace de Google Maps"
          className="w-full rounded-xl border border-white/15 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
        />
      </div>

      <div className="mt-2 rounded-xl border border-gold/25 bg-gold/5 px-3.5 py-2.5 text-xs leading-relaxed text-cream/80">
        <strong className="text-gold">Ojo con el enlace corto.</strong> El que copia Google
        (<code className="text-cream">maps.app.goo.gl/…</code>) <strong>no lleva las coordenadas
        dentro</strong>. Pegalo primero en la barra de direcciones del navegador y dale enter: la
        página se abre con el enlace largo, que sí las trae. Ese es el que hay que copiar acá —
        el largo empieza por <code className="text-cream">google.com/maps/place/…</code> y tiene
        una <code className="text-cream">@</code> con los números.
      </div>

      {linkState === 'ok' && (
        <p className="mt-2 text-xs text-emerald-300">
          ✓ Coordenadas tomadas del enlace. Revisá que el pin caiga donde toca.
        </p>
      )}
      {linkState === 'short' && (
        <p className="mt-2 text-xs text-amber-300">
          Ese es el enlace corto y no trae coordenadas. Abrilo en el navegador y copiá el largo.
        </p>
      )}
      {linkState === 'error' && (
        <p className="mt-2 text-xs text-rose-300">
          No encontré coordenadas en ese enlace. Podés escribirlas a mano abajo.
        </p>
      )}

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Latitud</label>
          <input
            inputMode="decimal"
            value={shownLat}
            onChange={(e) => commit(e.target.value, String(shownLng))}
            placeholder="9.6553"
            className={input}
          />
          {latError && <p className="mt-1 text-xs text-rose-300">Debe estar entre -90 y 90.</p>}
        </div>
        <div>
          <label className={labelCls}>Longitud</label>
          <input
            inputMode="decimal"
            value={shownLng}
            onChange={(e) => commit(String(shownLat), e.target.value)}
            placeholder="-82.7541"
            className={input}
          />
          {lngError && <p className="mt-1 text-xs text-rose-300">Debe estar entre -180 y 180.</p>}
        </div>
      </div>

      <p className="mt-2 text-xs text-faint">
        Podés usar punto o coma para los decimales. Si dejás los dos campos vacíos, la propiedad
        no muestra mapa.
      </p>
    </div>
  )
}

const STATUS_ES: Record<string, string> = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
}

/** Human-readable summary of what changed between the saved property and the new values. */
function buildChangeDetail(original: Property | null, next: PropertyInput): string {
  if (!original) return 'Editada'
  const parts: string[] = []
  if (Number(original.price) !== Number(next.price)) {
    parts.push(`Precio: ${formatPrice(Number(original.price)) || '—'} → ${formatPrice(Number(next.price)) || '—'}`)
  }
  if (original.status !== next.status) {
    parts.push(`Estado: ${STATUS_ES[original.status] ?? original.status} → ${STATUS_ES[next.status] ?? next.status}`)
  }
  if ((original.zone || '') !== (next.zone || '')) {
    parts.push(`Zona: ${original.zone || '—'} → ${next.zone || '—'}`)
  }
  if ((original.agent_id || '') !== (next.agent_id || '')) {
    parts.push(`Agente: ${original.agent_id || '—'} → ${next.agent_id || '—'}`)
  }
  if (original.title_es !== next.title_es) parts.push('Título')
  if ((original.images?.length ?? 0) !== (next.images?.length ?? 0)) parts.push('Fotos')
  return parts.length ? parts.join(' · ') : 'Editada'
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
