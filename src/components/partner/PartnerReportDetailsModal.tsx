import { useState } from 'react'
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Building,
  Star,
  Handshake,
  Sparkles,
  Info,
  CheckCircle2,
  Phone,
  Mail,
  Zap,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { StatusBadge } from '../common/StatusBadge'
import { usePartner, type PartnershipStatus } from '../../context/PartnerContext'
import type { BackendReportResponse } from '../../services/reportService'
import { PartnerMatchingCard } from '../common/PartnerMatchingCard'
import { DynamicRematchingCard } from '../common/DynamicRematchingCard'
import { ProjectImpactAnalyticsCard } from '../common/ProjectImpactAnalyticsCard'

interface PartnerReportDetailsModalProps {
  report: BackendReportResponse | null
  isOpen: boolean
  onClose: () => void
  onOpenCollabModal?: (report: BackendReportResponse) => void
}

export function PartnerReportDetailsModal({
  report,
  isOpen,
  onClose,
  onOpenCollabModal,
}: PartnerReportDetailsModalProps) {
  const {
    isInterested,
    toggleInterested,
    isSupported,
    toggleSupported,
    getProject,
    updatePartnershipStatus,
  } = usePartner()

  const [notification, setNotification] = useState<string | null>(null)

  if (!report) return null

  const interested = isInterested(report.track_id)
  const supported = isSupported(report.track_id)
  const projectItem = getProject(report.track_id)
  const partnership = projectItem?.partnership
  const partnerStatus = projectItem?.status || 'Not Contacted'

  const showFeedback = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleToggleInterested = () => {
    const nextState = toggleInterested(report.track_id)
    showFeedback(
      nextState
        ? `Added ${report.track_id} to your Interested list.`
        : `Removed ${report.track_id} from your Interested list.`
    )
  }

  const handleToggleSupported = () => {
    const nextState = toggleSupported(report.track_id)
    showFeedback(
      nextState
        ? `Added ${report.track_id} to Supported Projects.`
        : `Removed ${report.track_id} from Supported Projects.`
    )
  }

  const handleStatusChange = (newStatus: PartnershipStatus) => {
    updatePartnershipStatus(report.track_id, newStatus)
    showFeedback(`Partnership status updated to "${newStatus}".`)
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

  const getPartnerStatusBadge = (status: PartnershipStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 ring-blue-200'
      case 'Support Confirmed':
        return 'bg-teal-50 text-teal-800 ring-teal-200'
      case 'Discussion Started':
        return 'bg-purple-50 text-purple-700 ring-purple-200'
      case 'Interested':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-100 text-slate-600 ring-slate-200'
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Partner Problem Review · ${report.track_id}`}
    >
      <div className="space-y-6">
        {/* Dynamic Toast Feedback inside Modal */}
        {notification && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-900 shadow-sm animate-in fade-in">
            <Sparkles size={14} className="text-amber-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Header Badges: Category, Urgency, Gov Status, Partner Status */}
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
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${getPartnerStatusBadge(
                partnerStatus
              )}`}
            >
              Partner: {partnerStatus}
            </span>
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
              onClick={handleToggleSupported}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                supported
                  ? 'border-[#187e8d] bg-teal-50 text-[#12365a] shadow-sm'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Handshake
                size={13}
                className={supported ? 'text-[#187e8d]' : 'text-slate-400'}
              />
              <span>{supported ? 'In Supported Projects' : 'Support Project'}</span>
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

        {/* Partner Collaboration Status & Commitment Card */}
        {supported && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-950">
                <Zap size={14} className="text-[#187e8d]" />
                Partnership Status &amp; Support Commitment
              </h4>
              <button
                type="button"
                onClick={() => onOpenCollabModal && onOpenCollabModal(report)}
                className="rounded-lg border border-[#187e8d] bg-white px-2.5 py-1 text-xs font-bold text-[#187e8d] hover:bg-teal-50"
              >
                {partnership ? 'Edit Commitment' : 'Add Commitment'}
              </button>
            </div>

            {/* Status Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Update Status:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    'Discussion Started',
                    'Support Confirmed',
                    'In Progress',
                    'Completed',
                  ] as PartnershipStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      partnerStatus === s
                        ? s === 'Completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : s === 'In Progress'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-[#187e8d] text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s === 'Completed' && <CheckCircle2 size={12} className="inline mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Commitment Details Box */}
            <div className="rounded-lg border border-teal-100 bg-white p-3 text-xs space-y-2">
              {partnership ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <span className="font-semibold text-slate-500">Partner Organization:</span>
                    <p className="font-bold text-slate-800">{partnership.organizationName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Support Type:</span>
                    <p className="font-bold text-[#187e8d]">{partnership.supportType}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="font-semibold text-slate-500">Support Commitment:</span>
                    <p className="font-semibold text-slate-900 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                      {partnership.supportCommitment}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Contact Person:</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" />
                      {partnership.contactPerson}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Contact Email:</span>
                    <p className="font-medium text-slate-800 flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      {partnership.contactEmail}
                    </p>
                  </div>
                  {partnership.notes && (
                    <div className="sm:col-span-2 pt-1 border-t border-slate-100">
                      <span className="font-semibold text-slate-500">Partnership Notes:</span>
                      <p className="italic text-slate-700 mt-0.5">&ldquo;{partnership.notes}&rdquo;</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between py-1">
                  <p className="text-slate-500">
                    No formalized commitment logged yet. Add your pledge to confirm support.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenCollabModal && onOpenCollabModal(report)}
                    className="font-bold text-[#187e8d] hover:underline"
                  >
                    + Add commitment
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Problem Description & Context */}
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-slate-400" />
              Problem Description &amp; Context
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

        {/* Location & GPS Coordinates */}
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
              <span className="font-semibold text-slate-500">Locality / Village:</span>
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
          userRole="partner"
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

        {/* Client-Side Note */}
        <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
          <p className="text-[11px] leading-relaxed text-blue-800">
            Partner collaboration data is stored in your local academic workspace context. Live citizen problems are synced in real time from the state PostgreSQL repository.
          </p>
        </div>

        {/* Timestamps & Actions Footer */}
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
            {!supported ? (
              <button
                type="button"
                onClick={handleToggleSupported}
                className="rounded-lg bg-[#187e8d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#136672]"
              >
                <Handshake size={13} className="inline mr-1.5" />
                Support This Project
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenCollabModal && onOpenCollabModal(report)}
                className="rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
              >
                <Handshake size={13} className="inline mr-1.5" />
                {partnership ? 'Manage Partnership' : 'Add Commitment'}
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
