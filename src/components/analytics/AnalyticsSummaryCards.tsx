import {
  FileSearch,
  Clock,
  FolderKanban,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Percent,
} from 'lucide-react'
import type { SummaryStats } from '../../utils/analyticsUtils'

interface AnalyticsSummaryCardsProps {
  stats: SummaryStats
}

export function AnalyticsSummaryCards({ stats }: AnalyticsSummaryCardsProps) {
  const cards = [
    {
      label: 'Total Reports',
      value: String(stats.total),
      subtext: 'Filtered live reports',
      icon: FileSearch,
      iconColor: 'text-[#12365a]',
      bgColor: 'bg-blue-50/70',
      borderColor: 'border-blue-100',
    },
    {
      label: 'Open Reports',
      value: String(stats.open),
      subtext: 'Awaiting triage',
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-100',
    },
    {
      label: 'In Progress',
      value: String(stats.inProgress),
      subtext: 'Under active resolution',
      icon: FolderKanban,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50/70',
      borderColor: 'border-sky-100',
    },
    {
      label: 'Resolved',
      value: String(stats.resolved),
      subtext: 'Fully verified solutions',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Rejected',
      value: String(stats.rejected),
      subtext: 'Out of scope / duplicates',
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50/70',
      borderColor: 'border-red-100',
    },
    {
      label: 'High Urgency',
      value: String(stats.highUrgency),
      subtext: 'Requires prioritized action',
      icon: AlertTriangle,
      iconColor: 'text-amber-700',
      bgColor: 'bg-amber-50/70',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Critical Urgency',
      value: String(stats.criticalUrgency),
      subtext: 'Immediate civic hazard',
      icon: Flame,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/70',
      borderColor: 'border-rose-200',
    },
    {
      label: 'Resolution Rate',
      value: `${stats.resolutionRate}%`,
      subtext: 'Resolved / Total ratio',
      icon: Percent,
      iconColor: 'text-teal-700',
      bgColor: 'bg-teal-50/70',
      borderColor: 'border-teal-200',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Calculated Civic KPIs (Live Data)
        </span>
        <span className="text-[11px] font-medium text-slate-500">
          Formula: Resolved ÷ Total × 100
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.label}
              className={`flex flex-col justify-between rounded-xl border ${c.borderColor} ${c.bgColor} p-3.5 transition hover:shadow-sm`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-xs font-semibold text-slate-600">{c.label}</span>
                <Icon size={16} className={`${c.iconColor} shrink-0`} />
              </div>
              <div className="mt-2">
                <p className="font-[Manrope] text-2xl font-extrabold text-[#13243b]">
                  {c.value}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">{c.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
