import { NavLink } from 'react-router-dom'
import {
  Bed,
  BedDouble,
  Building2,
  CheckSquare,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  X,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const isWarden = user?.role === 'warden'

  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: Home },
    { name: 'Apply for Hostel', path: '/student/apply', icon: FileText },
    { name: 'My Application', path: '/student/application', icon: ClipboardList },
    { name: 'My Room', path: '/student/room', icon: Bed },
  ]

  const wardenNav = [
    { name: 'Dashboard', path: '/warden/dashboard', icon: LayoutDashboard },
    { name: 'Manage Hostels', path: '/warden/hostels', icon: Building2 },
    { name: 'Manage Rooms', path: '/warden/rooms', icon: BedDouble },
    { name: 'Applications', path: '/warden/applications', icon: ClipboardList },
    { name: 'Allocations', path: '/warden/allocations', icon: CheckSquare },
  ]

  const navItems = isWarden ? wardenNav : studentNav

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 top-16 z-40 flex w-64 flex-col border-r border-white/10 bg-navy-950/95 p-4 transition-transform duration-300 backdrop-blur-2xl md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Navigation Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-blue/20 to-brand-violet/20 text-white border border-brand-blue/30 shadow-md'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs">
          <p className="font-semibold text-slate-300">Role: {isWarden ? 'Warden Portal' : 'Student Portal'}</p>
          <p className="mt-0.5 text-slate-400">System v1.0 • Phase 4</p>
        </div>
      </aside>
    </>
  )
}
