interface PartnerStatusBadgeProps {
  status: string
  className?: string
}

export function PartnerStatusBadge({ status, className = '' }: PartnerStatusBadgeProps) {
  const normalized = status.toLowerCase()

  let style = 'bg-slate-100 text-slate-700 border-slate-200'

  if (normalized.includes('accepted') || normalized.includes('completed') || normalized === 'available' || normalized === 'on track') {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (normalized.includes('pending') || normalized === 'offered' || normalized.includes('review needed')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200'
  } else if (normalized.includes('rejected') || normalized.includes('withdrawn')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200'
  } else if (normalized.includes('more info') || normalized.includes('information')) {
    style = 'bg-sky-50 text-sky-700 border-sky-200'
  } else if (normalized.includes('committed') || normalized === 'active') {
    style = 'bg-blue-50 text-blue-700 border-blue-200'
  } else if (normalized === 'limited') {
    style = 'bg-orange-50 text-orange-700 border-orange-200'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${style} ${className}`}
    >
      <span className="mr-1.5 size-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}
