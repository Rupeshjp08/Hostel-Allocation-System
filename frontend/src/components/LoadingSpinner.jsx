import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}
