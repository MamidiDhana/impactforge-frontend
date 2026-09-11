import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Star,
  FolderKanban,
  GraduationCap,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { StatusBadge } from '../common/StatusBadge'
import { useFaculty, type FacultyProjectProgress } from '../../context/FacultyContext'
import type { BackendReportResponse } from '../../services/reportService'
import { PartnerMatchingCard } from '../common/PartnerMatchingCard'
import { DynamicRematchingCard } from '../common/DynamicRematchingCard'
import { ProjectImpactAnalyticsCard } from '../common/ProjectImpactAnalyticsCard'

interface FacultyReportDetailsModalProps {
  report: BackendReportResponse | null
  isOpen: boolean
  onClose: () => void
  onOpenAssignModal?: (report: BackendReportResponse) => void
}

export function FacultyReportDetailsModal({
  report,
  isOpen,
  onClose,
  onOpenAssignModal,
}: FacultyReportDetailsModalProps) {
  const {
    isInterested,
    toggleInterested,
    isInProjects,
    toggleProject,
    getProject,
    updateProgress,
  } = useFaculty()

  const [notification, setNotification] = useState<string | null>(null)

  if (!report) return null

  const interested = isInterested(report.track_id)
  const inProjects = isInProjects(report.track_id)
  const projectItem = getProject(report.track_id)
  const student = projectItem?.assignedStudent

  const showFeedback = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleToggleInterested = () => {
    const nextState = toggleInterested(report.track_id)
    showFeedback(
      nextState
        ? `Added ${report.track_id} to Interested list.`
        : `Removed ${report.track_id} from Interested list.`
    )
  }

  const handleToggleProject = () => {
    const nextState = toggleProject(report.track_id)
    showFeedback(
      nextState
        ? `Added ${report.track_id} to Faculty Project List.`
        : `Removed ${report.track_id} from Faculty Project List.`
    )
  }

  const handleProgressChange = (newProgress: FacultyProjectProgress) => {
    updateProgress(report.track_id, newProgress)
    showFeedback(`Project progress updated to "${newProgress}".`)
  }

  const getUrgencyTone = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 ring-red-200'
      case 'high':
        return 'bg-orange-50 text-orange-700 ring-orange-200'
      case 'medium':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200'
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Faculty Problem Review · ${report.track_id}`}
    >
      <div className="space-y-6">
        {/* Dynamic Toast Feedback inside Modal */}
        {notification && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900 shadow-sm animate-in fade-in">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header Badges: Category, Urgency, Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#187e8d]/10 px-2.5 py-1 text-xs font-bold text-[#187e8d]">
              {report.category}
            </span>
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getUrgencyTone(
                report.priority
              )}`}
            >
              Priority: {report.priority}
            </span>
            <StatusBadge status={report.status as any} />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleInterested}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                interested
                  ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Star
                size={13}
                className={interested ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}
              />
              <span>{interested ? 'Interested ★' : 'Mark Interested'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleProject}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                inProjects
                  ? 'border-[#187e8d] bg-teal-50 text-[#12365a] shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FolderKanban
                size={13}
                className={inProjects ? 'text-[#187e8d]' : 'text-slate-400'}
              />
              <span>{inProjects ? 'In Faculty Projects' : 'Add to Projects'}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="font-[Manrope] text-lg font-bold text-[#13243b] sm:text-xl">
            {report.problem_title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <MapPin size={13} className="text-slate-400" />
            <span>
              {report.district}, {report.locality}
            </span>
          </p>
        </div>

        {/* Faculty Project Management Section (if in Project List) */}
        {inProjects && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-900">
                <FolderKanban size={14} className="text-teal-700" />
                Faculty Project Status &amp; Student Assignment
              </h4>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                Active in Faculty Portfolio
              </span>
            </div>

            {/* Progress Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Project Progress:</span>
              <div className="flex items-center gap-1.5">
                {(['Not Started', 'In Progress', 'Completed'] as FacultyProjectProgress[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleProgressChange(p)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      projectItem?.progress === p
                        ? p === 'Completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : p === 'In Progress'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-700 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p === 'Completed' && <CheckCircle2 size={12} className="inline mr-1" />}
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Assignment Status */}
            <div className="rounded-lg border border-teal-100 bg-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-600" />
                  <div>
                    {student ? (
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Assigned Student: {student.studentName}
                          <span className="ml-1.5 font-mono text-[11px] text-slate-500">
                            ({student.studentId})
                          </span>
                        </p>
                        {student.notes && (
                          <p className="mt-1 text-[11px] text-slate-600 italic">
                            &ldquo;{student.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-500">
                        No student assigned to this problem yet.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAssignModal && onOpenAssignModal(report)}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  {student ? 'Edit Assignment' : 'Assign Student'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Problem Description & Context */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-slate-400" />
              Problem Description &amp; Desired Outcome
            </h4>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
              {report.context_and_desired_outcome || 'No detailed description provided by the citizen.'}
            </p>
          </div>

          {/* Existing Efforts */}
          {report.existing_efforts && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Building size={14} className="text-slate-400" />
                Existing Community Efforts
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                {report.existing_efforts}
              </p>
            </div>
          )}

          {/* Expected Outcome */}
          {report.expected_outcome && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Sparkles size={14} className="text-slate-400" />
                Citizen Expected Outcome
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
                {report.expected_outcome}
              </p>
            </div>
          )}
        </div>

        {/* Location & Coordinates */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Location Details
          </h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div>
              <span className="font-semibold text-slate-500">State:</span>
              <p className="font-medium text-slate-800">{report.state || 'Jharkhand'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">District:</span>
              <p className="font-medium text-slate-800">{report.district}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Locality / Block:</span>
              <p className="font-medium text-slate-800">{report.locality}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-500">Address / Landmark:</span>
              <p className="font-medium text-slate-800">
                {report.address_or_landmark || 'None specified'}
              </p>
            </div>
            <div className="sm:col-span-2">
              <span className="font-semibold text-slate-500">GPS Coordinates:</span>
              {report.latitude !== null && report.longitude !== null ? (
                <p className="font-mono text-xs font-medium text-slate-800">
                  {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Not specified by citizen (manual location entered).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* AI Industry & CSR Partner Matching (Phase 1 Part 9) */}
        <PartnerMatchingCard report={report} />

        {/* AI Dynamic Re-Matching (Phase 1 Part 10) */}
        <DynamicRematchingCard
          trackId={report.track_id}
          rematchingStatus={report.ai_rematching_status}
          rematchingVersion={report.ai_rematching_version}
          lastRematchedAt={report.ai_last_rematched_at}
          rematchingReason={report.ai_rematching_reason}
          userRole="faculty"
        />

        {/* AI Project & Impact Analytics (Phase 1 Part 11) */}
        <ProjectImpactAnalyticsCard
          analytics={report.ai_project_analytics}
          trackId={report.track_id}
          status={report.ai_project_analytics_status || 'completed'}
        />

        {/* Official Remarks Section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <AlertCircle size={14} className="text-slate-400" />
            Official Remarks &amp; Governance Notes
          </h4>
          {report.official_remarks ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
              {report.official_remarks}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-500 italic">
              No official administrative remarks recorded yet. Problem is currently categorized as{' '}
              <strong className="text-slate-700 not-italic">{report.status}</strong> in the state registry.
            </p>
          )}
        </div>

        {/* Client-Side Note for Faculty */}
        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-[11px] leading-relaxed text-blue-800">
            Faculty interest, project management status, and student assignments are maintained in your local academic workspace. Live citizen problem reports are synced directly from the state PostgreSQL repository.
          </p>
        </div>

        {/* Timestamps & Close */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              Reported: {new Date(report.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              Updated: {new Date(report.updated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!inProjects ? (
              <button
                type="button"
                onClick={handleToggleProject}
                className="rounded-lg bg-[#187e8d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#136672]"
              >
                <FolderKanban size={13} className="inline mr-1.5" />
                Add to Project List
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAssignModal && onOpenAssignModal(report)}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <GraduationCap size={13} className="inline mr-1.5" />
                {student ? 'Manage Student' : 'Assign Student'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
