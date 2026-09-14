import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import { createApplication } from '../../services/applicationService'
import { getHostels } from '../../services/hostelService'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import Select from '../../components/Select'

import { useAuth } from '../../hooks/useAuth'

const applicationSchema = z.object({
  preferredHostel: z.string().min(1, 'Please select a hostel'),
  preferredRoomType: z.enum(
    ['Single Sharing', 'Double Sharing', 'Triple Sharing', 'Four Sharing'],
    {
      errorMap: () => ({ message: 'Please select a room type' }),
    }
  ),
  reason: z.string().trim().min(1, 'Application reason is required'),
  preferences: z.string().optional(),
})

export default function ApplyHostel() {
  const { user } = useAuth()
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
      preferredRoomType: 'Double Sharing',
      reason: '',
      preferences: '',
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

  const eligibleHostels = hostels.filter((h) => {
    if (!user?.gender) return true // no gender set — show all and let backend validate
    if (h.type === 'Boys' && user.gender !== 'Male') return false
    if (h.type === 'Girls' && user.gender !== 'Female') return false
    if (h.type !== 'Co-ed' && user.gender === 'Other') return false
    return true
  })

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      await createApplication({
        preferredHostel: data.preferredHostel,
        preferredRoomType: data.preferredRoomType,
        reason: data.reason.trim(),
        preferences: data.preferences?.trim() || '',
      })
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

        {eligibleHostels.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="text-sm font-semibold text-amber-300">
              No eligible hostels available for your gender ({user?.gender || 'N/A'})
            </p>
            <p className="mt-2 text-xs text-amber-400/80">
              {user?.gender === 'Other'
                ? 'Students with gender set to \'Other\' are eligible for Co-ed hostels only. Please contact the Warden office to check Co-ed availability.'
                : 'There are currently no active hostels matching your gender eligibility. Please contact the Warden office for assistance.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Select
              label="Preferred Hostel"
              options={eligibleHostels.map((h) => {
                const typeStr = h.type ? `${h.type} Hostel` : ''
                const locationStr =
                  h.location && h.location !== 'undefined' && h.location !== 'null'
                    ? h.location
                    : ''
                const capacityStr =
                  h.totalCapacity !== undefined && h.totalCapacity !== null
                    ? `${h.totalCapacity} beds`
                    : ''

                const infoParts = [typeStr, locationStr, capacityStr].filter(Boolean).join(' • ')
                const label = infoParts ? `${h.name} (${infoParts})` : h.name
                return {
                  value: h._id,
                  label,
                }
              })}
              placeholder="Choose a hostel..."
              error={errors.preferredHostel?.message}
              {...register('preferredHostel')}
            />

            <Select
              label="Preferred Room Occupancy Type"
              options={[
                { value: 'Single Sharing', label: 'Single Sharing (1 Bed)' },
                { value: 'Double Sharing', label: 'Double Sharing (2 Beds)' },
                { value: 'Triple Sharing', label: 'Triple Sharing (3 Beds)' },
                { value: 'Four Sharing', label: 'Four Sharing (4 Beds)' },
              ]}
              error={errors.preferredRoomType?.message}
              {...register('preferredRoomType')}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="reason" className="text-xs font-medium text-slate-300">
                Application Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="reason"
                rows={3}
                placeholder="Explain why you need hostel accommodation..."
                className={`w-full rounded-xl border border-white/10 bg-navy-900/80 p-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue ${
                  errors.reason ? 'border-red-500/60 focus:border-red-500' : ''
                }`}
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-xs text-red-400">{errors.reason.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="preferences" className="text-xs font-medium text-slate-300">
                Additional Notes / Special Preferences (Optional)
              </label>
              <textarea
                id="preferences"
                rows={2}
                placeholder="Mention any roommate preferences, medical needs, or special conditions..."
                className="w-full rounded-xl border border-white/10 bg-navy-900/80 p-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                {...register('preferences')}
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
