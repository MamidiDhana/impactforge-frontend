import { Eye, MapPin, Star, FolderPlus, FolderCheck } from 'lucide-react'
import type { BackendReportResponse } from '../../services/reportService'
import { StatusBadge } from '../common/StatusBadge'
import { useHEI } from '../../context/HEIContext'

interface HEIReportsTableProps {
  reports: BackendReportResponse[]
  onViewDetails: (report: BackendReportResponse) => void
  onToggleInterested?: (trackId: string) => void
  onToggleProject?: (trackId: string) => void
}

export function HEIReportsTable({
  reports,
  onViewDetails,
  onToggleInterested,
  onToggleProject,
}: HEIReportsTableProps) {
  const { isInterested, toggleInterested, isInProjects, toggleProject } = useHEI()

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      if (isNaN(d.getTime())) return isoString
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    const u = urgency.toLowerCase()
    let tone = 'bg-slate-100 text-slate-700'
    if (u === 'critical' || u === 'high') {
      tone = 'bg-red-50 text-red-700 ring-1 ring-red-200'
    } else if (u === 'medium') {
      tone = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    } else {
      tone = 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>
        {urgency}
      </span>
    )
  }

  const handleInterest = (trackId: string) => {
    toggleInterested(trackId)
    if (onToggleInterested) onToggleInterested(trackId)
  }

  const handleProject = (trackId: string) => {
    toggleProject(trackId)
    if (onToggleProject) onToggleProject(trackId)
  }

  return (
    <div className="space-y-4">
      {/* Desktop View: Table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Track ID</th>
                <th className="px-5 py-3.5">Problem Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">District</th>
                <th className="px-5 py-3.5">Locality</th>
                <th className="px-5 py-3.5">Urgency</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Created Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => {
                const interested = isInterested(report.track_id)
                const inProject = isInProjects(report.track_id)

                return (
                  <tr key={report.track_id} className="transition hover:bg-slate-50/70">
                    {/* Track ID */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">
                        {report.track_id}
                      </span>
                    </td>

                    {/* Problem Title */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-bold text-[#13243b] line-clamp-1" title={report.problem_title}>
                        {report.problem_title}
                      </p>
                      {report.context_and_desired_outcome && (
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {report.context_and_desired_outcome}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600">
                      {report.category}
                    </td>

                    {/* District */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-1 text-xs font-semibold text-[#13243b]">
                        <MapPin size={13} className="text-[#187e8d]" />
                        <span>{report.district}</span>
                      </div>
                    </td>

                    {/* Locality */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                      {report.locality || '—'}
                    </td>

                    {/* Urgency */}
                    <td className="whitespace-nowrap px-5 py-4">
                      {getUrgencyBadge(report.priority)}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-5 py-4">
                      <StatusBadge status={report.status as any} />
                    </td>

                    {/* Created Date */}
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {formatDate(report.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Interest toggle button */}
                        <button
                          type="button"
                          onClick={() => handleInterest(report.track_id)}
                          title={interested ? 'Remove from interested' : 'Mark as interested'}
                          className={`rounded-lg p-1.5 transition active:scale-95 ${
                            interested
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'
                          }`}
                        >
                          <Star size={15} className={interested ? 'fill-current' : ''} />
                        </button>

                        {/* Project toggle button */}
                        <button
                          type="button"
                          onClick={() => handleProject(report.track_id)}
                          title={inProject ? 'Remove from project list' : 'Add to HEI project list'}
                          className={`rounded-lg p-1.5 transition active:scale-95 ${
                            inProject
                              ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-teal-700'
                          }`}
                        >
                          {inProject ? <FolderCheck size={15} /> : <FolderPlus size={15} />}
                        </button>

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(report)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#1a4a7a] active:scale-95"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet View: Responsive Cards */}
      <div className="grid gap-3 lg:hidden">
        {reports.map((report) => {
          const interested = isInterested(report.track_id)
          const inProject = isInProjects(report.track_id)

          return (
            <div
              key={report.track_id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3"
            >
              {/* Card Header: Track ID & Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">
                  {report.track_id}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={report.status as any} />
                  {getUrgencyBadge(report.priority)}
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#187e8d]">
                  {report.category}
                </span>
                <h3 className="font-bold text-[#13243b] text-base leading-snug">
                  {report.problem_title}
                </h3>
                {report.context_and_desired_outcome && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {report.context_and_desired_outcome}
                  </p>
                )}
              </div>

              {/* District & Locality Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5">
                <div className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#187e8d] shrink-0" />
                  <span className="font-semibold text-slate-800">{report.district}</span>
                </div>
                <div className="text-right text-slate-500">
                  {report.locality || 'Locality unlisted'}
                </div>
                <div className="col-span-2 text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                  Reported on {formatDate(report.created_at)}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInterest(report.track_id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      interested
                        ? 'bg-amber-100 text-amber-800'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Star size={13} className={interested ? 'fill-current text-amber-500' : ''} />
                    <span>{interested ? 'Interested' : 'Interest'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProject(report.track_id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      inProject
                        ? 'bg-teal-100 text-teal-800'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {inProject ? <FolderCheck size={13} /> : <FolderPlus size={13} />}
                    <span>{inProject ? 'In Project' : 'Add Project'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onViewDetails(report)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                >
                  <Eye size={13} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
