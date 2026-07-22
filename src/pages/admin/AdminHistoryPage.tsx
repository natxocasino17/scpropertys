import { useEffect, useState } from 'react'
import { PlusCircle, Pencil, Trash2, History } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { fetchActivity } from '../../lib/propertiesService'
import type { ActivityLog } from '../../types/property'
import { classNames } from '../../lib/format'

const actionStyle: Record<string, { Icon: typeof Pencil; color: string; es: string; en: string }> = {
  create: { Icon: PlusCircle, color: 'text-emerald-300', es: 'Creó', en: 'Created' },
  update: { Icon: Pencil, color: 'text-gold', es: 'Editó', en: 'Edited' },
  delete: { Icon: Trash2, color: 'text-rose-300', es: 'Eliminó', en: 'Deleted' },
}

export default function AdminHistoryPage() {
  const { t, lang } = useLanguage()
  const [items, setItems] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl text-cream">{t.admin.history}</h1>
      <p className="mt-1 text-sm text-mist">{t.admin.historyHint}</p>

      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center">
            <History size={28} className="mx-auto text-faint" />
            <p className="mt-3 text-mist">{t.admin.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const style = actionStyle[it.action] ?? actionStyle.update
              const verb = lang === 'es' ? style.es : style.en
              return (
                <div
                  key={it.id}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-ink-800 p-4"
                >
                  <span className={classNames('mt-0.5', style.color)}>
                    <style.Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-cream">
                      <span className="font-medium text-cream">{it.actor_email || '—'}</span>{' '}
                      <span className="text-mist">{verb.toLowerCase()}</span>{' '}
                      <span className="text-cream">“{it.entity_title}”</span>
                    </p>
                    {it.detail && <p className="mt-0.5 text-xs text-gold/90">{it.detail}</p>}
                  </div>
                  <span className="shrink-0 text-[11px] text-faint">
                    {it.created_at ? new Date(it.created_at).toLocaleString() : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
