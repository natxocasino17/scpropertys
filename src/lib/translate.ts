/**
 * Traducción automática español → inglés para el panel.
 *
 * Usa MyMemory, que es gratis y no pide clave ni registro, así que funciona
 * llamándolo directo desde el navegador del panel (no depende de que haya
 * funciones desplegadas en el servidor).
 *
 * La pega: cada petición admite como mucho ~500 BYTES, y una descripción de
 * propiedad es bastante más larga. Por eso el texto se parte en trozos por
 * párrafos y frases, se traduce cada uno y se vuelve a unir respetando los
 * saltos de línea originales.
 *
 * Si algún día se quiere mejor calidad (DeepL, Google), solo hay que cambiar
 * `translateChunk`: el troceado y el resto siguen igual.
 */

const ENDPOINT = 'https://api.mymemory.translated.net/get'
/** El límite real es 500 bytes; se deja aire para los acentos. */
const MAX_BYTES = 450
const encoder = new TextEncoder()

export function byteLength(text: string): number {
  return encoder.encode(text).length
}

/**
 * Separadores por los que se intenta cortar, de más natural a más brusco.
 * TODOS capturan (paréntesis) para que el separador siga siendo parte del
 * resultado: unir los trozos tiene que devolver el texto original tal cual.
 */
const SEPARATORS: RegExp[] = [
  /(\n{2,})/, // párrafos
  /(?<=[.!?])(\s+)/, // frases
  /(?<=,)(\s+)/, // comas
  /(\s+)/, // palabras
]

/** Último recurso: una "palabra" más larga que el límite se parte por caracteres. */
function hardSlice(word: string, maxBytes: number): string[] {
  const out: string[] = []
  let current = ''
  for (const char of word) {
    if (byteLength(current + char) > maxBytes && current) {
      out.push(current)
      current = char
    } else {
      current += char
    }
  }
  if (current) out.push(current)
  return out
}

/**
 * Parte el texto en trozos que quepan en una petición, cortando por párrafos,
 * luego frases, comas y palabras. Unir los trozos devuelve el texto original.
 */
export function splitForTranslation(text: string, maxBytes = MAX_BYTES): string[] {
  const chunks: string[] = []

  const pushSplit = (piece: string, separators: RegExp[]) => {
    if (!piece) return
    if (byteLength(piece) <= maxBytes) {
      chunks.push(piece)
      return
    }
    const [head, ...rest] = separators
    if (!head) {
      for (const slice of hardSlice(piece, maxBytes)) chunks.push(slice)
      return
    }
    const parts = piece.split(head).filter((p) => p !== '')
    let buffer = ''
    for (const part of parts) {
      const candidate = buffer + part
      if (byteLength(candidate) > maxBytes && buffer) {
        pushSplit(buffer, rest)
        buffer = part
      } else {
        buffer = candidate
      }
    }
    if (buffer) pushSplit(buffer, rest)
  }

  pushSplit(text, SEPARATORS)
  return chunks
}

async function translateChunk(chunk: string, langpair: string, signal?: AbortSignal): Promise<string> {
  const url = `${ENDPOINT}?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent(langpair)}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`El traductor respondió ${res.status}`)
  const data = await res.json()
  // MyMemory devuelve 200 dentro del cuerpo aunque el HTTP sea 200: hay que mirarlo.
  const status = Number(data?.responseStatus)
  const out = data?.responseData?.translatedText
  if (status !== 200 || typeof out !== 'string' || !out) {
    const detail = typeof data?.responseDetails === 'string' ? data.responseDetails : ''
    throw new Error(detail || 'El traductor no devolvió texto')
  }
  // Cuando se pasa la cuota diaria contesta con un aviso en mayúsculas, no con la traducción.
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|TRANSLATION LIMIT/i.test(out)) {
    throw new Error('Se agotó la cuota diaria del traductor. Probá de nuevo mañana.')
  }
  return out
}

/** Traduce un texto completo. Devuelve '' si la entrada está vacía. */
export async function translateText(
  text: string,
  opts: { from?: string; to?: string; signal?: AbortSignal } = {},
): Promise<string> {
  const clean = text.trim()
  if (!clean) return ''
  const langpair = `${opts.from ?? 'es'}|${opts.to ?? 'en'}`

  const chunks = splitForTranslation(clean)
  const out: string[] = []
  for (const chunk of chunks) {
    // Los separadores sueltos (saltos de línea) no se mandan a traducir.
    if (!/\p{L}|\p{N}/u.test(chunk)) {
      out.push(chunk)
      continue
    }
    // Se respeta el espaciado de los bordes, que el traductor se come.
    const leading = chunk.match(/^\s*/)?.[0] ?? ''
    const trailing = chunk.match(/\s*$/)?.[0] ?? ''
    const translated = await translateChunk(chunk.trim(), langpair, opts.signal)
    out.push(leading + translated + trailing)
  }
  return out.join('')
}
