import { useState, useRef } from 'react'
import { Upload, Link2, X, Star, Loader2, GripVertical } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext'
import { uploadImage } from '../../lib/propertiesService'
import { isSupabaseConfigured } from '../../lib/supabase'
import { compressImage } from '../../lib/imageCompress'

interface ImageManagerProps {
  images: string[]
  onChange: (images: string[]) => void
}

export function ImageManager({ images, onChange }: ImageManagerProps) {
  const { t } = useLanguage()
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const dragIndex = useRef<number | null>(null)

  function addUrl() {
    const trimmed = url.trim()
    if (!trimmed) return
    onChange([...images, trimmed])
    setUrl('')
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    setError('')
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const optimized = await compressImage(file)
        const publicUrl = await uploadImage(optimized)
        uploaded.push(publicUrl)
      }
      onChange([...images, ...uploaded])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i))
  }

  function setCover(i: number) {
    if (i === 0) return
    const next = [...images]
    const [item] = next.splice(i, 1)
    next.unshift(item)
    onChange(next)
  }

  function onDrop(i: number) {
    const from = dragIndex.current
    if (from === null || from === i) return
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(i, 0, item)
    onChange(next)
    dragIndex.current = null
  }

  return (
    <div>
      {/* Add row */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Link2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
            placeholder={t.admin.imgUrlPlaceholder}
            className="w-full rounded-xl border border-white/15 bg-ink-800 py-2.5 pl-9 pr-3 text-sm text-cream placeholder:text-faint focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="rounded-xl border border-white/15 bg-ink-700 px-4 py-2.5 text-sm text-cream transition-colors hover:border-gold hover:text-gold"
        >
          {t.admin.addUrl}
        </button>
        {isSupabaseConfigured && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-gold transition-colors hover:bg-gold/20 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? t.admin.uploading : t.admin.uploadImg}
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

      {/* Grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={src + i}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-ink-700"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/50" />

              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium text-ink">
                  <Star size={10} /> {t.admin.cover}
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 ? (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    title={t.admin.setCover}
                    className="grid h-7 w-7 place-items-center rounded-md bg-ink/80 text-cream hover:text-gold"
                  >
                    <Star size={13} />
                  </button>
                ) : (
                  <span />
                )}
                <GripVertical size={14} className="cursor-grab text-cream/60" />
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title={t.admin.remove}
                  className="grid h-7 w-7 place-items-center rounded-md bg-ink/80 text-cream hover:text-rose-300"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
