import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy-950 disabled:opacity-50 disabled:pointer-events-cursor-not-allowed rounded-xl'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  const variants = {
    primary:
      'bg-gradient-to-r from-brand-blue to-brand-violet text-white hover:opacity-90 shadow-lg shadow-brand-blue/25 border border-white/10',
    secondary:
      'bg-white/10 text-slate-100 hover:bg-white/15 border border-white/10 backdrop-blur-md',
    danger:
      'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30',
    outline:
      'border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white bg-transparent',
    ghost:
      'text-slate-400 hover:text-white hover:bg-white/5',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
      {children}
    </button>
  )
}
