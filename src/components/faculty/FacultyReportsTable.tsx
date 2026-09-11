import { Eye, Star, FolderKanban, GraduationCap, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import { StatusBadge } from '../common/StatusBadge'
import { useFaculty, type FacultyProjectProgress } from '../../context/FacultyContext'
import type { BackendReportResponse } from '../../services/reportService'

interface FacultyReportsTableProps {
  reports: BackendReportResponse[]
  onViewDetails: (report: BackendReportResponse) => void
  onAssignStudent: (report: BackendReportResponse) => void
  onToggleInterested: (trackId: string) => void
  onToggleProject: (trackId: string) => void
}

export function FacultyReportsTable({
  reports,
  onViewDetails,
  onAssignStudent,
  onToggleInterested,
  onToggleProject,
}: FacultyReportsTableProps) {
  const { isInterested, isInProjects, getProject } = useFaculty()

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

  const getProgressBadge = (progress: FacultyProjectProgress) => {
    switch (progress) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 ring-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-4 pr-2">Track ID</th>
                <th className="px-3 py-3.5">Problem Title</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Location</th>
                <th className="px-3 py-3.5">Urgency</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-3 py-3.5">Faculty Status</th>
                <th className="px-3 py-3.5">Created Date</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {reports.map((report) => {
                const interested = isInterested(report.track_id)
                const inProjects = isInProjects(report.track_id)
                const projectItem = getProject(report.track_id)
                const student = projectItem?.assignedStudent

                return (
                  <tr
                    key={report.track_id}
                    className="transition hover:bg-slate-50/70"
                  >
                    {/* Track ID */}
                    <td className="py-3 pl-4 pr-2">
                      <span className="font-mono font-bold text-[#187e8d]">
                        {report.track_id}
                      </span>
                    </td>

                    {/* Problem Title */}
                    <td className="px-3 py-3 max-w-[220px]">
                      <div className="font-semibold text-slate-900 line-clamp-1" title={report.problem_title}>
                        {report.problem_title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {report.context_and_desired_outcome || 'No details'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {report.category}
                      </span>
                    </td>

                    {/* District & Locality */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{report.district}</div>
                      <div className="text-[11px] text-slate-400">{report.locality}</div>
                    </td>

                    {/* Urgency */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${getUrgencyBadge(
                          report.priority
                        )}`}
                      >
                        {report.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <StatusBadge status={report.status as any} />
                    </td>

                    {/* Faculty Project & Student Assignment Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {inProjects ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getProgressBadge(
                              projectItem?.progress || 'Not Started'
                            )}`}
                          >
                            {projectItem?.progress === 'Completed' && <CheckCircle2 size={10} />}
                            {projectItem?.progress || 'Not Started'}
                          </span>
                          {student ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700" title={`Assigned: ${student.studentName} (${student.studentId})`}>
                              <GraduationCap size={12} className="shrink-0 text-indigo-600" />
                              <span className="truncate max-w-[110px]">{student.studentName}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAssignStudent(report)}
                              className="block text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              + Assign student
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not in project list</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Star Interested Action */}
                        <button
                          type="button"
                          onClick={() => onToggleInterested(report.track_id)}
                          title={interested ? 'Remove from Interested' : 'Mark as Interested'}
                          className={`rounded-lg p-1.5 transition ${
                            interested
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <Star
                            size={15}
                            className={interested ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}
                          />
                        </button>

                        {/* Project List Action */}
                        <button
                          type="button"
                          onClick={() => onToggleProject(report.track_id)}
                          title={inProjects ? 'Remove from Faculty Projects' : 'Add to Faculty Projects'}
                          className={`rounded-lg p-1.5 transition ${
                            inProjects
                              ? 'bg-teal-50 text-[#187e8d] hover:bg-teal-100'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <FolderKanban size={15} />
                        </button>

                        {/* Assign Student Action */}
                        <button
                          type="button"
                          onClick={() => onAssignStudent(report)}
                          title="Assign to Student"
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                        >
                          <GraduationCap size={15} />
                        </button>

                        {/* View Details Action */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(report)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
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

      {/* Mobile Card View (Visible on small screens) */}
      <div className="space-y-3 md:hidden">
        {reports.map((report) => {
          const interested = isInterested(report.track_id)
          const inProjects = isInProjects(report.track_id)
          const projectItem = getProject(report.track_id)
          const student = projectItem?.assignedStudent

          return (
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggleInterested(report.track_id)}
                    className="p-1"
                    title="Toggle Interested"
                  >
                    <Star
                      size={18}
                      className={interested ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleProject(report.track_id)}
                    className={`rounded p-1 ${
                      inProjects ? 'text-[#187e8d]' : 'text-slate-300'
                    }`}
                    title="Toggle Project"
                  >
                    <FolderKanban size={18} />
                  </button>
                </div>
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
                <StatusBadge status={report.status as any} />
              </div>

              {/* Faculty project status on mobile */}
              {inProjects && (
                <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-2.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getProgressBadge(
                        projectItem?.progress || 'Not Started'
                      )}`}
                    >
                      Project: {projectItem?.progress || 'Not Started'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAssignStudent(report)}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      {student ? 'Edit student' : '+ Assign student'}
                    </button>
                  </div>
                  {student && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <GraduationCap size={13} className="text-indigo-600" />
                      <span>{student.studentName} ({student.studentId})</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {report.district}, {report.locality}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onAssignStudent(report)}
                  className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700"
                >
                  <GraduationCap size={13} />
                  <span>{student ? 'Student' : 'Assign'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails(report)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
