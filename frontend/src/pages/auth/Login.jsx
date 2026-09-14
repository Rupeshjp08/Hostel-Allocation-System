import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Mail, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import Input from '../../components/Input'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setServerError('')
    setSubmitting(true)
    try {
      const user = await login(data)
      if (user?.role === 'warden') {
        navigate('/warden/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-navy-950 px-4 py-12 text-slate-100">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.16),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-navy-900/80 p-8 shadow-glass backdrop-blur-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-violet text-xl font-bold text-white shadow-lg shadow-brand-blue/30">
            H
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access your Hostel Allocation Dashboard
          </p>
        </div>

        {serverError && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@college.edu or warden@hostel.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={submitting} className="mt-2 w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          New student?{' '}
          <Link to="/register" className="font-semibold text-brand-blue hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
