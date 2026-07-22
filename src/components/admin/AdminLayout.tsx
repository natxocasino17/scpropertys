import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Inbox, LogOut, ExternalLink, Settings, History } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { classNames } from '../../lib/format'
import { useNoIndex } from '../../lib/seo'

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  useNoIndex()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login')
  }

  const nav = [
    { to: '/admin', label: t.admin.properties, Icon: LayoutDashboard, end: true },
    { to: '/admin/leads', label: t.admin.leads, Icon: Inbox, end: false },
    { to: '/admin/history', label: t.admin.history, Icon: History, end: false },
    { to: '/admin/settings', label: t.admin.settings, Icon: Settings, end: false },
  ]

  return (
    <div className="min-h-screen bg-ink lg:flex">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-800 lg:flex">
        <div className="border-b border-white/10 p-6">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-cream/70 hover:bg-white/5 hover:text-cream',
                )
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
          >
            <ExternalLink size={18} strokeWidth={1.5} /> {t.nav.home}
          </a>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-rose-300"
          >
            <LogOut size={18} strokeWidth={1.5} /> {t.admin.signOut}
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="flex items-center justify-between border-b border-white/10 bg-ink-800 p-4 lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <NavLink to="/admin" end className="rounded-lg p-2 text-cream/70">
            <LayoutDashboard size={20} />
          </NavLink>
          <NavLink to="/admin/leads" className="rounded-lg p-2 text-cream/70">
            <Inbox size={20} />
          </NavLink>
          <NavLink to="/admin/history" className="rounded-lg p-2 text-cream/70">
            <History size={20} />
          </NavLink>
          <NavLink to="/admin/settings" className="rounded-lg p-2 text-cream/70">
            <Settings size={20} />
          </NavLink>
          <button onClick={handleSignOut} className="rounded-lg p-2 text-cream/70">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-12">
          {user && (
            <p className="mb-1 text-xs text-faint">{user.email}</p>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
