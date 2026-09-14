import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bed,
  BedDouble,
  Building2,
  CheckCircle,
  ClipboardList,
  Clock,
  PlusCircle,
  Users,
} from 'lucide-react'
import { getWardenDashboard } from '../../services/dashboardService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatCard from '../../components/StatCard'

export default function WardenDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const res = await getWardenDashboard()
        setData(res.data.data)
      } catch (err) {
        setError(err.message || 'Failed to load warden dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return <LoadingSpinner label="Loading warden dashboard metrics..." fullScreen />
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
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Warden Overview Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Monitor overall hostel capacity, bed occupancy, and pending student applications
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/warden/hostels">
            <Button variant="secondary" size="sm">
              <Building2 className="h-4 w-4" />
              Manage Hostels
            </Button>
          </Link>
          <Link to="/warden/applications">
            <Button variant="primary" size="sm">
              <ClipboardList className="h-4 w-4" />
              Review Applications
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Stats Matrix */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hostels"
          value={data?.totalHostels ?? 0}
          description="Registered hostel blocks"
          icon={Building2}
          color="blue"
        />

        <StatCard
          title="Total Rooms"
          value={data?.totalRooms ?? 0}
          description="Active rooms in system"
          icon={BedDouble}
          color="purple"
        />

        <StatCard
          title="Bed Capacity"
          value={`${data?.occupiedBeds ?? 0} / ${data?.totalBeds ?? 0}`}
          description={`${data?.availableBeds ?? 0} beds available`}
          icon={Bed}
          color="green"
        />

        <StatCard
          title="Pending Applications"
          value={data?.pendingApplications ?? 0}
          description="Awaiting warden review"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Secondary Operations Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Quick Management Links" subtitle="Fast navigation for administrative tasks">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link to="/warden/hostels">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-navy-900/60 p-5 transition hover:border-brand-blue/40 hover:bg-white/5">
                <div className="flex items-center justify-between">
                  <Building2 className="h-6 w-6 text-brand-blue" />
                  <PlusCircle className="h-4 w-4 text-slate-500" />
                </div>
                <h4 className="mt-2 font-semibold text-white">Hostel Management</h4>
                <p className="text-xs text-slate-400">Add or edit hostel blocks & gender types</p>
              </div>
            </Link>

            <Link to="/warden/rooms">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-navy-900/60 p-5 transition hover:border-brand-violet/40 hover:bg-white/5">
                <div className="flex items-center justify-between">
                  <BedDouble className="h-6 w-6 text-brand-violet" />
                  <PlusCircle className="h-4 w-4 text-slate-500" />
                </div>
                <h4 className="mt-2 font-semibold text-white">Room Management</h4>
                <p className="text-xs text-slate-400">Create rooms, set capacity & fees</p>
              </div>
            </Link>

            <Link to="/warden/applications">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-navy-900/60 p-5 transition hover:border-amber-500/40 hover:bg-white/5">
                <div className="flex items-center justify-between">
                  <ClipboardList className="h-6 w-6 text-amber-400" />
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300 font-semibold">
                    {data?.pendingApplications ?? 0}
                  </span>
                </div>
                <h4 className="mt-2 font-semibold text-white">Review Applications</h4>
                <p className="text-xs text-slate-400">Approve or reject student requests</p>
              </div>
            </Link>

            <Link to="/warden/allocations">
              <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-navy-900/60 p-5 transition hover:border-emerald-500/40 hover:bg-white/5">
                <div className="flex items-center justify-between">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  <Users className="h-4 w-4 text-slate-500" />
                </div>
                <h4 className="mt-2 font-semibold text-white">Room Allocations</h4>
                <p className="text-xs text-slate-400">Assign rooms to approved students</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card title="Hostel Occupancy Summary" subtitle="Current breakdown of capacity and applications">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-900/60 p-4">
              <div>
                <p className="text-xs text-slate-400">Available Beds</p>
                <p className="text-xl font-bold text-emerald-400">{data?.availableBeds ?? 0}</p>
              </div>
              <div className="h-2.5 w-32 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${
                      data?.totalBeds
                        ? Math.min(((data.availableBeds / data.totalBeds) * 100), 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/5 bg-navy-900/60 p-4">
              <div>
                <p className="text-xs text-slate-400">Approved Applications</p>
                <p className="text-xl font-bold text-brand-blue">{data?.approvedApplications ?? 0}</p>
              </div>
              <Badge status="approved">Ready for Allocation</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
