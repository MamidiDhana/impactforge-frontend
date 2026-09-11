import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { StatusSlice } from '../../utils/analyticsUtils'
import { PieChart as PieIcon } from 'lucide-react'

interface ReportStatusChartProps {
  data: StatusSlice[]
}

export function ReportStatusChart({ data }: ReportStatusChartProps) {
  const totalCount = data.reduce((acc, curr) => acc + curr.value, 0)

  // Filter out slices with 0 value to keep legend/donut clean, but preserve all in breakdown list
  const chartData = data.filter((d) => d.value > 0)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <PieIcon size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Report Status Distribution
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            {totalCount} Total
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Proportion of problems across resolution stages
        </p>
      </div>

      <div className="my-4 h-64 w-full">
        {totalCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-slate-50 text-center p-4">
            <p className="text-xs font-semibold text-slate-500">No reports available</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Adjust filters or sync live backend data
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any, name: any) => [
                  `${value ?? 0} Reports (${totalCount > 0 ? (((Number(value) || 0) / totalCount) * 100).toFixed(1) : 0}%)`,
                  name ?? '',
                ]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Mini Legend List */}
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between rounded-lg bg-slate-50/70 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 font-medium">{item.name}</span>
            </div>
            <span className="font-bold text-slate-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
