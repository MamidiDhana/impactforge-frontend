import { Search, X, RotateCcw, Filter, Star, Handshake, Zap, CheckCircle2 } from 'lucide-react'
import { JHARKHAND_DISTRICTS } from '../../data/jharkhandData'

export type PartnerViewMode = 'all' | 'interested' | 'supported' | 'active' | 'completed'

interface PartnerReportFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  selectedUrgency: string
  onUrgencyChange: (value: string) => void
  selectedGovStatus: string
  onGovStatusChange: (value: string) => void
  viewMode: PartnerViewMode
  onViewModeChange: (mode: PartnerViewMode) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  totalCount: number
  filteredCount: number
  interestedCount: number
  supportedCount: number
  activeCount: number
  completedCount: number
}

const CATEGORIES = [
  'Water and Sanitation',
  'Healthcare',
  'Education',
  'Agriculture',
  'Infrastructure',
  'Environment',
  'Livelihood and Skilling',
  'Energy and Power',
  'Civic Amenities',
]

const URGENCIES = ['Low', 'Medium', 'High', 'Critical']

const GOV_STATUSES = ['Open', 'In Progress', 'Resolved', 'Rejected']

export function PartnerReportFilters({
  searchQuery,
  onSearchChange,
  selectedDistrict,
  onDistrictChange,
  selectedCategory,
  onCategoryChange,
  selectedUrgency,
  onUrgencyChange,
  selectedGovStatus,
  onGovStatusChange,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onResetFilters,
  totalCount,
  filteredCount,
  interestedCount,
  supportedCount,
  activeCount,
  completedCount,
}: PartnerReportFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* 5 View Mode Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => onViewModeChange('all')}
          className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            viewMode === 'all'
              ? 'bg-[#12365a] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>All Problems</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              viewMode === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('interested')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            viewMode === 'interested'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
          }`}
        >
          <Star
            size={13}
            className={viewMode === 'interested' ? 'fill-white' : 'fill-amber-500 text-amber-500'}
          />
          <span>Interested Problems</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              viewMode === 'interested' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
            }`}
          >
            {interestedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('supported')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            viewMode === 'supported'
              ? 'bg-[#187e8d] text-white shadow-sm'
              : 'bg-teal-50 text-teal-900 hover:bg-teal-100'
          }`}
        >
          <Handshake size={13} />
          <span>Supported Projects</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              viewMode === 'supported' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-900'
            }`}
          >
            {supportedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('active')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            viewMode === 'active'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
          }`}
        >
          <Zap size={13} />
          <span>Active Partnerships</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
            }`}
          >
            {activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('completed')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition ${
            viewMode === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>Completed Partnerships</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              viewMode === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            {completedCount}
          </span>
        </button>
      </div>

      {/* Search Bar & Result Count */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Track ID, problem title, district, or locality..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Live Result Count & Reset Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalCount}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Dropdown Filter Controls */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* District Filter */}
        <div>
          <label
            htmlFor="partner-filter-district"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            District
          </label>
          <select
            id="partner-filter-district"
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
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
          <label
            htmlFor="partner-filter-category"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Category
          </label>
          <select
            id="partner-filter-category"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div>
          <label
            htmlFor="partner-filter-urgency"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Urgency
          </label>
          <select
            id="partner-filter-urgency"
            value={selectedUrgency}
            onChange={(e) => onUrgencyChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
          >
            <option value="">All Urgencies</option>
            {URGENCIES.map((urg) => (
              <option key={urg} value={urg}>
                {urg}
              </option>
            ))}
          </select>
        </div>

        {/* Government Status Filter */}
        <div>
          <label
            htmlFor="partner-filter-govstatus"
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            Government Status
          </label>
          <select
            id="partner-filter-govstatus"
            value={selectedGovStatus}
            onChange={(e) => onGovStatusChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
          >
            <option value="">All Gov Statuses</option>
            {GOV_STATUSES.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 text-xs text-slate-500">
          <Filter size={12} className="text-[#187e8d]" />
          <span className="font-semibold text-slate-600">Active filters:</span>
          {searchQuery && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              Query: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
          {selectedDistrict && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              District: {selectedDistrict}
            </span>
          )}
          {selectedCategory && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              Category: {selectedCategory}
            </span>
          )}
          {selectedUrgency && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              Urgency: {selectedUrgency}
            </span>
          )}
          {selectedGovStatus && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              Gov Status: {selectedGovStatus}
            </span>
          )}
          {viewMode !== 'all' && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700 capitalize">
              View: {viewMode}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
