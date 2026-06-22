import { useEffect, useState } from 'react'
import { Mail, Phone, Home, Check, Trash2, Inbox } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Spinner } from '../../components/ui/Spinner'
import { useLanguage } from '../../i18n/LanguageContext'
import { adminFetchLeads, markLeadRead, deleteLead } from '../../lib/propertiesService'
import { classNames } from '../../lib/format'
import type { Lead } from '../../types/property'

export default function AdminLeadsPage() {
  const { t } = useLanguage()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      setLeads(await adminFetchLeads())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRead(lead: Lead) {
    if (!lead.id) return
    await markLeadRead(lead.id)
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, read: true } : l)))
  }

  async function handleDelete(lead: Lead) {
    if (!lead.id) return
    await deleteLead(lead.id)
    setLeads((prev) => prev.filter((l) => l.id !== lead.id))
  }

  function fmtDate(d?: string) {
    if (!d) return ''
    return new Date(d).toLocaleString()
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-4xl text-cream">{t.admin.leads}</h1>
      <p className="mt-1 text-sm text-mist">{leads.length}</p>

      <div className="mt-8">
        {loading ? (
          <Spinner />
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-20 text-center">
            <Inbox size={28} className="mx-auto text-faint" />
            <p className="mt-3 text-mist">{t.admin.noLeads}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={classNames(
                  'rounded-2xl border bg-ink-800 p-5 transition-colors',
                  lead.read ? 'border-white/10' : 'border-gold/30',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {!lead.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                      <h3 className="font-display text-xl text-cream">{lead.name}</h3>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-mist">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-gold">
                        <Mail size={13} /> {lead.email}
                      </a>
                      {lead.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} /> {lead.phone}
                        </span>
                      )}
                      {lead.property_title && (
                        <span className="flex items-center gap-1.5 text-gold">
                          <Home size={13} /> {lead.property_title}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!lead.read && (
                      <button
                        onClick={() => handleRead(lead)}
                        title={t.admin.markRead}
                        className="grid h-9 w-9 place-items-center rounded-lg text-cream/70 hover:bg-white/5 hover:text-emerald-300"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(lead)}
                      className="grid h-9 w-9 place-items-center rounded-lg text-cream/70 hover:bg-white/5 hover:text-rose-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cream/85">
                  {lead.message}
                </p>
                <p className="mt-3 text-[11px] text-faint">{fmtDate(lead.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
