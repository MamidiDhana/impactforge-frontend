import { useState } from 'react'
import {
  X,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  FileText,
  ExternalLink,
  Loader2,
  Tag,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProjectStatusBadge } from '../projects/ProjectStatusBadge'
import { ProjectProgress } from '../projects/ProjectProgress'
import { ProjectImpactAnalyticsCard } from '../common/ProjectImpactAnalyticsCard'
import type { BackendReportResponse } from '../../services/reportService'
import type { LiveGovernmentProject } from '../../pages/government/GovernmentProjectsPage'

interface GovernmentProjectDetailsModalProps {
  project: LiveGovernmentProject | null
  onClose: () => void
  onUpdateStatus?: (trackId: string, newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Rejected') => Promise<void>
  isUpdatingStatus?: boolean
}

export function GovernmentProjectDetailsModal({
  project,
  onClose,
  onUpdateStatus,
  isUpdatingStatus = false,
}: GovernmentProjectDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'Open' | 'In Progress' | 'Resolved' | 'Rejected' | ''>('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!project) return null

  const report: BackendReportResponse = project.rawReport

  const handleStatusChangeSubmit = async () => {
    if (!selectedStatus || selectedStatus === report.status || !onUpdateStatus) return
    setLocalError(null)
    try {
      await onUpdateStatus(project.id, selectedStatus)
      setSuccessMsg(`Project status successfully updated to "${selectedStatus}".`)
      setSelectedStatus('')
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update project status')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-[#12365a] px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                <Tag size={12} /> {project.id}
              </span>
              <ProjectStatusBadge status={project.status} />
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Stage: {project.stage}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {project.category}
              </span>
            </div>
            <h2 id="project-modal-title" className="mt-2 font-[Manrope] text-xl font-bold text-[#13243b] leading-tight">
              {project.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Community Challenge: <span className="font-semibold text-slate-700">{project.problemTitle}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Feedback Messages */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {localError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-800">
              {localError}
            </div>
          )}

          {/* Project Progress & Lifecycle Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">Project Implementation Progress</span>
              <span className="font-bold text-[#187e8d]">{project.progress}% Complete</span>
            </div>
            <ProjectProgress percentage={project.progress} currentStage={project.stage} />
            <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
              <span>Current Milestone: <b className="text-slate-700">{project.currentMilestone}</b></span>
              <span>Updated: <b className="text-slate-700">{project.lastUpdated}</b></span>
            </div>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Building2 size={14} className="text-[#187e8d]" />
                Lead Organization
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2">{project.organization}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin size={14} className="text-[#187e8d]" />
                Location
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {project.district ? `${project.district}, Jharkhand` : 'Jharkhand'}
                {project.locality ? ` (${project.locality})` : ''}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Users size={14} className="text-[#187e8d]" />
                Beneficiaries
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {project.beneficiaries.toLocaleString()} estimated
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar size={14} className="text-[#187e8d]" />
                Reported
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {new Date(report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Description & Problem Context */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <FileText size={14} className="text-[#187e8d]" />
              <span>Project Problem Statement & Context</span>
            </h3>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {project.description || 'No detailed problem description provided.'}
            </p>
          </div>

          {/* Expected Outcome and Existing Efforts */}
          {(report.expected_outcome || report.existing_efforts) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {report.existing_efforts && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500">Existing Community Efforts</h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{report.existing_efforts}</p>
                </div>
              )}
              {report.expected_outcome && (
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500">Desired Community Outcome</h4>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">{report.expected_outcome}</p>
                </div>
              )}
            </div>
          )}

          {/* AI Project and Impact Analytics Card */}
          <section>
            <div className="mb-2">
              <h3 className="text-sm font-bold text-[#13243b]">AI Project Feasibility & Impact Analytics</h3>
              <p className="text-xs text-slate-500">Live predictive scoring and resource estimates from existing database models.</p>
            </div>
            <ProjectImpactAnalyticsCard
              analytics={report.ai_project_analytics}
              trackId={project.id}
              status={report.ai_project_analytics_status || 'completed'}
            />
          </section>

          {/* Status Update Control */}
          {onUpdateStatus && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Update Live Project Status
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Current status in PostgreSQL database: <span className="font-bold text-slate-700">{report.status}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  disabled={isUpdatingStatus}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] disabled:opacity-50"
                >
                  <option value="">Select new status...</option>
                  <option value="Open">Open (Pending)</option>
                  <option value="In Progress">In Progress (Active Pilot)</option>
                  <option value="Resolved">Resolved (Completed)</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={handleStatusChangeSubmit}
                  disabled={!selectedStatus || selectedStatus === report.status || isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#187e8d] transition disabled:opacity-40"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Updating Database...</span>
                    </>
                  ) : (
                    <span>Save Status</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5 gap-3">
          <Link
            to={`/government/problems/${project.id}/review`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#12365a] px-3.5 py-1.5 text-xs font-semibold text-[#12365a] hover:bg-slate-100 transition"
          >
            <span>Open Problem Review</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
