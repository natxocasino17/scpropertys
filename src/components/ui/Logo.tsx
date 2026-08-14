import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { LogoMark } from './LogoMark'

interface LogoProps {
  className?: string
  onClick?: () => void
}

/** La marca (tejado + ola) sobre el nombre compuesto en dos líneas. */
export function Logo({ className = '', onClick }: LogoProps) {
  const { settings } = useSettings()
  return (
    <Link to="/" onClick={onClick} className={`group inline-flex items-center gap-3 ${className}`}>
      {/* El trazo se engorda un poco: al tamaño de la cabecera, el grosor
          original del dibujo quedaría demasiado fino. */}
      <LogoMark
        strokeWidth={30}
        className="h-[18px] w-16 shrink-0 text-gold transition-colors duration-500 group-hover:text-gold-light"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-wide text-cream">
          {settings.brand}
        </span>
        <span className="text-[9px] uppercase tracking-luxe text-gold/80">
          {settings.brandSuffix}
        </span>
      </span>
    </Link>
  )
}
