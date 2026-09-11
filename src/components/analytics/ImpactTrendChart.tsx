import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { TrendingUp, AlertCircle } from 'lucide-react'
import type { ImpactTrendItem } from '../../services/reportService'

interface ImpactTrendChartProps {
  trends: ImpactTrendItem[]
  loading?: boolean
}

export const ImpactTrendChart: React.FC<ImpactTrendChartProps> = ({ trends, loading = false }) => {
  if (loading) {
    return <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
  }

  if (!trends || trends.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
        <p className="text-xs font-semibold text-white">No Chronological Impact Trends Recorded</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
          Periodic trends will populate automatically as community reports are analyzed across active periods.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Impact & Feasibility Trajectory
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Periodic progression of average civic impact scores vs. total volume
          </p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 self-start sm:self-auto font-mono">
          {trends.length} Period{trends.length > 1 ? 's' : ''} Indexed
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} domain={[0, 100]} />
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
            <Bar
              yAxisId="left"
              dataKey="report_count"
              name="Report Volume"
              fill="#38bdf8"
              radius={[4, 4, 0, 0]}
              opacity={0.8}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_impact_score"
              name="Avg Impact Score (0-100)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avg_feasibility_score"
              name="Avg Feasibility Score (0-100)"
              stroke="#818cf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ fill: '#818cf8', r: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
