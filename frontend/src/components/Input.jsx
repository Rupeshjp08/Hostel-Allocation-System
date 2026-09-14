import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    containerClassName = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={`w-full rounded-xl border border-white/10 bg-navy-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 ${
            Icon ? 'pl-9' : ''
          } ${error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  )
})

export default Input
