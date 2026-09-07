import { BarChart3, CheckCircle2 } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { StatCard } from '../../components/common/StatCard'
import { SectionHeader } from '../../components/common/SectionHeader'
import { governmentAnalytics } from '../../data/governmentAnalytics'
export function GovernmentAnalyticsPage() {
  const max = Math.max(...governmentAnalytics.categories.map((item) => item.value))
  return (
    <GovernmentLayout title="Impact">
      <GovPage
        title="Impact"
        description="Review illustrative trends across problems, validation, and projects."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Impact' },
        ]}
      >
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          All values shown are illustrative demo data. They are not government statistics.
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {governmentAnalytics.indicators.map((indicator) => (
            <StatCard key={indicator.label} label={indicator.label} value={indicator.value} description="Illustrative data" icon={BarChart3} />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section>
            <SectionHeader title="Problems by category" />
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              {governmentAnalytics.categories.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#1c91a1]" style={{ width: `${(item.value / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <SectionHeader title="Problems by status" />
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
              {governmentAnalytics.statuses.map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">{item.value}</p>
                </div>
              ))}
            </div>
            <SectionHeader title="Projects by stage" />
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-5">
              {governmentAnalytics.stages.map((item) => (
                <p key={item.label} className="flex justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                </p>
              ))}
            </div>
          </section>
        </div>
        <div className="mt-8 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-5">
          <h2 className="font-[Manrope] font-bold text-[#13243b]">Impact indicators</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Validation turnaround and beneficiary reach are tracked as projects mature.
          </p>
        </div>
      </GovPage>
    </GovernmentLayout>
  )
}