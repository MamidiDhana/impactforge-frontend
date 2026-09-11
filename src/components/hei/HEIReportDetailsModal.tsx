import {
  X,
  MapPin,
  Calendar,
  FileText,
  Navigation,
  Clock,
  ShieldCheck,
  Star,
  FolderPlus,
  FolderCheck,
  Building2,
} from 'lucide-react'
import type { BackendReportResponse } from '../../services/reportService'
import { StatusBadge } from '../common/StatusBadge'
import { useHEI } from '../../context/HEIContext'
import { CapabilityRequirementsCard } from '../common/CapabilityRequirementsCard'
import { HEIMatchingCard } from '../common/HEIMatchingCard'
import { FacultyMatchingCard } from '../common/FacultyMatchingCard'
import { StudentMatchingCard } from '../common/StudentMatchingCard'
import { CapabilityGapCard } from '../common/CapabilityGapCard'
import { PartnerMatchingCard } from '../common/PartnerMatchingCard'
import { DynamicRematchingCard } from '../common/DynamicRematchingCard'
import { ProjectImpactAnalyticsCard } from '../common/ProjectImpactAnalyticsCard'


interface HEIReportDetailsModalProps {
  report: BackendReportResponse | null
  onClose: () => void
  onToggleInterested?: (trackId: string) => void
  onToggleProject?: (trackId: string) => void
}

export function HEIReportDetailsModal({
  report,
  onClose,
  onToggleInterested,
  onToggleProject,
}: HEIReportDetailsModalProps) {
  const { isInterested, toggleInterested, isInProjects, toggleProject } = useHEI()

  if (!report) return null

  const interested = isInterested(report.track_id)
  const inProject = isInProjects(report.track_id)

  const handleInterestClick = () => {
    toggleInterested(report.track_id)
    if (onToggleInterested) onToggleInterested(report.track_id)
  }

  const handleProjectClick = () => {
    toggleProject(report.track_id)
    if (onToggleProject) onToggleProject(report.track_id)
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      if (isNaN(d.getTime())) return isoString
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const getUrgencyTone = (urgency: string) => {
    const u = urgency.toLowerCase()
    if (u === 'critical' || u === 'high') {
      return 'bg-red-50 text-red-700 ring-red-200'
    }
    if (u === 'medium') {
      return 'bg-amber-50 text-amber-700 ring-amber-200'
    }
    return 'bg-slate-100 text-slate-700 ring-slate-200'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hei-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">
              {report.track_id}
            </span>
            <StatusBadge status={report.status as any} />
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getUrgencyTone(
                report.priority
              )}`}
            >
              {report.priority} Urgency
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Category */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#187e8d]">
              {report.category}
            </span>
            <h2 id="hei-details-title" className="mt-1 font-[Manrope] text-xl font-bold text-[#13243b]">
              {report.problem_title}
            </h2>
          </div>

          {/* HEI Action Banner inside details modal */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div>
              <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Building2 size={15} className="text-emerald-700" />
                <span>Institutional Collaboration Actions</span>
              </h3>
              <p className="mt-0.5 text-[11px] text-emerald-800">
                Mark interest to mobilize student and faculty research teams for this Jharkhand community challenge.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInterestClick}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95 ${
                  interested
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                <Star size={14} className={interested ? 'fill-current' : ''} />
                <span>{interested ? 'Interested (Selected)' : 'Mark as Interested'}</span>
              </button>

              <button
                type="button"
                onClick={handleProjectClick}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95 ${
                  inProject
                    ? 'bg-[#12365a] text-white hover:bg-[#1a4a7a]'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-[#12365a] hover:bg-slate-50'
                }`}
              >
                {inProject ? <FolderCheck size={14} /> : <FolderPlus size={14} />}
                <span>{inProject ? 'In HEI Projects' : 'Add to HEI Projects'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-[#187e8d]" />
              <span>Complete Problem Description</span>
            </h3>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {report.context_and_desired_outcome || 'No detailed description provided.'}
            </p>
          </div>

          {/* AI Capability Requirements (Phase 1 Part 5) */}
          <CapabilityRequirementsCard report={report} />

          {/* AI Higher Education Institution (HEI) Matching (Phase 1 Part 6) */}
          <HEIMatchingCard report={report} />

          {/* AI Faculty & Mentor Matching (Phase 1 Part 7) */}
          <FacultyMatchingCard report={report} />

          {/* AI Student Project Matching (Phase 1 Part 7) */}
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
            userRole="hei"
          />

          {/* AI Project & Impact Analytics (Phase 1 Part 11) */}
          <ProjectImpactAnalyticsCard
            analytics={report.ai_project_analytics}
            trackId={report.track_id}
            status={report.ai_project_analytics_status || 'completed'}
          />


          {/* Expected Outcome & Existing Efforts */}
          {(report.expected_outcome || report.existing_efforts) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {report.existing_efforts && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500">Existing Local Efforts</h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {report.existing_efforts}
                  </p>
                </div>
              )}
              {report.expected_outcome && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500">Expected Outcome</h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    {report.expected_outcome}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Location Details Grid */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin size={14} className="text-[#187e8d]" />
              <span>Reported Location</span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-700">
              <div>
                <span className="font-semibold text-slate-400">District:</span>
                <p className="mt-0.5 font-bold text-[#13243b]">{report.district}, {report.state}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400">Locality / Ward:</span>
                <p className="mt-0.5 font-bold text-[#13243b]">{report.locality || 'Not specified'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-400">Landmark / Address:</span>
                <p className="mt-0.5 font-bold text-[#13243b]">{report.address_or_landmark || 'Not specified'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-400">GPS Coordinates:</span>
                {report.latitude !== null && report.longitude !== null ? (
                  <p className="mt-0.5 font-mono font-semibold text-emerald-700 flex items-center gap-1">
                    <Navigation size={13} />
                    <span>Latitude: {report.latitude}, Longitude: {report.longitude}</span>
                  </p>
                ) : (
                  <p className="mt-0.5 text-slate-400 italic">
                    Coordinates not selected on map (null)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Timestamps */}
          <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#187e8d]" />
              <span>
                Reported On: <strong className="text-slate-800">{formatDate(report.created_at)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#187e8d]" />
              <span>
                Last Updated: <strong className="text-slate-800">{formatDate(report.updated_at)}</strong>
              </span>
            </div>
          </div>

          {/* Official Remarks Section (Requirement 7 & 12) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <ShieldCheck size={14} className="text-[#187e8d]" />
              <span>Official Remarks</span>
            </h3>
            {report.official_remarks ? (
              <p className="mt-2 text-xs text-slate-800 leading-relaxed font-medium">
                {report.official_remarks}
              </p>
            ) : (
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                <p className="font-semibold text-slate-600">No official remarks recorded yet.</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Note: The current backend report schema stores status updates. Custom official remarks will be displayed here once an official remarks field is added to the backend model.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
