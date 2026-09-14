import { FolderOpen } from 'lucide-react'

export default function EmptyState({
  title = 'No records found',
  description = 'There are currently no items to display here.',
  action,
  icon: Icon = FolderOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
        <Icon className="h-8 w-8" />
      </div>
      <h4 className="mt-4 text-base font-semibold text-white">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
