import { useState } from 'react'
import { Eye, EyeOff, LogIn, BarChart3 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { FormField } from '../../components/forms/FormField'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'
import { ROLE_DASHBOARD_PATH } from '../../routes/rolePaths'

const loginSchema = z.object({ email: z.string().email('Enter a valid email address'), password: z.string().min(1, 'Password is required'), rememberMe: z.boolean().optional() })
type LoginValues = z.infer<typeof loginSchema>
const demoRoles: { role: UserRole; label: string }[] = [
  { role: 'citizen', label: 'Citizen / Student' },
  { role: 'government', label: 'Government Validator' },
  { role: 'hei', label: 'University / HEI Admin' },
  { role: 'partner', label: 'Industry Partnerships' },
  { role: 'admin', label: 'Super Admin' },
]

const demoEmails: Record<UserRole, string> = {
  citizen: 'asha.rao@jharkhand.in',
  government: 'vikram.singh@jharkhand.gov.in',
  hei: 'dean.rnd@bitmesra.ac.in',
  faculty: 'prof.menon@tiss.edu',
  partner: 'partner@impactforge.org',
  admin: 'admin@impactforge.org',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<UserRole>('citizen')
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@impactforge.example', password: 'demo-password' },
  })

  const handleSelectDemoRole = (selectedRole: UserRole) => {
    setRole(selectedRole)
    if (demoEmails[selectedRole]) {
      setValue('email', demoEmails[selectedRole])
    }
  }

  const onSubmit = async (values: LoginValues) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await login({ ...values, role })
      const from = (location.state as { from?: string } | null)?.from
      const rolePrefix = `/${role}`
      const destination = from?.startsWith(rolePrefix) ? from : ROLE_DASHBOARD_PATH[role]
      navigate(destination, { replace: true })
    } catch {
      setSubmitError('We could not start the mock session. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDirectAnalyticsLogin = async () => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await login({
        email: demoEmails['government'],
        password: 'demo-password',
        role: 'government',
      })
      navigate('/analytics/dashboard', { replace: true })
    } catch {
      setSubmitError('Unable to start analytics demo session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="font-[Manrope] text-2xl font-bold text-[#13243b]">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to continue your impact work.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-[#187e8d] hover:text-[#12365a]">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-11 text-sm outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 ${
                errors.password ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" {...register('rememberMe')} className="size-4 rounded border-slate-300 accent-[#12365a]" />
          Remember me
        </label>
        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#12365a] px-4 py-3 text-sm font-bold text-white hover:bg-[#0e2b48] disabled:cursor-wait disabled:opacity-70"
        >
          <LogIn size={17} />
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <div className="mt-7 border-t border-slate-200 pt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Demo login</p>
        <p className="mt-1 text-xs text-slate-500">Choose a role to preview its protected route.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {demoRoles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => handleSelectDemoRole(item.role)}
              className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                role === item.role
                  ? 'border-[#187e8d] bg-[#e8f5f5] text-[#12365a]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200">
          <button
            type="button"
            onClick={handleDirectAnalyticsLogin}
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-teal-200 bg-[#e8f5f5] px-3 py-2 text-xs font-bold text-[#12365a] hover:bg-teal-100 transition shadow-xs disabled:opacity-60"
          >
            <BarChart3 size={15} className="text-[#187e8d]" />
            <span>Preview Analytics & Impact Dashboard</span>
          </button>
        </div>
      </div>
      <p className="mt-7 text-center text-sm text-slate-500">
        New to ImpactForge?{' '}
        <Link to="/register" className="font-bold text-[#187e8d] hover:text-[#12365a]">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}