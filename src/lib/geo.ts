/**
 * Coordenadas: parseo seguro y extracción desde enlaces de Google Maps.
 *
 * Por qué existe esto: los campos de latitud/longitud eran <input type="number">.
 * En configuración regional española el navegador toma el PUNTO como separador
 * de miles, así que "-82.8020075916093" se guardó como -828020075916093. Leaflet
 * intentó proyectar esa coordenada, pidió una cantidad absurda de tiles y tumbó
 * el navegador con "Out of Memory".
 *
 * Ahora los campos son de texto y pasan por aquí: se aceptan punto y coma como
 * separador decimal, y nada sale de este módulo sin estar dentro de rango.
 */

export interface LatLng {
  lat: number
  lng: number
}

export function isValidLat(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90
}

export function isValidLng(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180
}

/** Único sitio donde se decide si un par de coordenadas es dibujable. */
export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return isValidLat(lat) && isValidLng(lng)
}

/**
 * Convierte lo que se escriba en un campo a número.
 * Acepta "9.65", "9,65" y espacios sueltos. Devuelve null si no es un número.
 */
export function parseCoordinate(input: string): number | null {
  const clean = input.trim().replace(/\s+/g, '')
  if (!clean) return null
  // Una sola coma y ningún punto → coma decimal a la española.
  const normalized = clean.includes('.') ? clean : clean.replace(',', '.')
  if (!/^[+-]?\d*\.?\d+$/.test(normalized)) return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/** Los enlaces cortos redirigen y no llevan las coordenadas dentro. */
export function isShortMapsLink(input: string): boolean {
  return /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(input)
}

/**
 * Saca lat/lng de un enlace de Google Maps o de un par pegado a mano.
 * Devuelve null si el enlace es corto o no trae coordenadas.
 */
export function parseMapsInput(input: string): LatLng | null {
  const text = input.trim()
  if (!text) return null

  const pairs: Array<[number, number]> = []
  const push = (lat: string, lng: string) => {
    const a = parseCoordinate(lat)
    const b = parseCoordinate(lng)
    if (a !== null && b !== null) pairs.push([a, b])
  }

  // !3d<lat>!4d<lng> — el par exacto del sitio, el más fiable cuando está.
  const bang = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/)
  if (bang) push(bang[1], bang[2])

  // ?q=<lat>,<lng> / ?query=... / ?ll=... / ?destination=...
  const query = text.match(
    /[?&](?:q|query|ll|sll|center|destination)=(-?\d+(?:\.\d+)?)%2C(-?\d+(?:\.\d+)?)/i,
  ) ?? text.match(/[?&](?:q|query|ll|sll|center|destination)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)
  if (query) push(query[1], query[2])

  // /@<lat>,<lng>,<zoom>z — el centro del mapa, no siempre el pin.
  const at = text.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (at) push(at[1], at[2])

  // Un par pegado a mano: "9.6553, -82.7541" (o con comas decimales).
  if (!/https?:\/\//i.test(text)) {
    const manual = text.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[;,]\s*(-?\d+(?:[.,]\d+)?)\s*$/)
    if (manual) push(manual[1], manual[2])
  }

  for (const [lat, lng] of pairs) {
    if (isValidLatLng(lat, lng)) return { lat, lng }
  }
  return null
}

/** Redondea a ~1 cm de precisión: más decimales no aportan nada. */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1e7) / 1e7
}
