import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import { AlertCircle } from 'lucide-react'
import type { UrgencySlice } from '../../utils/analyticsUtils'

interface UrgencyChartProps {
  data: UrgencySlice[]
}

export function UrgencyChart({ data }: UrgencyChartProps) {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-red-50 text-red-600">
              <AlertCircle size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Urgency Level Breakdown
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            {totalCount} Reports
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Prioritization classification based on citizen-reported urgency
        </p>
      </div>

      <div className="my-4 h-64 w-full">
        {totalCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-slate-50 text-center p-4">
            <p className="text-xs font-semibold text-slate-500">No urgency data available</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Check active filters or reload reports
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="urgency"
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [
                  `${value ?? 0} Reports (${totalCount > 0 ? (((Number(value) || 0) / totalCount) * 100).toFixed(1) : 0}%)`,
                  'Priority Count',
                ]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={`urgency-${entry.urgency}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown Pills */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4 text-xs">
        {data.map((item) => (
          <div
            key={item.urgency}
            className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-600">{item.urgency}</span>
            </div>
            <span className="font-bold text-slate-800">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
