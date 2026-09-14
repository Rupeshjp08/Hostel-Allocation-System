import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Edit2, Plus, Trash2 } from 'lucide-react'
import { createHostel, deleteHostel, getHostels, updateHostel } from '../../services/hostelService'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import Card from '../../components/Card'
import EmptyState from '../../components/EmptyState'
import Input from '../../components/Input'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import Select from '../../components/Select'

const hostelSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  type: z.enum(['Boys', 'Girls', 'Co-ed'], {
    errorMap: () => ({ message: 'Please select a hostel type' }),
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

export default function HostelManagement() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHostel, setEditingHostel] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hostelSchema),
    defaultValues: {
      type: 'Boys',
      isActive: true,
    },
  })

  const fetchHostels = async () => {
    try {
      setLoading(true)
      const res = await getHostels()
      setHostels(res.data.data?.hostels || [])
    } catch (err) {
      setServerError(err.message || 'Failed to fetch hostels list.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHostels()
  }, [])

  const handleOpenAddModal = () => {
    setEditingHostel(null)
    reset({
      name: '',
      code: '',
      type: 'Boys',
      description: '',
      isActive: true,
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (hostel) => {
    setEditingHostel(hostel)
    reset({
      name: hostel.name,
      code: hostel.code,
      type: hostel.type,
      description: hostel.description || '',
      isActive: hostel.isActive,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      if (editingHostel) {
        await updateHostel(editingHostel._id, data)
      } else {
        await createHostel(data)
      }
      setModalOpen(false)
      await fetchHostels()
    } catch (err) {
      setServerError(err.message || 'Failed to save hostel.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel? All associated rooms will be affected.')) return

    try {
      await deleteHostel(id)
      await fetchHostels()
    } catch (err) {
      alert(err.message || 'Failed to delete hostel')
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading hostel buildings list..." fullScreen />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Hostel Management</h1>
          <p className="text-xs text-slate-400">Configure hostel blocks and gender rules</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add New Hostel
        </Button>
      </div>

      {serverError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          {serverError}
        </div>
      )}

      {hostels.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No Hostels Found"
            description="Create your first hostel building to get started."
            action={
              <Button variant="primary" onClick={handleOpenAddModal}>
                Add Hostel
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-navy-900/80 uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Code</th>
                <th className="px-6 py-4 font-semibold">Hostel Name</th>
                <th className="px-6 py-4 font-semibold">Gender Type</th>
                <th className="px-6 py-4 font-semibold">Total Rooms</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {hostels.map((h) => (
                <tr key={h._id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 font-mono font-bold text-brand-blue">{h.code}</td>
                  <td className="px-6 py-4 font-semibold text-white">{h.name}</td>
                  <td className="px-6 py-4">{h.type} Hostel</td>
                  <td className="px-6 py-4">{h.totalRooms ?? 0} Rooms</td>
                  <td className="px-6 py-4">
                    <Badge status={h.isActive ? 'active' : 'inactive'}>
                      {h.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(h)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(h._id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHostel ? 'Edit Hostel Building' : 'Add New Hostel Building'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Hostel Name"
            placeholder="e.g. Kaveri Block A"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Hostel Code / Building ID"
            placeholder="e.g. KAV-A"
            error={errors.code?.message}
            {...register('code')}
          />

          <Select
            label="Hostel Gender Type"
            options={[
              { value: 'Boys', label: 'Boys Hostel' },
              { value: 'Girls', label: 'Girls Hostel' },
              { value: 'Co-ed', label: 'Co-ed Hostel' },
            ]}
            error={errors.type?.message}
            {...register('type')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="desc" className="text-xs font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              id="desc"
              rows={2}
              placeholder="Building amenities or location details..."
              className="w-full rounded-xl border border-white/10 bg-navy-900/80 p-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('description')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-slate-700 bg-navy-900 text-brand-blue focus:ring-brand-blue"
              {...register('isActive')}
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-300">
              Active for Room Allocation
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingHostel ? 'Update Hostel' : 'Create Hostel'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
