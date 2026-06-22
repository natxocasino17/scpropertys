import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import {
  SiteSettings,
  defaultSettings,
  fetchSettings,
  setActiveSettings,
} from '../lib/settings'

interface SettingsContextValue {
  settings: SiteSettings
  loading: boolean
  reload: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const s = await fetchSettings()
    setSettings(s)
    setActiveSettings(s)
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
