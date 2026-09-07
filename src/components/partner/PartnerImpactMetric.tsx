import type { LucideIcon } from 'lucide-react'

interface PartnerImpactMetricProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  trend?: string
  color?: 'teal' | 'emerald' | 'blue' | 'purple' | 'amber'
}

export function PartnerImpactMetric({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'teal',
}: PartnerImpactMetricProps) {
  const colorMap = {
    teal: 'bg-teal-50 text-[#187e8d] border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`grid size-10 place-items-center rounded-lg border ${colorMap[color]}`}>
          <Icon size={20} />
        </span>
        {trend && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-[Manrope] text-2xl font-extrabold text-[#13243b]">{value}</p>
        {subtext && <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>}
      </div>
    </div>
  )
}
