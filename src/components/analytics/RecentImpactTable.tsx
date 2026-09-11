import { Eye, MapPin, Calendar, FileText } from 'lucide-react'
import type { BackendReportResponse } from '../../services/reportService'
import { StatusBadge } from '../common/StatusBadge'
import { formatReportDate } from '../../utils/analyticsUtils'

interface RecentImpactTableProps {
  reports: BackendReportResponse[]
  onViewDetails: (report: BackendReportResponse) => void
}

export function RecentImpactTable({ reports, onViewDetails }: RecentImpactTableProps) {
  // Sort reports by created date descending (fallback to existing order)
  const sortedReports = [...reports].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
    if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA
    }
    return 0
  })

  const getUrgencyTone = (urgency?: string) => {
    const u = (urgency || '').toLowerCase()
    if (u === 'critical' || u === 'high') {
      return 'bg-red-50 text-red-700 ring-1 ring-red-200'
    }
    if (u === 'medium') {
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }
    return 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <FileText size={28} className="mx-auto text-slate-300" />
        <h4 className="mt-2 font-[Manrope] text-sm font-bold text-slate-700">
          No Reports Available
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          No reports match the current filter selection.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet: Responsive Table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Track ID</th>
                <th className="px-5 py-3.5">Problem Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">District</th>
                <th className="px-5 py-3.5">Urgency</th>
                <th className="px-5 py-3.5">Current Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {sortedReports.map((report) => (
                <tr
                  key={report.track_id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">
                      {report.track_id}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900 max-w-xs">
                    <div className="truncate" title={report.problem_title}>
                      {report.problem_title || 'Untitled Problem'}
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {report.category || 'Not available'}
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#187e8d] shrink-0" />
                      <span>{report.district || 'Not available'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getUrgencyTone(
                        report.priority
                      )}`}
                    >
                      {report.priority || 'Medium'}
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={report.status as any} />
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span>{formatReportDate(report.created_at)}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(report)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Eye size={13} className="text-[#187e8d]" />
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
        {sortedReports.map((report) => (
          <div
            key={report.track_id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-[#12365a] px-2 py-0.5 font-mono text-xs font-bold text-white">
                {report.track_id}
              </span>
              <StatusBadge status={report.status as any} />
            </div>

            <div>
              <h4 className="font-[Manrope] text-sm font-bold text-[#13243b]">
                {report.problem_title || 'Untitled Problem'}
              </h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {report.context_and_desired_outcome || 'No description provided.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {report.category || 'Not available'}
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin size={12} className="text-[#187e8d]" />
                <span>{report.district || 'Not available'}</span>
              </span>
              <span className={`rounded-full px-2 py-0.5 font-semibold ${getUrgencyTone(report.priority)}`}>
                {report.priority || 'Medium'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Calendar size={12} />
                <span>{formatReportDate(report.created_at)}</span>
              </span>

              <button
                type="button"
                onClick={() => onViewDetails(report)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={12} className="text-[#187e8d]" />
                <span>Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
