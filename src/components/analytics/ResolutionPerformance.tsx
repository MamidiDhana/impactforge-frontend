import { CheckCircle2, Clock, Info, ShieldCheck, TrendingUp } from 'lucide-react'
import type { SummaryStats } from '../../utils/analyticsUtils'

interface ResolutionPerformanceProps {
  stats: SummaryStats
}

export function ResolutionPerformance({ stats }: ResolutionPerformanceProps) {
  const pendingReports = stats.open + stats.inProgress

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Resolution Performance & Efficiency
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Civic challenge completion indicators calculated from live database state
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>{stats.resolutionRate}% Total Resolution Rate</span>
        </span>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <span className="text-xs font-semibold text-slate-500">Total Submissions</span>
          <p className="mt-1 font-[Manrope] text-2xl font-extrabold text-[#13243b]">
            {stats.total}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">In current filter view</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <span className="text-xs font-semibold text-emerald-800">Resolved Problems</span>
          <p className="mt-1 font-[Manrope] text-2xl font-extrabold text-emerald-700">
            {stats.resolved}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600">Successfully closed</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
          <span className="text-xs font-semibold text-amber-800">Pending Actions</span>
          <p className="mt-1 font-[Manrope] text-2xl font-extrabold text-amber-700">
            {pendingReports}
          </p>
          <p className="mt-0.5 text-[11px] text-amber-600">Open ({stats.open}) + In Progress ({stats.inProgress})</p>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3.5">
          <span className="text-xs font-semibold text-teal-800">Resolution Rate</span>
          <p className="mt-1 font-[Manrope] text-2xl font-extrabold text-teal-700">
            {stats.resolutionRate}%
          </p>
          <p className="mt-0.5 text-[11px] text-teal-600">Calculated live ratio</p>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <div className="flex justify-between text-xs font-medium text-slate-600">
          <span>Overall Resolution Progress</span>
          <span>
            {stats.resolved} of {stats.total} completed ({stats.resolutionRate}%)
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#187e8d] to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.resolutionRate))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-amber-500" />
            <span>Pending Work: {pendingReports}</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span>Resolved: {stats.resolved}</span>
          </span>
        </div>
      </div>

      {/* Required Exact Backend Limitation Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">Resolution Time Notice</p>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Resolution time is unavailable because resolved timestamps are not provided by the backend.
          </p>
          <p className="text-[10px] text-blue-700/80">
            The platform adheres to strict data integrity standards and will not display estimated or artificially fabricated turnaround durations.
          </p>
        </div>
      </div>
    </div>
  )
}
