export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`grid place-items-center py-32 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
    </div>
  )
}
