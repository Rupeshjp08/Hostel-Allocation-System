import { forwardRef } from 'react'

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`w-full rounded-xl border border-white/10 bg-navy-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50 ${
          error ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-navy-900 text-slate-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'object' ? opt.value : opt
          const labelText = typeof opt === 'object' ? opt.label : opt
          return (
            <option key={value} value={value} className="bg-navy-900 text-slate-100">
              {labelText}
            </option>
          )
        })}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  )
})

export default Select
