import { Search, X } from 'lucide-react'
import { JHARKHAND_DISTRICTS } from '../../data/jharkhandData'

const CATEGORIES = [
  'Water and Sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Public Safety',
  'Accessibility',
  'Rural Development',
  'Digital Services',
  'Other',
]

const URGENCIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Rejected']

interface GovernmentReportFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedDistrict: string
  onDistrictChange: (district: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedUrgency: string
  onUrgencyChange: (urgency: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
  totalCount: number
  filteredCount: number
}

export function GovernmentReportFilters({
  searchQuery,
  onSearchChange,
  selectedDistrict,
  onDistrictChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  hasActiveFilters,
  totalCount,
  filteredCount,
}: GovernmentReportFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
      {/* Search Bar and Top Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Track ID (e.g. IF-JH-2026-0001) or problem title..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 transition focus:border-[#187e8d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 sm:justify-end">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-[#12365a]">{filteredCount}</strong> of {totalCount} reports
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition"
            >
              <X size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* District Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition focus:border-[#187e8d] focus:outline-none"
          >
            <option value="">All Districts ({JHARKHAND_DISTRICTS.length})</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition focus:border-[#187e8d] focus:outline-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Urgency
          </label>
          <select
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition focus:border-[#187e8d] focus:outline-none"
          >
            <option value="">All Urgencies</option>
            {URGENCIES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition focus:border-[#187e8d] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
