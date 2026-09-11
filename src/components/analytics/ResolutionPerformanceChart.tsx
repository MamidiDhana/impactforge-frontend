import React, { useState } from 'react'
import { CheckCircle2, Clock, BarChart3, AlertCircle, Award } from 'lucide-react'
import type { ResolutionPerformanceResponse } from '../../services/reportService'

interface ResolutionPerformanceChartProps {
  performance: ResolutionPerformanceResponse | null
  loading?: boolean
}

export const ResolutionPerformanceChart: React.FC<ResolutionPerformanceChartProps> = ({ performance, loading = false }) => {
  const [activeTab, setActiveTab] = useState<'category' | 'district'>('category')

  if (loading) {
    return <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
  }

  if (!performance || performance.insufficient_data) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-semibold text-white">Insufficient Resolution Performance Data</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
          No reports have been marked as Resolved yet. Turnaround metrics and resolution efficiency will compute automatically once issues are officially resolved.
        </p>
      </div>
    )
  }

  const {
    total_resolved,
    overall_avg_days_to_resolve,
    overall_resolution_rate_percentage = 0.0,
    by_category = [],
    by_district = [],
  } = performance

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Resolution Turnaround & Efficiency
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real resolution duration and completion rates derived from official resolution timestamps
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'category'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Sector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('district')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'district'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By District
          </button>
        </div>
      </div>

      {/* Top Level Efficiency KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Total Resolved Reports
          </div>
          <div className="text-xl font-bold text-white">{total_resolved}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Successfully closed civic issues</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            Avg Turnaround Duration
          </div>
          <div className="text-xl font-bold text-white">
            {overall_avg_days_to_resolve !== null && overall_avg_days_to_resolve !== undefined
              ? `${overall_avg_days_to_resolve} Days`
              : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">From submission to verification</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Overall Resolution Rate
          </div>
          <div className="text-xl font-bold text-emerald-400">{overall_resolution_rate_percentage}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Percentage of total backlog cleared</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">{activeTab === 'category' ? 'Category / Sector' : 'District'}</th>
              <th className="py-2.5 px-3">Total</th>
              <th className="py-2.5 px-3">Resolved</th>
              <th className="py-2.5 px-3">Resolution Rate</th>
              <th className="py-2.5 px-3">Avg Turnaround</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activeTab === 'category'
              ? by_category.slice(0, 6).map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white">{c.category}</td>
                    <td className="py-2.5 px-3 text-slate-400">{c.total_reports}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{c.resolved_reports}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, c.resolution_rate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono">{c.resolution_rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {c.avg_days_to_resolve !== null ? `${c.avg_days_to_resolve} days` : '—'}
                    </td>
                  </tr>
                ))
              : by_district.slice(0, 6).map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-white">{d.district}</td>
                    <td className="py-2.5 px-3 text-slate-400">{d.total_reports}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">{d.resolved_reports}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, d.resolution_rate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono">{d.resolution_rate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {d.avg_days_to_resolve !== null ? `${d.avg_days_to_resolve} days` : '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
