import { Filter, RotateCcw, RefreshCw } from 'lucide-react'
import { JHARKHAND_DISTRICTS } from '../../data/jharkhandData'

interface AnalyticsFiltersProps {
  selectedDistrict: string
  onDistrictChange: (d: string) => void
  selectedCategory: string
  onCategoryChange: (c: string) => void
  selectedUrgency: string
  onUrgencyChange: (u: string) => void
  selectedStatus: string
  onStatusChange: (s: string) => void
  selectedDateRange: string
  onDateRangeChange: (r: string) => void
  onResetFilters: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  hasActiveFilters: boolean
  totalCount: number
  filteredCount: number
  availableCategories?: string[]
}

const URGENCY_OPTIONS = ['Low', 'Medium', 'High', 'Critical']
const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Rejected']
const DATE_RANGE_OPTIONS = [
  { value: '', label: 'All Dates' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

export function AnalyticsFilters({
  selectedDistrict,
  onDistrictChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  selectedStatus,
  onStatusChange,
  selectedDateRange,
  onDateRangeChange,
  onResetFilters,
  onRefresh,
  isRefreshing = false,
  hasActiveFilters,
  totalCount,
  filteredCount,
  availableCategories = [],
}: AnalyticsFiltersProps) {
  // Combine standard 24 districts
  const districtOptions = JHARKHAND_DISTRICTS.map((d) => d.name)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]">
            <Filter size={15} />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#13243b]">
              Global Analytics Filters
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {filteredCount} of {totalCount} verified citizen reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition disabled:opacity-50"
            title="Fetch latest reports from backend"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Analytics'}</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 text-xs">
        {/* District Filter */}
        <div>
          <label htmlFor="analytics-filter-district" className="block text-[11px] font-semibold text-slate-500 mb-1">
            District
          </label>
          <select
            id="analytics-filter-district"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
          >
            <option value="">All Districts ({districtOptions.length})</option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="analytics-filter-category" className="block text-[11px] font-semibold text-slate-500 mb-1">
            Category
          </label>
          <select
            id="analytics-filter-category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
          >
            <option value="">All Categories ({availableCategories.length})</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <label htmlFor="analytics-filter-urgency" className="block text-[11px] font-semibold text-slate-500 mb-1">
            Urgency
          </label>
          <select
            id="analytics-filter-urgency"
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
          >
            <option value="">All Urgencies</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="analytics-filter-status" className="block text-[11px] font-semibold text-slate-500 mb-1">
            Government Status
          </label>
          <select
            id="analytics-filter-status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label htmlFor="analytics-filter-date-range" className="block text-[11px] font-semibold text-slate-500 mb-1">
            Submission Date
          </label>
          <select
            id="analytics-filter-date-range"
            value={selectedDateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
          >
            {DATE_RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
