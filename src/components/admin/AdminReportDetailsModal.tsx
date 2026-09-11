import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { StatusBadge } from '../common/StatusBadge'
import { updateReportStatus, type BackendReportResponse } from '../../services/reportService'
import { useAdmin } from '../../context/AdminContext'
import { AIAnalysisCard } from '../common/AIAnalysisCard'
import { SimilarProblemsCard } from '../common/SimilarProblemsCard'
import { DuplicateAnalysisCard } from '../common/DuplicateAnalysisCard'
import { CapabilityRequirementsCard } from '../common/CapabilityRequirementsCard'
import { HEIMatchingCard } from '../common/HEIMatchingCard'
import { FacultyMatchingCard } from '../common/FacultyMatchingCard'
import { StudentMatchingCard } from '../common/StudentMatchingCard'
import { CapabilityGapCard } from '../common/CapabilityGapCard'
import { PartnerMatchingCard } from '../common/PartnerMatchingCard'
import { DynamicRematchingCard } from '../common/DynamicRematchingCard'
import { ProjectImpactAnalyticsCard } from '../common/ProjectImpactAnalyticsCard'


interface AdminReportDetailsModalProps {
  report: BackendReportResponse | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdated?: (trackId: string, newStatus: string) => void
}

const ALLOWED_STATUSES = ['Open', 'In Progress', 'Resolved', 'Rejected']

export function AdminReportDetailsModal({
  report,
  isOpen,
  onClose,
  onStatusUpdated,
}: AdminReportDetailsModalProps) {
  const { addAuditEntry } = useAdmin()
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)

  if (!report) return null

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === report.status) return

    setIsUpdating(true)
    setUpdateError(null)
    setUpdateSuccess(null)

    try {
      await updateReportStatus(report.track_id, newStatus as any)
      addAuditEntry({
        action: 'Update Report Status',
        targetItem: report.track_id,
        description: `Changed status from "${report.status}" to "${newStatus}" via Super Admin console`,
      })
      setUpdateSuccess(`Status changed to "${newStatus}" successfully.`)
      if (onStatusUpdated) {
        onStatusUpdated(report.track_id, newStatus)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update report status.'
      setUpdateError(msg)
    } finally {
      setIsUpdating(false)
    }
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
      title={`Super Admin Report Review · ${report.track_id}`}
    >
      <div className="space-y-6">
        {/* Success Banner */}
        {updateSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-sm">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{updateSuccess}</span>
          </div>
        )}

        {/* Error Banner */}
        {updateError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-900 shadow-sm">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{updateError}</span>
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

          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
            Super Admin Authority
          </span>
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

        {/* Admin Resolution Status Modifier */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Update Resolution Status in PostgreSQL
            </h4>
            {isUpdating && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#187e8d]">
                <RefreshCw size={12} className="animate-spin" />
                Updating backend...
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ALLOWED_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-60 ${
                  report.status === st
                    ? st === 'Resolved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : st === 'In Progress'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : st === 'Rejected'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {report.status === st && <CheckCircle2 size={12} className="inline mr-1" />}
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Description & Context */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-slate-400" />
              Problem Description &amp; Desired Outcome
            </h4>
            <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-700 sm:text-sm">
              {report.context_and_desired_outcome || 'No detailed description provided by citizen.'}
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

        {/* AI Categorization & Priority Analysis (Phase 1 Part 1 & Part 2) */}
        <AIAnalysisCard report={report} />

        {/* AI Similar-Problem & Duplicate Detection (Phase 1 Part 3) */}
        <SimilarProblemsCard report={report} />

        {/* AI Official Duplicate Analysis & Human Review (Phase 1 Part 4) */}
        <DuplicateAnalysisCard report={report} />

        {/* AI Capability & Resource Requirements Extraction (Phase 1 Part 5) */}
        <CapabilityRequirementsCard report={report} />

        {/* AI Higher Education Institution (HEI) Matching (Phase 1 Part 6) */}
        <HEIMatchingCard report={report} />

        {/* AI Faculty and Mentor Matching (Phase 1 Part 7) */}
        <FacultyMatchingCard report={report} />

        {/* AI Student Project and Capstone Matching (Phase 1 Part 7) */}
        <StudentMatchingCard report={report} />

        {/* AI Capability-Gap Analysis (Phase 1 Part 8) */}
        <CapabilityGapCard report={report} />

        {/* AI Industry and CSR Partner Matching (Phase 1 Part 9) */}
        <PartnerMatchingCard report={report} />

        {/* AI Dynamic Re-Matching (Phase 1 Part 10) */}
        <DynamicRematchingCard
          trackId={report.track_id}
          rematchingStatus={report.ai_rematching_status}
          rematchingVersion={report.ai_rematching_version}
          lastRematchedAt={report.ai_last_rematched_at}
          rematchingReason={report.ai_rematching_reason}
          userRole="admin"
        />

        {/* AI Project & Impact Analytics (Phase 1 Part 11) */}
        <ProjectImpactAnalyticsCard
          analytics={report.ai_project_analytics}
          trackId={report.track_id}
          status={report.ai_project_analytics_status || 'completed'}
        />


        {/* Location Details & Coordinates */}
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
              <span className="font-semibold text-slate-500">Locality:</span>
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

        {/* Official Remarks Section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <AlertCircle size={14} className="text-slate-400" />
            Official Remarks &amp; Administrative Notes
          </h4>
          {report.official_remarks ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-700 sm:text-sm">
              {report.official_remarks}
            </p>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-500 italic">
              Official remarks are not recorded in the database schema for this report. The report is marked as{' '}
              <strong className="text-slate-700 not-italic">{report.status}</strong>.
            </p>
          )}
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

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
