import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { classNames } from '../../lib/format'

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  )
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [active, close, next, prev])

  if (!images.length) return null

  return (
    <>
      {/* Editorial mosaic */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2">
        {images.slice(0, 5).map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={classNames(
              'group relative overflow-hidden rounded-xl bg-ink-700',
              i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square',
            )}
          >
            <img
              src={src}
              alt={`${title} ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-[1.4s] ease-luxe group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
            {i === 4 && images.length > 5 && (
              <div className="absolute inset-0 grid place-items-center bg-ink/60 font-display text-2xl text-cream backdrop-blur-sm">
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 backdrop-blur-md"
            onClick={close}
          >
            <button
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold"
              onClick={close}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold md:left-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    prev()
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 text-cream transition-colors hover:border-gold hover:text-gold md:right-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    next()
                  }}
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <motion.img
              key={active}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              src={images[active]}
              alt={`${title} ${active + 1}`}
              className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-mist">
              {active + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
