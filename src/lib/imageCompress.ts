/**
 * WhatsApp ignores link-preview images heavier than ~600 KB, so the cover photo
 * has to stay under that or the property shares with no thumbnail. A single
 * quality pass isn't enough: jungle and foliage shots are dense in detail and
 * came out at 600 KB – 1.7 MB even resized to 1920px.
 */
const TARGET_BYTES = 480_000

/**
 * Compress & resize an image entirely in the browser BEFORE uploading.
 * - Converts iPhone HEIC/HEIF photos to JPEG (browsers can't display HEIC).
 * - Resizes and re-encodes so an 8 MB phone photo becomes ~200-400 KB,
 *   keeping Supabase Storage usage tiny.
 * - Keeps re-encoding until it fits TARGET_BYTES, so link previews always work.
 */
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number; maxBytes?: number } = {},
): Promise<File> {
  const maxSize = opts.maxSize ?? 1920
  const quality = opts.quality ?? 0.82
  const maxBytes = opts.maxBytes ?? TARGET_BYTES

  const isHeic =
    /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)

  // GIF/SVG: leave untouched (animation / vector).
  if (!isHeic && (file.type === 'image/gif' || file.type === 'image/svg+xml')) {
    return file
  }
  if (!isHeic && !file.type.startsWith('image/')) {
    return file
  }

  let working: Blob = file
  try {
    // Step 1: iPhone HEIC/HEIF → JPEG (needs a decoder browsers lack natively).
    if (isHeic) {
      const heic2any = (await import('heic2any')).default as (opts: {
        blob: Blob
        toType?: string
        quality?: number
      }) => Promise<Blob | Blob[]>
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
      working = Array.isArray(converted) ? converted[0] : converted
    }

    // Step 2: resize + re-encode via canvas.
    const bitmap = await createImageBitmap(working)
    let { width, height } = bitmap
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }

    const draw = async (w: number, h: number, q: number): Promise<Blob | null> => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      ctx.drawImage(bitmap, 0, 0, w, h)
      return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', q))
    }

    let blob = await draw(width, height, quality)
    if (!blob) {
      bitmap.close?.()
      return heicFallback(working, file, isHeic)
    }

    // Still too heavy for a link preview: lower the quality, then the size.
    for (const step of [
      { scale: 1, quality: 0.7 },
      { scale: 1, quality: 0.6 },
      { scale: 0.8, quality: 0.6 },
      { scale: 0.65, quality: 0.55 },
    ]) {
      if (blob.size <= maxBytes) break
      const retry = await draw(
        Math.round(width * step.scale),
        Math.round(height * step.scale),
        step.quality,
      )
      if (retry && retry.size < blob.size) blob = retry
    }
    bitmap.close?.()
    // If canvas output isn't smaller (and we didn't need HEIC conversion), keep original.
    if (!isHeic && blob.size >= file.size) return file

    const name = renameToJpg(file.name)
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return heicFallback(working, file, isHeic)
  }
}

function renameToJpg(name: string): string {
  return name.replace(/\.(png|webp|heic|heif|bmp|tiff?)$/i, '.jpg')
}

/** If canvas step failed but we already converted HEIC→JPEG, still return the JPEG. */
function heicFallback(working: Blob, original: File, isHeic: boolean): File {
  if (isHeic && working !== original) {
    return new File([working], renameToJpg(original.name), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  }
  return original
}
