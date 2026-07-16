/**
 * Compress & resize an image entirely in the browser BEFORE uploading.
 * - Converts iPhone HEIC/HEIF photos to JPEG (browsers can't display HEIC).
 * - Resizes and re-encodes so an 8 MB phone photo becomes ~200-400 KB,
 *   keeping Supabase Storage usage tiny.
 */
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number } = {},
): Promise<File> {
  const maxSize = opts.maxSize ?? 1920
  const quality = opts.quality ?? 0.82

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

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return heicFallback(working, file, isHeic)
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob) return heicFallback(working, file, isHeic)
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
