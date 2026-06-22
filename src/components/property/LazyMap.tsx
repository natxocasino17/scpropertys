import { lazy, Suspense } from 'react'

const PropertyMap = lazy(() =>
  import('./PropertyMap').then((m) => ({ default: m.PropertyMap })),
)

interface LazyMapProps {
  lat: number
  lng: number
  label?: string
  zoom?: number
  className?: string
}

/** Loads Leaflet only when a map is actually rendered (keeps it out of the main bundle). */
export function LazyMap(props: LazyMapProps) {
  return (
    <Suspense
      fallback={
        <div
          className={`grid place-items-center rounded-2xl border border-white/10 bg-ink-800 ${props.className ?? ''}`}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        </div>
      }
    >
      <PropertyMap {...props} />
    </Suspense>
  )
}
