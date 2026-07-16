import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import {
  SiteSettings,
  fetchSettings,
  setActiveSettings,
  loadCachedSettings,
  cacheSettings,
} from '../lib/settings'

interface SettingsContextValue {
  settings: SiteSettings
  loading: boolean
  reload: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Start from the locally cached settings so the correct hero image / brand
  // paint immediately on load (no flash of the default before the real one).
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = loadCachedSettings()
    setActiveSettings(cached)
    return cached
  })
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const s = await fetchSettings()
    setSettings(s)
    setActiveSettings(s)
    cacheSettings(s)
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  return (
    <SettingsContext.Provider value={{ settings, loading, reload }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
