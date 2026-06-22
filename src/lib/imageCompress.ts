/**
 * Compress & resize an image entirely in the browser BEFORE uploading.
 * This keeps Supabase Storage usage tiny (e.g. an 8 MB phone photo becomes
 * ~200-400 KB), so the free 1 GB plan lasts for thousands of photos.
 */
export async function compressImage(
  file: File,
  opts: { maxSize?: number; quality?: number } = {},
): Promise<File> {
  const maxSize = opts.maxSize ?? 1920
  const quality = opts.quality ?? 0.82

  // Skip non-images and tiny files / unsupported formats (e.g. SVG, GIF).
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
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
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close?.()

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    )
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.(png|webp|heic|heif|bmp|tiff?)$/i, '.jpg')
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}
