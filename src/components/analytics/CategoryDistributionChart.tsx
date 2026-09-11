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
import { FolderTree } from 'lucide-react'
import type { CategoryMetric } from '../../utils/analyticsUtils'

interface CategoryDistributionChartProps {
  data: CategoryMetric[]
}

const CATEGORY_COLORS = [
  '#187e8d', // Teal
  '#12365a', // Navy
  '#0284c7', // Sky
  '#0d9488', // Emerald-Teal
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
]

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
              <FolderTree size={16} />
            </span>
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Category Distribution
            </h3>
          </div>
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-[#187e8d]">
            {data.length} Categories
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Citizen problem reports classified by civic sector
        </p>
      </div>

      <div className="my-4 h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl bg-slate-50 text-center p-4">
            <p className="text-xs font-semibold text-slate-500">No category data found</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Try adjusting your filter settings
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#64748b' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={40}
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
                  'Count',
                ]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Categories summary footer */}
      <div className="border-t border-slate-100 pt-3">
        <p className="text-[11px] text-slate-400">
          Ranked from highest to lowest report frequency across selected parameters.
        </p>
      </div>
    </div>
  )
}
