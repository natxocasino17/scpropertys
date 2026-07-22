/* ════════════════════════════════════════════════════════════════
   SITE CONFIG  ·  Small Property's Real State
   ----------------------------------------------------------------
   👉  CAMBIA AQUÍ EL NOMBRE, CONTACTO Y REDES CUANDO QUIERAS.
       Todo el sitio (web pública + admin) lee desde este archivo.
   ════════════════════════════════════════════════════════════════ */

export const siteConfig = {
  /** Nombre de la marca. Cámbialo cuando definas el nombre real. */
  brand: "Small Property's",
  brandSuffix: 'Real State',

  /**
   * 👉 Dominio final de la web (para SEO: enlaces canónicos, sitemap, redes).
   * Déjalo VACÍO y usará el dominio actual automáticamente, o pon el tuyo:
   * ej. 'https://www.tudominio.com'  (sin barra al final)
   */
  siteUrl: 'https://puertoviejo-properties.com',
  /** Frase corta bajo el logo / en metadatos */
  tagline: {
    es: 'Propiedades exclusivas en el Caribe Sur de Costa Rica',
    en: 'Exclusive properties in the South Caribbean of Costa Rica',
  },

  /** Datos de contacto */
  contact: {
    // Número de WhatsApp en formato internacional SIN "+" ni espacios.
    // Ejemplo Costa Rica: 50688887777
    whatsapp: '50600000000',
    phoneDisplay: '+506 0000 0000',
    email: 'info@smallpropertys.com',
    // Ubicación de la oficina (texto libre)
    location: {
      es: 'Puerto Viejo de Talamanca, Limón, Costa Rica',
      en: 'Puerto Viejo de Talamanca, Limón, Costa Rica',
    },
  },

  /** Redes sociales (deja en "" para ocultar el ícono) */
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    tiktok: '',
    youtube: '',
  },

  /** Coordenadas para el mapa de la oficina / región (Caribe Sur) */
  region: {
    center: { lat: 9.6553, lng: -82.7541 }, // Puerto Viejo de Talamanca
    zoom: 12,
  },

  /** Moneda */
  currency: {
    code: 'USD',
    symbol: '$',
  },
} as const

export type SiteConfig = typeof siteConfig
