export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  hover = false,
  ...props
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 ${
        hover ? 'hover:-translate-y-1 hover:border-white/20 hover:shadow-glass' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            {title && <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
