import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { translations, Lang, TranslationTree } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: TranslationTree
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'sc_lang'

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'es'
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'es' || saved === 'en') return saved
  const nav = window.navigator.language?.toLowerCase() ?? 'es'
  return nav.startsWith('en') ? 'en' : 'es'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitial)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l), [])
  const toggle = useCallback(() => setLangState((p) => (p === 'es' ? 'en' : 'es')), [])

  const value: LanguageContextValue = {
    lang,
    setLang,
    toggle,
    t: translations[lang],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
