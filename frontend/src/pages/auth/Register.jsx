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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    studentId: z
      .string()
      .min(3, 'Student ID must be at least 3 characters')
      .max(20, 'Student ID must not exceed 20 characters')
      .regex(/^[A-Za-z0-9/-]{3,20}$/, 'Student ID can only contain letters, numbers, hyphens, and slashes'),
    department: z.string().min(2, 'Department is required'),
    year: z.coerce.number().min(1).max(5, 'Year must be between 1 and 5'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      errorMap: () => ({ message: 'Please select a gender' }),
    }),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Student ID"
              placeholder="2024CSE101"
              icon={UserCheck}
              error={errors.studentId?.message}
              {...register('studentId')}
            />

            <Input
              label="Department"
              placeholder="CSE / ECE / ME"
              error={errors.department?.message}
              {...register('department')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Academic Year"
              options={[
                { value: '1', label: '1st Year' },
                { value: '2', label: '2nd Year' },
                { value: '3', label: '3rd Year' },
                { value: '4', label: '4th Year' },
                { value: '5', label: '5th Year' },
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
            error={errors.phone?.message}
            {...register('phone')}
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
