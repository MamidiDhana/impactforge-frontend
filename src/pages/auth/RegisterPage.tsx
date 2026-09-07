import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { useAuth } from '../../context/AuthContext'

const roles = [
  { label: 'Citizen', value: 'citizen' },
  { label: 'Government Validator', value: 'government' },
  { label: 'University / HEI', value: 'hei' },
  { label: 'Faculty', value: 'faculty' },
  { label: 'Industry or MSME Partner', value: 'partner' },
  { label: 'Research Partner', value: 'partner' },
  { label: 'CSR Partner', value: 'partner' },
  { label: 'Platform Administrator', value: 'admin' },
]

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    role: z.enum(['citizen', 'government', 'hei', 'faculty', 'partner', 'admin']),
    organization: z.string().optional(),
    phone: z.string().optional(),
    terms: z.boolean().refine((value) => value, 'You must accept the terms and conditions'),
  })
  .superRefine((values, context) => {
    if (values.role !== 'citizen' && !values.organization?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['organization'],
        message: 'Organization is required for this role',
      })
    }
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'citizen', terms: false },
  })

  const selectedRole = useWatch({ control, name: 'role', defaultValue: 'citizen' })

  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        role: values.role,
        organization: values.organization,
        phone: values.phone,
      })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch {
      setSubmitError('We could not complete the mock registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Join a network built for practical impact.">
      <div>
        <h2 className="font-[Manrope] text-2xl font-bold text-[#13243b]">Create your account</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Choose how you will contribute to the ImpactForge ecosystem.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FormField
          label="Full name"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />
        <SelectField
          label="I am joining as"
          options={roles}
          {...register('role')}
          error={errors.role?.message}
          required
        />
        <FormField
          label="Organization name"
          placeholder={selectedRole === 'citizen' ? 'Optional for citizens' : 'Enter your organization'}
          {...register('organization')}
          error={errors.organization?.message}
          required={selectedRole !== 'citizen'}
        />
        <FormField
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="Optional"
          {...register('phone')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
            required
          />
          <FormField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            required
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            {...register('terms')}
            className="mt-0.5 size-4 rounded border-slate-300 accent-[#12365a]"
          />
          <span>I agree to the terms and conditions.</span>
        </label>
        {errors.terms && (
          <p className="text-xs text-red-600" role="alert">
            {errors.terms.message}
          </p>
        )}

        {submitError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#12365a] px-4 py-3 text-sm font-bold text-white hover:bg-[#0e2b48] disabled:opacity-70"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-[#187e8d]">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}