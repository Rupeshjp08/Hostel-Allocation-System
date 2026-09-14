export default function StatCard({ title, value, description, icon: Icon, color = 'blue' }) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/20',
    purple: 'from-purple-500/20 to-violet-500/10 text-purple-400 border-purple-500/20',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/20',
    green: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    red: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/20',
  }

  const activeColor = colorStyles[color] || colorStyles.blue

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-white/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br ${activeColor}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}
