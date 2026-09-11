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
import { Layers, Clock, AlertCircle } from 'lucide-react'
import type { CategoryImpactItem } from '../../services/reportService'

interface CategoryImpactChartProps {
  categories: CategoryImpactItem[]
  loading?: boolean
}

export const CategoryImpactChart: React.FC<CategoryImpactChartProps> = ({ categories, loading = false }) => {
  if (loading) {
    return <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-semibold text-white">No Category Impact Records Available</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Sectoral metrics will display as soon as reports across civic categories are registered.
        </p>
      </div>
    )
  }

  const chartData = categories.slice(0, 7).map((c) => ({
    category: c.category.length > 12 ? `${c.category.slice(0, 10)}…` : c.category,
    full_category: c.category,
    avg_impact_score: c.avg_impact_score || 0,
    avg_feasibility_score: c.avg_feasibility_score || 0,
    duration_weeks: c.avg_duration_weeks || 0,
    reports: c.report_count,
  }))

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Category Impact & Timeline Overview
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Feasibility vs. civic impact potential categorized by civic domain
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 self-start sm:self-auto font-mono">
          {categories.length} Categories Active
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
            <Bar dataKey="avg_impact_score" name="Impact Potential (0-100)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avg_feasibility_score" name="Feasibility (0-100)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Duration Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80">
        {categories.slice(0, 4).map((c, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs font-semibold text-white truncate">{c.category}</div>
            <div className="flex items-baseline justify-between mt-1 text-[11px]">
              <span className="text-slate-400">{c.report_count} reports</span>
              <span className="text-cyan-400 font-bold">{c.avg_impact_score ?? '—'} pts</span>
            </div>
            {c.avg_duration_weeks && (
              <div className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>~{c.avg_duration_weeks} wks duration</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
