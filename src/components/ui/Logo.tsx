import { Link } from 'react-router-dom'
import { siteConfig } from '../../config/siteConfig'

interface LogoProps {
  className?: string
  onClick?: () => void
}

/** Elegant typographic logotype with a minimalist gold monogram. */
export function Logo({ className = '', onClick }: LogoProps) {
  return (
    <Link to="/" onClick={onClick} className={`group inline-flex items-center gap-3 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 18V9l7-5 7 5v9h-4.5v-5h-5v5z"
            stroke="#C8A45D"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-gold-light" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-wide text-cream">
          {siteConfig.brand}
        </span>
        <span className="text-[9px] uppercase tracking-luxe text-gold/80">
          {siteConfig.brandSuffix}
        </span>
      </span>
    </Link>
  )
}
