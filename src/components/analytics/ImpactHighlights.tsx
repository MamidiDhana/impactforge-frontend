import { MapPin, Tag, AlertTriangle, CheckCircle2, Compass, Sparkles } from 'lucide-react'
import type { ImpactHighlightsData } from '../../utils/analyticsUtils'

interface ImpactHighlightsProps {
  highlights: ImpactHighlightsData
  totalReports: number
}

export function ImpactHighlights({ highlights, totalReports }: ImpactHighlightsProps) {
  if (totalReports === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Sparkles size={24} className="mx-auto text-slate-300" />
        <h4 className="mt-2 font-[Manrope] text-sm font-bold text-slate-700">
          No Impact Highlights Available
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          Highlights will automatically populate once reports match the current filter selection.
        </p>
      </div>
    )
  }

  const highlightItems = [
    {
      label: 'Most Affected District',
      value: highlights.mostAffectedDistrict,
      detail:
        highlights.mostAffectedDistrictCount > 0
          ? `${highlights.mostAffectedDistrictCount} recorded problem${highlights.mostAffectedDistrictCount > 1 ? 's' : ''}`
          : 'None recorded',
      icon: MapPin,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
    {
      label: 'Most Reported Category',
      value: highlights.mostReportedCategory,
      detail:
        highlights.mostReportedCategoryCount > 0
          ? `${highlights.mostReportedCategoryCount} submission${highlights.mostReportedCategoryCount > 1 ? 's' : ''}`
          : 'None recorded',
      icon: Tag,
      color: 'text-[#187e8d]',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      label: 'Prioritized (High/Critical)',
      value: `${highlights.highUrgencyTotal} Reports`,
      detail: 'Urgent community needs',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Verified Resolved',
      value: `${highlights.resolvedProblemsCount} Problems`,
      detail: 'Completed & audited',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Active Problem Areas',
      value: `${highlights.activeProblemAreasCount} Sectors`,
      detail: 'Unique district-category zones',
      icon: Compass,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
            <Sparkles size={16} />
          </span>
          <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
            Civic Impact Highlights
          </h3>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Live Extracted Patterns
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {highlightItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className={`flex flex-col justify-between rounded-xl border ${item.border} ${item.bg} p-4 transition hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {item.label}
                </span>
                <span className={`grid size-7 place-items-center rounded-lg bg-white ${item.color} shadow-xs`}>
                  <Icon size={15} />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-[Manrope] text-lg font-bold text-[#13243b] truncate">
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-600 truncate">{item.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
