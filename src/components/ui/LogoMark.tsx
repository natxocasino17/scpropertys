/**
 * Marca de Puerto Viejo Properties: una sola línea continua que empieza como el
 * tejado de una casa y termina como una ola del Caribe.
 *
 * Está redibujada en vectorial a partir del original, midiendo el trazo columna
 * a columna, para que salga nítida a cualquier tamaño. Todo lo que muestra el
 * logo —cabecera, pie, panel, favicon— sale de este mismo trazado.
 *
 * El color se hereda con `currentColor`, así que se pinta desde fuera.
 */

/** Coordenadas del original (caja del trazo 823x233 px). */
export const LOGO_PATH =
  'M 242 719 L 470 507 L 563 593 L 563 548 L 618 548 L 618 638 ' +
  'C 632 664 658 686 700 698 ' +
  'C 739 702 760 659 787 611 ' +
  'C 812 575 846 562 880 562 ' +
  'C 918 563 950 582 960 609 ' +
  'C 966 631 944 606 913 609 ' +
  'C 891 613 877 631 875 658 ' +
  'C 877 677 885 689 899 699 ' +
  'C 927 717 961 721 999 715 ' +
  'C 1018 712 1035 707 1048 700'

/** Caja del trazado ya contando el medio grosor de la línea. */
export const LOGO_VIEWBOX = '231 496 828 236'

/** Proporción ancho/alto del trazado, para reservarle sitio sin deformarlo. */
export const LOGO_RATIO = 828 / 236

interface LogoMarkProps {
  className?: string
  style?: React.CSSProperties
  /**
   * Grosor de la línea en las unidades del trazado (el original usa 22).
   * Conviene subirlo en tamaños pequeños para que la línea no se esfume.
   */
  strokeWidth?: number
}

export function LogoMark({ className = '', style, strokeWidth = 22 }: LogoMarkProps) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={LOGO_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
