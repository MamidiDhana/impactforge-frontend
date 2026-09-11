import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Calendar, AlertCircle } from 'lucide-react'
import type { TrendMetric } from '../../utils/analyticsUtils'

interface ProblemTrendChartProps {
  data: TrendMetric[]
  hasValidDates: boolean
}

export function ProblemTrendChart({ data, hasValidDates }: ProblemTrendChartProps) {
  const totalSubmissions = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
              <Calendar size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Citizen Problem Submission Activity
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Timeline of report submissions calculated from live creation timestamps
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 self-start sm:self-auto">
          Calculated from available reports
        </span>
      </div>

      <div className="my-2 h-64 w-full">
        {!hasValidDates ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-amber-50/70 p-6 text-center border border-amber-200">
            <AlertCircle size={24} className="text-amber-600 mb-2" />
            <p className="text-xs font-bold text-amber-900">
              Problem trend is unavailable because report creation dates are not provided by the backend.
            </p>
            <p className="mt-1 text-[11px] text-amber-700">
              When reports include valid timestamp metadata, chronological activity curves will display here.
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-slate-50 text-center p-4">
            <p className="text-xs font-semibold text-slate-500">No date-indexed records match filters</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Reset date filters to view all recorded submission dates
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#187e8d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#187e8d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [`${value ?? 0} Submissions`, 'Reports Logged']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#187e8d"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
        <span>Total Dated Submissions in View: {totalSubmissions}</span>
        <span className="italic">
          Note: This reflects current active report timestamps, not historical multi-year growth curves.
        </span>
      </div>
    </div>
  )
}
