import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { AuthLayout } from '../../layouts/AuthLayout'
import { FormField } from '../../components/forms/FormField'
const schema = z.object({ email: z.string().email('Enter a valid email address') })
type Values = z.infer<typeof schema>
export function ForgotPasswordPage() { const [sent, setSent] = useState(false); const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) }); return <AuthLayout title="A clearer path back to your work."><h2 className="font-[Manrope] text-2xl font-bold text-[#13243b]">Forgot your password?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your email and we will show a mock recovery confirmation.</p>{sent ? <div role="status" className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><CheckCircle2 className="mb-2 text-emerald-600" size={22} /><strong>Recovery request received.</strong><br />This is a frontend-only preview. No email was sent.</div> : <form onSubmit={handleSubmit(() => setSent(true))} className="mt-7 space-y-4" noValidate><FormField label="Email address" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} required /><button type="submit" className="w-full rounded-lg bg-[#12365a] px-4 py-3 text-sm font-bold text-white hover:bg-[#0e2b48]">Send recovery link</button></form>}<Link to="/login" className="mt-6 block text-center text-sm font-semibold text-[#187e8d]">Back to login</Link></AuthLayout> }