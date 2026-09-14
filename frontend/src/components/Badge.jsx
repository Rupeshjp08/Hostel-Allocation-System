export default function Badge({ status, children, variant, className = '' }) {
  const text = children || status || 'Default'
  const normalized = (status || '').toLowerCase()

  const variantStyles = {
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    student: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    warden: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  }

  const style =
    variantStyles[variant] ||
    variantStyles[normalized] ||
    'bg-slate-500/15 text-slate-300 border-slate-500/30'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${style} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </span>
  )
}
