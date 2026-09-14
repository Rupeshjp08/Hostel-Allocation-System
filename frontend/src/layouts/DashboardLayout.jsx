import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative min-h-screen bg-navy-950 text-slate-100 antialiased">
      {/* Dynamic Background Radial Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_30%)]" />

      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
