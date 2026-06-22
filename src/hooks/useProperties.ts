import { useState, useEffect } from 'react'
import { fetchProperties } from '../lib/propertiesService'
import type { Property } from '../types/property'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchProperties()
      .then((res) => {
        if (!active) return
        setProperties(res.properties)
        setIsDemo(res.isDemo)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { properties, isDemo, loading }
}
