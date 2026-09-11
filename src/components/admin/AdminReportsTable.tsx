import { useState, useMemo } from 'react'
import {
  Search,
  X,
  RotateCcw,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { StatusBadge } from '../common/StatusBadge'
import { LoadingState } from '../common/LoadingState'
import { ErrorState } from '../common/ErrorState'
import { EmptyState } from '../common/EmptyState'
import { JHARKHAND_DISTRICTS } from '../../data/jharkhandData'
import { updateReportStatus, type BackendReportResponse } from '../../services/reportService'
import { useAdmin } from '../../context/AdminContext'

interface AdminReportsTableProps {
  reports: BackendReportResponse[]
  isLoading: boolean
  fetchError: string | null
  onRefresh: () => void
  onViewDetails: (report: BackendReportResponse) => void
  onReportStatusChanged?: (trackId: string, newStatus: string) => void
}

const CATEGORIES = [
  'Water and Sanitation',
  'Waste Management',
  'Healthcare',
  'Education',
  'Agriculture',
  'Environment',
  'Public Safety',
  'Transport',
  'Digital Services',
  'Other',
]

const URGENCIES = ['Low', 'Medium', 'High', 'Critical']
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Rejected']

export function AdminReportsTable({
  reports,
  isLoading,
  fetchError,
  onRefresh,
  onViewDetails,
  onReportStatusChanged,
}: AdminReportsTableProps) {
  const { addAuditEntry } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedUrgency, setSelectedUrgency] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const [updatingTrackId, setUpdatingTrackId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleInlineStatusChange = async (report: BackendReportResponse, newStatus: string) => {
    if (newStatus === report.status) return

    setUpdatingTrackId(report.track_id)
    setErrorMessage(null)

    try {
      await updateReportStatus(report.track_id, newStatus as any)
      addAuditEntry({
        action: 'Update Report Status',
        targetItem: report.track_id,
        description: `Changed status of ${report.track_id} to "${newStatus}"`,
      })
      showToast(`Status of ${report.track_id} changed to "${newStatus}".`)
      if (onReportStatusChanged) {
        onReportStatusChanged(report.track_id, newStatus)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Status update failed.'
      setErrorMessage(msg)
    } finally {
      setUpdatingTrackId(null)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchId = r.track_id.toLowerCase().includes(q)
        const matchTitle = r.problem_title.toLowerCase().includes(q)
        if (!matchId && !matchTitle) return false
      }

      if (selectedDistrict && r.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false
      }

      if (selectedCategory && r.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false
      }

      if (selectedUrgency && r.priority.toLowerCase() !== selectedUrgency.toLowerCase()) {
        return false
      }

      if (selectedStatus && r.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false
      }

      return true
    })
  }, [reports, searchQuery, selectedDistrict, selectedCategory, selectedUrgency, selectedStatus])

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedDistrict ||
      selectedCategory ||
      selectedUrgency ||
      selectedStatus
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedCategory('')
    setSelectedUrgency('')
    setSelectedStatus('')
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 ring-red-200'
      case 'high':
        return 'bg-orange-50 text-orange-700 ring-orange-200'
      case 'medium':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast and Error banners */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-900 shadow-sm animate-in fade-in">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Search & Filter Card */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by Track ID (e.g. IF-JH-2026-0001) or problem title..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#187e8d]' : ''} />
              <span>{isLoading ? 'Syncing...' : 'Refresh Reports'}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Dropdown Filters */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="admin-filter-district" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              District
            </label>
            <select
              id="admin-filter-district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
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

          <div>
            <label htmlFor="admin-filter-category" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <select
              id="admin-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-filter-urgency" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Urgency
            </label>
            <select
              id="admin-filter-urgency"
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
            >
              <option value="">All Urgencies</option>
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="admin-filter-status" className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Status
            </label>
            <select
              id="admin-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
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

        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredReports.length}</strong> of {reports.length} citizen reports
          </span>
          <span className="text-[11px] text-slate-400">
            PostgreSQL Live Sync
          </span>
        </div>
      </div>

      {/* Loading, Error, Empty, or Table */}
      {isLoading && reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
          <LoadingState rows={4} />
        </div>
      ) : fetchError && reports.length === 0 ? (
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <ErrorState
            title="Failed to query FastAPI backend"
            description={fetchError}
            onRetry={onRefresh}
          />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <EmptyState
            title="No citizen reports in database"
            description="The PostgreSQL reports table is currently empty. New citizen problem submissions will appear here automatically."
          />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <EmptyState
            title="No reports matching search filters"
            description="No citizen problem reports match your current filter criteria. Try adjusting or clearing your filters."
          />
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 pl-4 pr-2">Track ID</th>
                    <th className="px-3 py-3.5">Problem Title</th>
                    <th className="px-3 py-3.5">Category</th>
                    <th className="px-3 py-3.5">District / Locality</th>
                    <th className="px-3 py-3.5">Urgency</th>
                    <th className="px-3 py-3.5">Current Status</th>
                    <th className="px-3 py-3.5">Update Status</th>
                    <th className="px-3 py-3.5">Created Date</th>
                    <th className="py-3.5 pl-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReports.map((report) => (
                    <tr key={report.track_id} className="transition hover:bg-slate-50/70">
                      <td className="py-3 pl-4 pr-2">
                        <span className="font-mono font-bold text-[#187e8d]">
                          {report.track_id}
                        </span>
                      </td>

                      <td className="px-3 py-3 max-w-[220px]">
                        <div className="font-semibold text-slate-900 line-clamp-1" title={report.problem_title}>
                          {report.problem_title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {report.context_and_desired_outcome || 'No description'}
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {report.category}
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{report.district}</div>
                        <div className="text-[11px] text-slate-400">{report.locality}</div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${getUrgencyBadge(
                            report.priority
                          )}`}
                        >
                          {report.priority}
                        </span>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={report.status as any} />
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <select
                          value={report.status}
                          disabled={updatingTrackId === report.track_id}
                          onChange={(e) => handleInlineStatusChange(report, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none hover:border-[#187e8d] focus:border-[#187e8d] disabled:opacity-50"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDetails(report)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {filteredReports.map((report) => (
              <div
                key={report.track_id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#187e8d]">
                      {report.track_id}
                    </span>
                    <h4 className="mt-1 font-[Manrope] text-sm font-bold text-[#13243b]">
                      {report.problem_title}
                    </h4>
                  </div>
                  <StatusBadge status={report.status as any} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                    {report.category}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold ring-1 ring-inset ${getUrgencyBadge(
                      report.priority
                    )}`}
                  >
                    {report.priority}
                  </span>
                  <span className="text-slate-500">
                    {report.district}, {report.locality}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-600">Status:</span>
                    <select
                      value={report.status}
                      disabled={updatingTrackId === report.track_id}
                      onChange={(e) => handleInlineStatusChange(report, e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => onViewDetails(report)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye size={13} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
