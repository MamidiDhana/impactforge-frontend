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
import { MapPin } from 'lucide-react'
import type { DistrictMetric } from '../../utils/analyticsUtils'

interface DistrictProblemsChartProps {
  data: DistrictMetric[]
}

const DISTRICT_COLORS = ['#12365a', '#187e8d', '#0284c7', '#0d9488', '#334155']

export function DistrictProblemsChart({ data }: DistrictProblemsChartProps) {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0)
  // Dynamic height ensuring each district bar has enough breathing room
  const dynamicHeight = Math.max(260, Math.min(500, data.length * 40))

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-blue-50 text-[#12365a]">
              <MapPin size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              District-Wise Problem Density
            </h3>
          </div>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#12365a]">
            {data.length} Districts Active
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Distribution of citizen reports across Jharkhand districts
        </p>
      </div>

      <div className="my-4 w-full" style={{ height: `${dynamicHeight}px` }}>
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-slate-50 text-center p-4">
            <p className="text-xs font-semibold text-slate-500">No district data available</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Clear or broaden filter criteria to see district distribution
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                type="category"
                dataKey="district"
                width={120}
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
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
                  'Total Issues',
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`district-cell-${index}`}
                    fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="text-[11px] text-slate-400">
          Aggregated by verified geographical district tags in PostgreSQL.
        </p>
      </div>
    </div>
  )
}
