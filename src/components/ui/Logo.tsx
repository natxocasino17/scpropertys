import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'
import { LogoMark, LOGO_RATIO } from './LogoMark'

/**
 * El logo de la marca en sus dos montajes.
 *
 * Las letras son texto de verdad, no una imagen: se ven nítidas a cualquier
 * tamaño y el nombre se sigue cambiando desde /admin/settings.
 *
 * Las proporciones salen de medir el logo original: el nombre ocupa el mismo
 * ancho que el dibujo, y "PROPERTIES" tiene la mitad de altura de mayúscula y
 * va bastante más espaciado.
 */

/** Espaciado entre letras de cada línea (medido sobre el original). */
const TRACK_NAME = 0.29
const TRACK_SUFFIX = 0.42

interface LogoProps {
  className?: string
  onClick?: () => void
}

/** Montaje horizontal: el dibujo y, al lado, el nombre en dos líneas. Para la cabecera. */
export function Logo({ className = '', onClick }: LogoProps) {
  const { settings } = useSettings()
  return (
    <Link to="/" onClick={onClick} className={`group inline-flex items-center gap-3 ${className}`}>
      {/* El trazo va más grueso que en el original: a este tamaño, el grosor
          del dibujo grande quedaría demasiado fino. */}
      <LogoMark
        strokeWidth={30}
        className="h-[18px] w-16 shrink-0 text-gold transition-colors duration-500 group-hover:text-gold-light"
      />
      <span className="flex flex-col leading-none">
        <span
          className="text-[13px] font-medium uppercase text-gold"
          style={{ letterSpacing: `${TRACK_NAME * 0.55}em` }}
        >
          {settings.brand}
        </span>
        <span
          className="mt-1 text-[8px] uppercase text-gold/70"
          style={{ letterSpacing: `${TRACK_SUFFIX * 0.55}em` }}
        >
          {settings.brandSuffix}
        </span>
      </span>
    </Link>
  )
}

interface LogoStackedProps {
  /** Ancho total en píxeles; todo lo demás se calcula a partir de él. */
  width?: number
  className?: string
  /** Sin enlace cuando ya se está dentro de la página que enlazaría. */
  asLink?: boolean
}

/** Montaje vertical: el dibujo con el nombre debajo. Para el acceso al panel y el pie. */
export function LogoStacked({ width = 240, className = '', asLink = true }: LogoStackedProps) {
  const { settings } = useSettings()

  const content = (
    <span className="flex flex-col items-center" style={{ width }}>
      <LogoMark
        strokeWidth={26}
        className="w-full text-gold"
        style={{ height: width / LOGO_RATIO }}
      />
      {/* El text-indent compensa el hueco que el espaciado deja tras la última
          letra, para que la línea quede centrada de verdad. */}
      {/* El factor está calibrado para que la línea ocupe el ancho del dibujo,
          como en el original. La tipografía de la web es algo más ancha que la
          del logo, así que no vale copiar su tamaño tal cual. */}
      <span
        className="whitespace-nowrap font-medium uppercase leading-none text-gold"
        style={{
          fontSize: width * 0.086,
          letterSpacing: `${TRACK_NAME}em`,
          textIndent: `${TRACK_NAME}em`,
          marginTop: width * 0.057,
        }}
      >
        {settings.brand}
      </span>
      <span
        className="whitespace-nowrap uppercase leading-none text-gold/75"
        style={{
          fontSize: width * 0.047,
          letterSpacing: `${TRACK_SUFFIX}em`,
          textIndent: `${TRACK_SUFFIX}em`,
          marginTop: width * 0.045,
        }}
      >
        {settings.brandSuffix}
      </span>
    </span>
  )

  if (!asLink) return <span className={`inline-flex ${className}`}>{content}</span>
  return (
    <Link to="/" className={`inline-flex ${className}`}>
      {content}
    </Link>
  )
}
