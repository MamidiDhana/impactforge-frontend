import {
  Coins,
  Cpu,
  GraduationCap,
  MapPin,
  Timer,
} from 'lucide-react'

export interface ContributionSummaryProps {
  funding?: string
  equipment?: string
  technicalHours?: number | string
  mentorshipSessions?: number | string
  fieldSupport?: string
}

export function ContributionSummary({
  funding = '₹12.4 Lakhs',
  equipment = '35 Units / Bundles',
  technicalHours = '680 Hours',
  mentorshipSessions = '42 Sessions',
  fieldSupport = '18 Field Days',
}: ContributionSummaryProps) {
  const items = [
    {
      title: 'Funding Contributed',
      value: funding,
      subtext: 'CSR grants & seed funding',
      icon: Coins,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Equipment Contributed',
      value: equipment,
      subtext: 'Sensors, micro-servers & hardware',
      icon: Cpu,
      accent: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Technical Hours',
      value: technicalHours,
      subtext: 'Architecture & code mentorship',
      icon: Timer,
      accent: 'bg-teal-50 text-teal-700 border-teal-100',
    },
    {
      title: 'Mentorship Sessions',
      value: mentorshipSessions,
      subtext: 'Student team masterclasses',
      icon: GraduationCap,
      accent: 'bg-purple-50 text-purple-700 border-purple-100',
    },
    {
      title: 'Field Support Provided',
      value: fieldSupport,
      subtext: 'Site inspections & community testing',
      icon: MapPin,
      accent: 'bg-amber-50 text-amber-700 border-amber-100',
    },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
            Contribution Summary
          </h3>
          <p className="text-xs text-slate-500">
            Cumulative organizational resources and human capital deployed across partner projects
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50"
            >
              <div className="flex items-center justify-between">
                <span className={`grid size-9 place-items-center rounded-lg border ${item.accent}`}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-500">{item.title}</p>
                <p className="mt-1 font-[Manrope] text-lg font-extrabold text-[#13243b]">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{item.subtext}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
