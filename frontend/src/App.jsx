import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider, AuthContext } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ApplyHostel from './pages/student/ApplyHostel'
import MyApplication from './pages/student/MyApplication'
import MyRoom from './pages/student/MyRoom'
import StudentDashboard from './pages/student/StudentDashboard'
import AllocationManagement from './pages/warden/AllocationManagement'
import ApplicationReview from './pages/warden/ApplicationReview'
import HostelManagement from './pages/warden/HostelManagement'
import RoomManagement from './pages/warden/RoomManagement'
import WardenDashboard from './pages/warden/WardenDashboard'
import { useContext } from 'react'

function RootRedirect() {
  const { user, isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return user.role === 'warden' ? (
    <Navigate to="/warden/dashboard" replace />
  ) : (
    <Navigate to="/student/dashboard" replace />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes inside Main Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/apply" element={<ApplyHostel />} />
              <Route path="/student/application" element={<MyApplication />} />
              <Route path="/student/room" element={<MyRoom />} />
            </Route>

            {/* Warden Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
              <Route path="/warden/dashboard" element={<WardenDashboard />} />
              <Route path="/warden/hostels" element={<HostelManagement />} />
              <Route path="/warden/rooms" element={<RoomManagement />} />
              <Route path="/warden/applications" element={<ApplicationReview />} />
              <Route path="/warden/allocations" element={<AllocationManagement />} />
            </Route>
          </Route>

          {/* Root Redirect Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
