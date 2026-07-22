import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { useLanguage } from '../../i18n/LanguageContext'
import { useSettings } from '../../context/SettingsContext'
import { whatsappLink } from '../../lib/format'

export function Footer() {
  const { t, lang } = useLanguage()
  const { settings } = useSettings()
  const year = new Date().getFullYear()

  const socials = [
    { url: settings.instagram, Icon: Instagram, label: 'Instagram' },
    { url: settings.facebook, Icon: Facebook, label: 'Facebook' },
    { url: settings.youtube, Icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.url)

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-800">
      <div className="container-luxe py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
              {lang === 'es' ? settings.footerTaglineEs : settings.footerTaglineEn}
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/70 transition-all duration-300 hover:border-gold hover:text-gold"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="eyebrow mb-5">{t.footer.explore}</h4>
            <ul className="space-y-3 text-sm text-mist">
              <li>
                <Link to="/" className="transition-colors hover:text-gold">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to="/propiedades" className="transition-colors hover:text-gold">
                  {t.nav.properties}
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="transition-colors hover:text-gold">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="transition-colors hover:text-gold">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow mb-5">{t.nav.contact}</h4>
            <ul className="space-y-4 text-sm text-mist">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <span>{lang === 'es' ? settings.locationEs : settings.locationEn}</span>
              </li>
              <li>
                <a
                  href={whatsappLink(t.contact.prefillGeneric)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-gold"
                >
                  <Phone size={16} className="shrink-0 text-gold" />
                  {settings.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-3 transition-colors hover:text-gold"
                >
                  <Mail size={16} className="shrink-0 text-gold" />
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-faint sm:flex-row">
          <p>
            © {year} {settings.brand} {settings.brandSuffix}. {t.footer.rights}
          </p>
          <p className="tracking-wide">{t.footer.crafted}</p>
        </div>
      </div>
    </footer>
  )
}
