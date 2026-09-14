import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BedDouble, Edit2, Filter, Plus, Trash2 } from 'lucide-react'
import { getHostels } from '../../services/hostelService'
import { createRoom, deleteRoom, getRooms, updateRoom } from '../../services/roomService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import Input from '../../components/Input'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const roomSchema = z.object({
  hostel: z.string().min(1, 'Hostel is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  roomType: z.enum(['Single', 'Double', 'Triple', 'Quad'], {
    errorMap: () => ({ message: 'Please select a room type' }),
  }),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  floor: z.coerce.number().min(0, 'Floor number is required'),
  monthlyFee: z.coerce.number().min(0, 'Monthly fee must be non-negative'),
  status: z.enum(['Active', 'Maintenance', 'Inactive'], {
    errorMap: () => ({ message: 'Please select a status' }),
  }),
})

export default function RoomManagement() {
  const [rooms, setRooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [selectedHostel, setSelectedHostel] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomType: 'Double',
      capacity: 2,
      floor: 1,
      monthlyFee: 5000,
      status: 'Active',
    },
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [roomsRes, hostelsRes] = await Promise.all([
        getRooms(selectedHostel ? { hostel: selectedHostel } : {}),
        getHostels(),
      ])
      setRooms(roomsRes.data.data?.rooms || [])
      setHostels(hostelsRes.data.data?.hostels || [])
    } catch (err) {
      setServerError(err.message || 'Failed to fetch rooms data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedHostel])

  const handleOpenAddModal = () => {
    setEditingRoom(null)
    reset({
      hostel: hostels[0]?._id || '',
      roomNumber: '',
      roomType: 'Double',
      capacity: 2,
      floor: 1,
      monthlyFee: 5000,
      status: 'Active',
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (room) => {
    setEditingRoom(room)
    reset({
      hostel: room.hostel?._id || room.hostel,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      floor: room.floor,
      monthlyFee: room.monthlyFee,
      status: room.status,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      if (editingRoom) {
        await updateRoom(editingRoom._id, data)
      } else {
        await createRoom(data)
      }
      setModalOpen(false)
      await fetchData()
    } catch (err) {
      setServerError(err.message || 'Failed to save room.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return

    try {
      await deleteRoom(id)
      await fetchData()
    } catch (err) {
      alert(err.message || 'Failed to delete room')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading hostel rooms inventory..." fullScreen />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Room Management</h1>
          <p className="text-xs text-slate-400">Configure rooms, capacity, and bed availability</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hostel Filter */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/80 px-3 py-1.5 text-xs text-slate-300">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="bg-transparent font-medium focus:outline-none text-white"
            >
              <option value="" className="bg-navy-900">All Hostels</option>
              {hostels.map((h) => (
                <option key={h._id} value={h._id} className="bg-navy-900">
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4" />
            Add New Room
          </Button>
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {serverError}
        </div>
      )}

      {rooms.length === 0 ? (
        <Card>
          <EmptyState
            icon={BedDouble}
            title="No Rooms Found"
            description={
              selectedHostel
                ? 'No rooms exist in the selected hostel filter.'
                : 'Create your first room to configure beds and occupancy.'
            }
            action={
              <Button variant="primary" onClick={handleOpenAddModal}>
                Add Room
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-navy-900/80 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Room No.</th>
                <th className="px-6 py-4 font-semibold">Hostel Block</th>
                <th className="px-6 py-4 font-semibold">Floor</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Occupancy</th>
                <th className="px-6 py-4 font-semibold">Available Beds</th>
                <th className="px-6 py-4 font-semibold">Monthly Fee</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {rooms.map((r) => {
                const currentOcc = r.currentOccupancy ?? 0
                const availBeds = r.availableBeds ?? Math.max(r.capacity - currentOcc, 0)

                return (
                  <tr key={r._id} className="transition hover:bg-white/5">
                    <td className="px-6 py-4 font-mono font-bold text-white">{r.roomNumber}</td>
                    <td className="px-6 py-4 text-slate-300">{r.hostel?.name || 'N/A'}</td>
                    <td className="px-6 py-4">Floor {r.floor}</td>
                    <td className="px-6 py-4">{r.roomType}</td>
                    <td className="px-6 py-4">{r.capacity} Beds</td>
                    <td className="px-6 py-4">{currentOcc} Occupied</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">
                      {availBeds} Free
                    </td>
                    <td className="px-6 py-4">₹{r.monthlyFee}</td>
                    <td className="px-6 py-4">
                      <Badge
                        status={
                          r.status === 'Active'
                            ? 'active'
                            : r.status === 'Maintenance'
                            ? 'pending'
                            : 'inactive'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(r)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(r._id)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoom ? 'Edit Room Details' : 'Add New Room'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Select
            label="Hostel Block"
            options={hostels.map((h) => ({ value: h._id, label: `${h.name} (${h.code})` }))}
            error={errors.hostel?.message}
            {...register('hostel')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Room Number"
              placeholder="e.g. 101, 204"
              error={errors.roomNumber?.message}
              {...register('roomNumber')}
            />

            <Select
              label="Room Occupancy Type"
              options={[
                { value: 'Single', label: 'Single (1 Bed)' },
                { value: 'Double', label: 'Double (2 Beds)' },
                { value: 'Triple', label: 'Triple (3 Beds)' },
                { value: 'Quad', label: 'Quad (4 Beds)' },
              ]}
              error={errors.roomType?.message}
              {...register('roomType')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Capacity (Beds)"
              type="number"
              error={errors.capacity?.message}
              {...register('capacity')}
            />

            <Input
              label="Floor Number"
              type="number"
              error={errors.floor?.message}
              {...register('floor')}
            />

            <Input
              label="Monthly Fee (₹)"
              type="number"
              error={errors.monthlyFee?.message}
              {...register('monthlyFee')}
            />
          </div>

          <Select
            label="Room Status"
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingRoom ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
