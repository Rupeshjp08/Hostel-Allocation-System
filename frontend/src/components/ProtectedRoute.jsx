import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
          <p className="text-sm tracking-wide text-slate-400">Authenticating session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to authorized home dashboard based on role
    const fallbackPath = user.role === 'warden' ? '/warden/dashboard' : '/student/dashboard'
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
