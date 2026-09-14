import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Badge from './Badge'
import Button from './Button'

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-navy-950/80 px-4 backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-blue to-brand-violet font-bold text-white shadow-lg shadow-brand-blue/20">
            H
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white md:text-base">
              Hostel Allocation
            </span>
            <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
              Management Portal
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold text-white">{user.name}</p>
              <p className="text-[10px] text-slate-400">{user.email}</p>
            </div>
            <Badge variant={user.role === 'warden' ? 'warden' : 'student'}>
              {user.role === 'warden' ? 'Warden' : 'Student'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
