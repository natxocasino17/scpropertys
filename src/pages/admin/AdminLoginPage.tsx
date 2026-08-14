import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { LogoStacked } from '../../components/ui/Logo'
import { NotConfigured } from './NotConfigured'
import { useNoIndex } from '../../lib/seo'

export default function AdminLoginPage() {
  const { signIn, configured } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  useNoIndex()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!configured) return <NotConfigured />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(t.admin.invalidCreds)
    } else {
      navigate('/admin')
    }
  }

  const field =
    'w-full rounded-xl border border-white/15 bg-ink-800 py-3 pl-11 pr-4 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none'

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[40vh] w-[60vw] -translate-x-1/2 rounded-full bg-gold/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <LogoStacked width={230} />
        </div>

        <div className="glass rounded-3xl p-8">
          <h1 className="font-display text-3xl text-cream">{t.admin.login}</h1>
          <p className="mt-2 text-sm text-mist">{t.admin.loginSubtitle}</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="email"
                required
                placeholder={t.admin.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="password"
                required
                placeholder={t.admin.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? t.admin.signingIn : t.admin.signIn}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
