import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bed,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
} from 'lucide-react'
import { getStudentDashboard } from '../../services/dashboardService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const response = await getStudentDashboard()
        setData(response.data.data)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) {
    return <LoadingSpinner label="Fetching your dashboard status..." fullScreen />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-300">
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-brand-blue/10 via-brand-violet/10 to-transparent p-8 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Student Portal Active
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Welcome back, {data?.welcomeName || 'Student'}!
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl">
              Track your hostel room application status, view available rooms, and manage your stay allocations.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link to="/student/apply">
              <Button variant="primary">
                <FileText className="h-4 w-4" />
                Apply for Room
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Application Status"
          value={data?.applicationStatus || 'Not Submitted'}
          description="Current state of your hostel request"
          icon={Clock}
          color={
            data?.applicationStatus === 'Approved'
              ? 'green'
              : data?.applicationStatus === 'Pending'
              ? 'amber'
              : data?.applicationStatus === 'Rejected'
              ? 'red'
              : 'blue'
          }
        />

        <StatCard
          title="Allocation Status"
          value={data?.allocationStatus || 'Not Allocated'}
          description="Room assignment state"
          icon={Bed}
          color={data?.allocationStatus === 'Allocated' ? 'purple' : 'amber'}
        />

        <StatCard
          title="Preferred Type"
          value={data?.preferredRoomType || 'N/A'}
          description="Your requested occupancy"
          icon={Building}
          color="blue"
        />

        <StatCard
          title="Available Rooms"
          value={data?.availableRoomCount ?? 0}
          description="Active rooms with open beds"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Notifications Card */}
        <Card title="System Notifications" subtitle="Real-time updates regarding your request" className="lg:col-span-2">
          {data?.notifications && data.notifications.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.notifications.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-navy-900/60 p-4 transition hover:border-white/10"
                >
                  <Bell className="mt-0.5 h-5 w-5 text-brand-blue shrink-0" />
                  <div>
                    <p className="text-sm text-slate-200">{note}</p>
                    <span className="text-[11px] text-slate-500">Updated recently</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No active notifications.</p>
          )}
        </Card>

        {/* Quick Actions & Links */}
        <Card title="Quick Actions" subtitle="Shortcuts to portal tools">
          <div className="flex flex-col gap-3">
            <Link to="/student/apply">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <div>
                    <p className="text-sm font-semibold text-white">Apply for Hostel</p>
                    <p className="text-xs text-slate-400">Submit a new request</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/student/application">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">My Application</p>
                    <p className="text-xs text-slate-400">View status & remarks</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/student/room">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Bed className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">My Room Details</p>
                    <p className="text-xs text-slate-400">View hostel & roommates</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
