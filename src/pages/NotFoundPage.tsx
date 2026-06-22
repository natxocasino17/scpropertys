import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <PublicLayout>
      <div className="container-luxe flex min-h-[70vh] flex-col items-center justify-center pt-32 text-center">
        <span className="font-display text-8xl text-gilt">404</span>
        <p className="mt-4 text-mist">{t.detail.notFoundDesc}</p>
        <Link to="/" className="btn-gold mt-8">
          {t.nav.home}
        </Link>
      </div>
    </PublicLayout>
  )
}
