import { useEffect, useState } from 'react'
import { Bed, Building2, Calendar, DollarSign, Layers, Users } from 'lucide-react'
import { getMyAllocation } from '../../services/allocationService'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function MyRoom() {
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        setLoading(true)
        const res = await getMyAllocation()
        setAllocation(res.data.data?.allocation || null)
      } catch (err) {
        // If 404 or no allocation found
        setAllocation(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAllocation()
  }, [])

  if (loading) {
    return <LoadingSpinner label="Fetching your room allocation details..." fullScreen />
  }

  if (!allocation) {
    return (
      <Card>
        <EmptyState
          icon={Bed}
          title="No Active Room Allocation"
          description="You currently do not have an active hostel room allocation. Submit an application or wait for warden assignment."
        />
      </Card>
    )
  }

  const room = allocation.room || {}
  const hostel = room.hostel || {}

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">My Room Details</h1>
        <p className="text-xs text-slate-400">View details of your assigned hostel room</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Room Card */}
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                {hostel.name || 'Hostel Building'}
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Room {room.roomNumber || 'N/A'}
              </h2>
            </div>
            <Badge status={allocation.status}>{allocation.status}</Badge>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Building2 className="h-4 w-4 text-brand-blue" />
                <span>Hostel</span>
              </div>
              <p className="mt-1 font-semibold text-white">{hostel.name || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Floor Level</span>
              </div>
              <p className="mt-1 font-semibold text-white">Floor {room.floor ?? 1}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Bed className="h-4 w-4 text-emerald-400" />
                <span>Room Type</span>
              </div>
              <p className="mt-1 font-semibold text-white">{room.roomType || 'N/A'}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users className="h-4 w-4 text-amber-400" />
                <span>Capacity</span>
              </div>
              <p className="mt-1 font-semibold text-white">{room.capacity || 1} Person(s)</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span>Monthly Fee</span>
              </div>
              <p className="mt-1 font-semibold text-white">₹{room.monthlyFee || 0}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-navy-900/60 p-3.5">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Allocated On</span>
              </div>
              <p className="mt-1 font-semibold text-white">
                {new Date(allocation.allocatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Room Information & Guidelines */}
        <Card title="Room Rules & Info">
          <ul className="flex flex-col gap-3 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
              <span>Maintain cleanliness and report maintenance issues promptly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
              <span>Hostel gate closes at 10:00 PM every evening.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue" />
              <span>Guests are not allowed inside student rooms past visiting hours.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
