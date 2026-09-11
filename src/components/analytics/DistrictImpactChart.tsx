import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { MapPin, Users, AlertCircle } from 'lucide-react'
import type { DistrictImpactItem } from '../../services/reportService'

interface DistrictImpactChartProps {
  districts: DistrictImpactItem[]
  loading?: boolean
}

export const DistrictImpactChart: React.FC<DistrictImpactChartProps> = ({ districts, loading = false }) => {
  if (loading) {
    return <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
  }

  if (!districts || districts.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-semibold text-white">No District Impact Records Available</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Geographic metrics will display as soon as reports from Jharkhand districts are registered.
        </p>
      </div>
    )
  }

  // Display top districts in chart
  const chartData = districts.slice(0, 8).map((d) => ({
    district: d.district.length > 10 ? `${d.district.slice(0, 8)}…` : d.district,
    full_district: d.district,
    avg_impact_score: d.avg_impact_score || 0,
    avg_feasibility_score: d.avg_feasibility_score || 0,
    beneficiaries: d.total_beneficiaries,
    reports: d.report_count,
  }))

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              District Impact & Feasibility Ranking
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparative performance across top active Jharkhand districts
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 self-start sm:self-auto font-mono">
          {districts.length} Districts Analyzed
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="avg_impact_score" name="Impact Potential (0-100)" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_feasibility_score" name="Feasibility (0-100)" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* District Highlights Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
        {districts.slice(0, 4).map((d, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-semibold text-white truncate">{d.district}</div>
            <div className="flex items-baseline justify-between mt-1 text-[11px]">
              <span className="text-slate-400">{d.report_count} reports</span>
              <span className="text-emerald-400 font-bold">{d.avg_impact_score ?? '—'} pts</span>
            </div>
            {d.total_beneficiaries > 0 && (
              <div className="text-[10px] text-indigo-300 mt-0.5 truncate flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{d.total_beneficiaries.toLocaleString()} citizens</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
