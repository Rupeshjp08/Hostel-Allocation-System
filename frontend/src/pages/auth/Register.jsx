import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, Phone, ShieldAlert, User, UserCheck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Select from '../../components/Select'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  department: z.string().min(2, 'Department is required'),
  year: z.coerce.number().min(1).max(4, 'Year must be between 1 and 4'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    errorMap: () => ({ message: 'Please select a gender' }),
  }),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
})

export default function Register() {
  const { register: registerAuth } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      year: 1,
      gender: 'Male',
    },
  })

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      await registerAuth(data)
      navigate('/student/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-navy-900/80 p-8 shadow-glass backdrop-blur-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">Student Registration</h1>
          <p className="mt-1 text-xs text-slate-400">
            Create your account to apply for hostel room allocation
          </p>
        </div>

        {serverError && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="John Doe"
              icon={User}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="john@college.edu"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Roll Number"
              placeholder="2024CSE101"
              icon={UserCheck}
              error={errors.rollNumber?.message}
              {...register('rollNumber')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Department"
              placeholder="CSE / ECE / ME"
              error={errors.department?.message}
              {...register('department')}
            />

            <Select
              label="Academic Year"
              options={[
                { value: '1', label: '1st Year' },
                { value: '2', label: '2nd Year' },
                { value: '3', label: '3rd Year' },
                { value: '4', label: '4th Year' },
              ]}
              error={errors.year?.message}
              {...register('year')}
            />

            <Select
              label="Gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              error={errors.gender?.message}
              {...register('gender')}
            />
          </div>

          <Input
            label="Contact Phone Number"
            placeholder="9876543210"
            icon={Phone}
            error={errors.contactNumber?.message}
            {...register('contactNumber')}
          />

          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Complete Registration
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-blue hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  )
}
