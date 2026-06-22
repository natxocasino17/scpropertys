import { useLanguage } from '../../i18n/LanguageContext'
import type { PropertyStatus } from '../../types/property'
import { classNames } from '../../lib/format'

const styles: Record<PropertyStatus, string> = {
  available: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10',
  reserved: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
  sold: 'border-rose-400/40 text-rose-300 bg-rose-400/10',
}

export function StatusBadge({ status, className = '' }: { status: PropertyStatus; className?: string }) {
  const { t } = useLanguage()
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-wide backdrop-blur-md',
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t.status[status]}
    </span>
  )
}
