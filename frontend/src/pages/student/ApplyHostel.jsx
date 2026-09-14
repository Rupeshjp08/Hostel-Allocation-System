import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, CheckCircle2, ShieldAlert } from 'lucide-react'
import { createApplication } from '../../services/applicationService'
import { getHostels } from '../../services/hostelService'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import Select from '../../components/Select'

const applicationSchema = z.object({
  preferredHostel: z.string().min(1, 'Please select a hostel'),
  preferredRoomType: z.enum(['Single', 'Double', 'Triple', 'Quad'], {
    errorMap: () => ({ message: 'Please select a room type' }),
  }),
  remarks: z.string().optional(),
})

export default function ApplyHostel() {
  const navigate = useNavigate()
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      preferredRoomType: 'Double',
    },
  })

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true)
        const res = await getHostels()
        const activeOnly = (res.data.data?.hostels || []).filter((h) => h.isActive)
        setHostels(activeOnly)
      } catch (err) {
        setServerError('Failed to fetch available hostels.')
      } finally {
        setLoading(false)
      }
    }
    fetchHostels()
  }, [])

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      await createApplication(data)
      navigate('/student/application')
    } catch (err) {
      setServerError(err.message || 'Failed to submit application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading active hostels..." fullScreen />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card
        title="Hostel Room Application"
        subtitle="Select your preferred hostel and room configuration for the upcoming term"
      >
        {serverError && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        {hostels.length === 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs text-amber-300">
            No active hostels are currently available for allocation. Please contact the warden office.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Select
              label="Preferred Hostel"
              options={hostels.map((h) => ({
                value: h._id,
                label: `${h.name} (${h.type} Hostel) - ${h.code}`,
              }))}
              placeholder="Choose a hostel..."
              error={errors.preferredHostel?.message}
              {...register('preferredHostel')}
            />

            <Select
              label="Preferred Room Occupancy Type"
              options={[
                { value: 'Single', label: 'Single Occupancy (1 Bed)' },
                { value: 'Double', label: 'Double Occupancy (2 Beds)' },
                { value: 'Triple', label: 'Triple Occupancy (3 Beds)' },
                { value: 'Quad', label: 'Quad Occupancy (4 Beds)' },
              ]}
              error={errors.preferredRoomType?.message}
              {...register('preferredRoomType')}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="remarks" className="text-xs font-medium text-slate-300">
                Additional Notes / Medical Needs (Optional)
              </label>
              <textarea
                id="remarks"
                rows={3}
                placeholder="Mention any specific requests or medical conditions..."
                className="w-full rounded-xl border border-white/10 bg-navy-900/80 p-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                {...register('remarks')}
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
              <p className="font-semibold text-white">Application Note:</p>
              <p className="mt-1">
                Room allocations are processed based on hostel availability and warden approval. You can track your application status anytime under "My Application".
              </p>
            </div>

            <Button type="submit" loading={submitting} className="mt-2 w-full">
              <CheckCircle2 className="h-4 w-4" />
              Submit Application
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
