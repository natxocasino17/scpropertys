import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, ImageOff, Download, Loader2, ChevronUp, ChevronDown, Paperclip } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Spinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/property/StatusBadge'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  adminFetchProperties,
  deleteProperty,
  importDemoProperties,
  setPropertyPositions,
  logActivity,
  fetchNoteSummaries,
  type NoteSummary,
} from '../../lib/propertiesService'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, pickLang } from '../../lib/format'
import type { Property } from '../../types/property'

export default function AdminDashboardPage() {
  const { t, lang } = useLanguage()
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  /** Notas privadas por propiedad, para marcarlas en la lista. */
  const [noteSummaries, setNoteSummaries] = useState<Record<string, NoteSummary>>({})

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= properties.length) return
    const next = [...properties]
    ;[next[index], next[target]] = [next[target], next[index]]
    setProperties(next) // optimistic
    setSavingOrder(true)
    try {
      await setPropertyPositions(next.map((p) => p.id))
    } catch (e) {
      alert((e as Error).message)
      load()
    } finally {
      setSavingOrder(false)
    }
  }

  async function handleImportDemo() {
    setImporting(true)
    try {
      await importDemoProperties()
      await load()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setImporting(false)
    }
  }

  async function load() {
    setLoading(true)
    try {
      setProperties(await adminFetchProperties())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    fetchNoteSummaries().then(setNoteSummaries)
  }, [])

  async function handleDelete(p: Property) {
    if (!window.confirm(t.admin.confirmDelete)) return
    setDeleting(p.id)
    try {
      await deleteProperty(p.id)
      setProperties((prev) => prev.filter((x) => x.id !== p.id))
      await logActivity({
        action: 'delete',
        entity_title: pickLang(lang, p.title_es, p.title_en) || p.slug,
        detail: null,
        actor_email: user?.email ?? null,
      })
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-cream">{t.admin.properties}</h1>
          <p className="mt-1 text-sm text-mist">
            {properties.length} {properties.length === 1 ? t.portfolio.resultsOne : t.portfolio.resultsMany}
          </p>
        </div>
        <Link to="/admin/properties/new" className="btn-gold">
          <Plus size={16} /> {t.admin.newProperty}
        </Link>
      </div>

      {properties.length > 1 && (
        <p className="mt-4 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-xs leading-relaxed text-mist">
          {t.admin.reorderHint}
        </p>
      )}

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center">
            <p className="text-mist">{t.admin.noProps}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-faint">{t.admin.importDemoDesc}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/admin/properties/new" className="btn-gold">
                <Plus size={16} /> {t.admin.newProperty}
              </Link>
              <button onClick={handleImportDemo} disabled={importing} className="btn-ghost disabled:opacity-60">
                {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {importing ? t.admin.importing : t.admin.importDemo}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((p, index) => {
              const title = pickLang(lang, p.title_es, p.title_en)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-800 p-3 transition-colors hover:border-white/20 sm:gap-4"
                >
                  {/* Reorder controls */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || savingOrder}
                      title="Subir"
                      className="grid h-7 w-7 place-items-center rounded-md text-cream/60 hover:bg-white/5 hover:text-gold disabled:opacity-25"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <span className="text-[10px] text-faint">{index + 1}</span>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === properties.length - 1 || savingOrder}
                      title="Bajar"
                      className="grid h-7 w-7 place-items-center rounded-md text-cream/60 hover:bg-white/5 hover:text-gold disabled:opacity-25"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-700">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-faint">
                        <ImageOff size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-lg text-cream">{title}</h3>
                      {noteSummaries[p.id] && (
                        <Link
                          to={`/admin/properties/${p.id}`}
                          title={`${noteSummaries[p.id].notes} nota(s) privada(s)${
                            noteSummaries[p.id].files
                              ? ` · ${noteSummaries[p.id].files} archivo(s)`
                              : ''
                          }`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] text-gold transition-colors hover:bg-gold/20"
                        >
                          🔒 {noteSummaries[p.id].notes}
                          {noteSummaries[p.id].files > 0 && (
                            <>
                              <Paperclip size={11} />
                              {noteSummaries[p.id].files}
                            </>
                          )}
                        </Link>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-mist">
                      <span>{p.zone}</span>
                      <span>·</span>
                      <span>{t.types[p.type]}</span>
                      <span>·</span>
                      <span className="text-gold">{p.price > 0 ? formatPrice(p.price) : '—'}</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} className="hidden sm:inline-flex" />
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/properties/${p.id}`}
                      className="grid h-10 w-10 place-items-center rounded-lg text-cream/70 transition-colors hover:bg-white/5 hover:text-gold"
                    >
                      <Pencil size={17} />
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                      className="grid h-10 w-10 place-items-center rounded-lg text-cream/70 transition-colors hover:bg-white/5 hover:text-rose-300 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
