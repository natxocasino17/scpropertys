import { useLanguage } from '../../i18n/LanguageContext'
import { classNames } from '../../lib/format'

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage()
  return (
    <div
      className={classNames(
        'inline-flex items-center rounded-full border border-white/15 p-0.5 text-xs',
        className,
      )}
    >
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={classNames(
            'rounded-full px-2.5 py-1 uppercase tracking-wide transition-all duration-300',
            lang === l ? 'bg-gold text-ink' : 'text-cream/60 hover:text-cream',
          )}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
