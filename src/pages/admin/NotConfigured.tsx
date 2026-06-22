import { Link } from 'react-router-dom'
import { Database, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'

export function NotConfigured() {
  const { t } = useLanguage()
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/30 text-gold">
          <Database size={28} strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 font-display text-3xl text-cream">{t.admin.notConfigured}</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">{t.admin.notConfiguredDesc}</p>
        <div className="mt-6 rounded-xl border border-white/10 bg-ink-800 p-4 text-left text-xs text-mist">
          <code className="block">VITE_SUPABASE_URL=...</code>
          <code className="block">VITE_SUPABASE_ANON_KEY=...</code>
          <code className="block">VITE_DB_PREFIX=sc_</code>
        </div>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light"
        >
          <ArrowLeft size={16} /> {t.nav.home}
        </Link>
      </div>
    </div>
  )
}
