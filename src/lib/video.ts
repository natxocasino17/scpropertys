export type ParsedVideo = { kind: 'iframe' | 'file'; src: string }

/**
 * Turn a user-provided video reference into something playable.
 * Supports YouTube (watch / youtu.be / shorts / live / embed), Vimeo,
 * and direct video files (.mp4/.webm/.ogg/.mov/.m4v — e.g. Supabase Storage).
 */
export function parseVideo(url?: string | null): ParsedVideo | null {
  if (!url) return null
  const u = url.trim()
  if (!u) return null

  // YouTube (all common URL shapes)
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{6,})/i,
  )
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }

  // Vimeo
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` }

  // Direct video file (Supabase Storage upload or any hosted file)
  if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(u)) return { kind: 'file', src: u }

  return null
}
