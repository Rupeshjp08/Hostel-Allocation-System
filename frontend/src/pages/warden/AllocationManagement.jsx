import { useEffect, useState } from 'react'
import { CheckSquare, Plus, UserCheck, XCircle } from 'lucide-react'
import { cancelAllocation, createAllocation, getAllocations } from '../../services/allocationService'
import { getApplications } from '../../services/applicationService'
import { getRoomById, getRooms } from '../../services/roomService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

export default function AllocationManagement() {
  const [allocations, setAllocations] = useState([])
  const [approvedApplications, setApprovedApplications] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [availableBeds, setAvailableBeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [selectedBedNumber, setSelectedBedNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchAllocationsData = async () => {
    try {
      setLoading(true)
      const res = await getAllocations()
      setAllocations(res.data.data?.allocations || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch allocations list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllocationsData()
  }, [])

  useEffect(() => {
    if (!selectedRoomId) {
      setAvailableBeds([])
      setSelectedBedNumber('')
      return
    }

    const fetchRoomBeds = async () => {
      try {
        const res = await getRoomById(selectedRoomId)
        const beds = res.data.data?.room?.availableBedNumbers || []
        setAvailableBeds(beds)
        if (beds.length > 0) {
          setSelectedBedNumber(String(beds[0]))
        } else {
          setSelectedBedNumber('')
        }
      } catch (err) {
        setAvailableBeds([])
        setSelectedBedNumber('')
      }
    }

    fetchRoomBeds()
  }, [selectedRoomId])

  const handleOpenAllocationModal = async () => {
    try {
      setSelectedAppId('')
      setSelectedRoomId('')
      setSelectedBedNumber('')
      setAvailableBeds([])

      const [appRes, roomRes, allocationRes] = await Promise.all([
        getApplications({ status: 'Approved' }),
        getRooms({ status: 'Active' }),
        getAllocations({ status: 'Active' }),
      ])

      const activeAllocations = allocationRes.data.data?.allocations || []
      const allocatedStudentIds = new Set(
        activeAllocations.map((a) => a.student?._id || a.student)
      )

      const unallocatedApps = (appRes.data.data?.applications || []).filter(
        (app) => !allocatedStudentIds.has(app.student?._id || app.student)
      )
      const openRooms = (roomRes.data.data?.rooms || []).filter(
        (r) => (r.availableBeds ?? r.capacity) > 0
      )

      setApprovedApplications(unallocatedApps)
      setAvailableRooms(openRooms)
      setModalOpen(true)
    } catch (err) {
      alert(err.message || 'Failed to load options for allocation')
    }
  }

  const handleCreateAllocation = async (e) => {
    e.preventDefault()
    if (!selectedAppId || !selectedRoomId || !selectedBedNumber) {
      alert('Please select a student application, an available room, and a bed number.')
      return
    }

    const appObj = approvedApplications.find((a) => a._id === selectedAppId)
    if (!appObj) return

    setSubmitting(true)
    try {
      await createAllocation({
        student: appObj.student._id || appObj.student,
        room: selectedRoomId,
        application: selectedAppId,
        bedNumber: Number(selectedBedNumber),
      })

      setModalOpen(false)
      await fetchAllocationsData()
    } catch (err) {
      alert(err.message || 'Failed to allocate room.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelAllocation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this allocation? The bed will be freed up.')) return

    try {
      await cancelAllocation(id)
      await fetchAllocationsData()
    } catch (err) {
      alert(err.message || 'Failed to cancel allocation.')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading active allocations list..." fullScreen />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Room Allocations</h1>
          <p className="text-xs text-slate-400">View active student room assignments and allocate rooms</p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenAllocationModal}>
          <Plus className="h-4 w-4" />
          Assign Room to Student
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {allocations.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckSquare}
            title="No Active Allocations"
            description="There are currently no active room allocations."
            action={
              <Button variant="primary" onClick={handleOpenAllocationModal}>
                Assign First Room
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-navy-900/80 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Roll Number</th>
                <th className="px-6 py-4 font-semibold">Hostel Block</th>
                <th className="px-6 py-4 font-semibold">Room No.</th>
                <th className="px-6 py-4 font-semibold">Bed No.</th>
                <th className="px-6 py-4 font-semibold">Floor</th>
                <th className="px-6 py-4 font-semibold">Allocated On</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {allocations.map((alloc) => {
                const student = alloc.student || {}
                const room = alloc.room || {}
                const hostel = room.hostel || {}

                return (
                  <tr key={alloc._id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 font-semibold text-white">{student.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-blue">
                      {student.studentId || student.rollNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{hostel.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      Room {room.roomNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      Bed #{alloc.bedNumber || 1}
                    </td>
                    <td className="px-6 py-4">Floor {room.floor ?? 1}</td>
                    <td className="px-6 py-4">
                      {new Date(alloc.allocationDate || alloc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={alloc.status}>{alloc.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {alloc.status === 'Active' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelAllocation(alloc._id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel Allocation
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Manual Allocation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Assign Room to Student"
      >
        <form onSubmit={handleCreateAllocation} className="flex flex-col gap-4">
          <Select
            label="Approved Student Application"
            options={approvedApplications.map((app) => ({
              value: app._id,
              label: `${app.student?.name} (${app.student?.studentId || app.student?.rollNumber}) - Prefers ${app.preferredHostel?.name} (${app.preferredRoomType})`,
            }))}
            placeholder="Select an approved student..."
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
          />

          <Select
            label="Available Room"
            options={availableRooms.map((r) => ({
              value: r._id,
              label: `Room ${r.roomNumber} - ${r.hostel?.name} (${r.availableBeds} Free Beds, ${r.roomType})`,
            }))}
            placeholder="Select an available room..."
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          />

          <Select
            label="Bed Number Assignment"
            options={availableBeds.map((b) => ({
              value: String(b),
              label: `Bed #${b}`,
            }))}
            placeholder={
              !selectedRoomId
                ? 'Select a room first...'
                : availableBeds.length === 0
                ? 'No free beds in this room'
                : 'Select bed number...'
            }
            value={selectedBedNumber}
            onChange={(e) => setSelectedBedNumber(e.target.value)}
            disabled={!selectedRoomId || availableBeds.length === 0}
          />

          {approvedApplications.length === 0 && (
            <p className="text-xs text-amber-400">
              No approved applications waiting for room allocation. Review pending applications first.
            </p>
          )}

          {availableRooms.length === 0 && (
            <p className="text-xs text-amber-400">
              No active rooms with available free beds were found. Add or free up rooms first.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={approvedApplications.length === 0 || availableRooms.length === 0 || !selectedBedNumber}
            >
              <UserCheck className="h-4 w-4" />
              Complete Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
