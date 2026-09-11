import { useState } from 'react'
import {
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  MapPin,
  Quote,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { EmptyState } from '../../components/common/EmptyState'
import { supportedProjects as initialCompletedProjects } from '../../data/supportedProjects'
import { activeCollaborations } from '../../data/activeCollaborations'
import type { SupportedProject } from '../../types'

type ProjectTab = 'All' | 'Ongoing' | 'Completed'

export function SupportedProjectsPage() {
  const [activeTab, setActiveTab] = useState<ProjectTab>('All')
  const [selectedReport, setSelectedReport] = useState<SupportedProject | null>(null)

  // Map active collaborations into unified supported projects format
  const ongoingProjects: SupportedProject[] = activeCollaborations.map((collab) => ({
    id: `ongoing-${collab.id}`,
    projectId: collab.projectId,
    projectTitle: collab.projectTitle,
    problemTitle: 'Community co-innovation and telemetry initiative',
    university: collab.university,
    location: 'Karnataka / Maharashtra',
    completionDate: `Target: ${collab.nextMilestone || 'Q4 2026'}`,
    impactStatus: 'Ongoing Active Support',
    supportProvided: collab.collaborationType,
    partnerContribution: collab.contribution,
    outcomes: `Milestone stage progress at ${collab.progress}%. Active engineering and advisory sprints.`,
    beneficiaries: collab.progress * 250,
    communitiesReached: 4,
    reportData: {
      summary: `Active institutional partnership with ${collab.university}. Next milestone: ${collab.nextMilestone}.`,
      keyMetrics: [
        { label: 'Progress', value: `${collab.progress}%` },
        { label: 'Next Milestone', value: collab.nextMilestone },
      ],
      testimonial: {
        quote: 'The active engineering mentorship is accelerating our student sprint deliverables on schedule.',
        author: collab.universityRepresentative,
        role: 'University Project Lead',
      },
    },
  }))

  const allProjects = [...initialCompletedProjects, ...ongoingProjects]

  const filteredProjects = allProjects.filter((project) => {
    if (activeTab === 'Ongoing') return project.impactStatus.includes('Ongoing')
    if (activeTab === 'Completed') return !project.impactStatus.includes('Ongoing')
    return true
  })

  return (
    <PartnerLayout title="Documents">
      <PartnerPage
        title="Documents"
        description="Monitor co-innovations and review audited impact results and project documentation."
        breadcrumbs={[
          { label: 'Industry Partnerships', href: '/partner/dashboard' },
          { label: 'Documents' },
        ]}
      >
        <div className="space-y-6">

          {/* Stats Summary Bar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Supported Projects
              </p>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                {allProjects.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#187e8d]">
                Ongoing Active Support
              </p>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#187e8d]">
                {ongoingProjects.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Completed & Verified
              </p>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-emerald-700">
                {initialCompletedProjects.length}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            {(['All', 'Ongoing', 'Completed'] as ProjectTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-[#12365a] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab === 'All'
                  ? `All Projects (${allProjects.length})`
                  : tab === 'Ongoing'
                  ? `Ongoing Supported (${ongoingProjects.length})`
                  : `Completed Supported (${initialCompletedProjects.length})`}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No projects match this filter"
              description="Switch tabs to see ongoing or completed projects."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const isOngoing = project.impactStatus.includes('Ongoing')

                return (
                  <article
                    key={project.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                            isOngoing
                              ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isOngoing ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                          {project.impactStatus}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar size={12} />
                          {project.completionDate}
                        </span>
                      </div>

                      <h3 className="mt-3 font-[Manrope] text-base font-bold text-[#13243b]">
                        {project.projectTitle}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                        Problem: {project.problemTitle}
                      </p>

                      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#187e8d] shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">
                            {project.university}
                          </span>
                        </p>
                        {project.location && (
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={13} className="shrink-0" />
                            <span>{project.location}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                        <p>
                          <strong className="text-slate-700">Support Provided:</strong>{' '}
                          {project.supportProvided}
                        </p>
                        {project.partnerContribution && (
                          <p>
                            <strong className="text-slate-700">Resources Contributed:</strong>{' '}
                            {project.partnerContribution}
                          </p>
                        )}
                        <p className="text-[#187e8d] font-semibold">
                          <strong>Project Outcomes:</strong> {project.outcomes}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-[#187e8d]" />
                          {(project.beneficiaries ?? 8500).toLocaleString()} Beneficiaries
                        </span>
                        <span className="flex items-center gap-1">
                          <Award size={13} className="text-amber-600" />
                          {project.communitiesReached} Reached
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(project)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#12365a] py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                      >
                        <FileCheck size={14} />
                        Impact Summary
                      </button>
                      {isOngoing && (
                        <Link
                          to="/partner/active-collaborations"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          title="Manage Active Collaboration"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Detailed Impact Report Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Award size={24} />
                </span>
                <div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {selectedReport.impactStatus}
                  </span>
                  <h3 className="font-[Manrope] text-xl font-bold text-[#13243b]">
                    {selectedReport.projectTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedReport.university} · {selectedReport.location}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs text-slate-600">
                <div className="rounded-xl bg-slate-50 p-4 space-y-2">
                  <p>
                    <strong className="text-slate-800">Challenge Addressed:</strong>{' '}
                    {selectedReport.problemTitle}
                  </p>
                  <p>
                    <strong className="text-slate-800">Support & Mentorship Provided:</strong>{' '}
                    {selectedReport.supportProvided}
                  </p>
                  <p>
                    <strong className="text-slate-800">Resources Contributed:</strong>{' '}
                    {selectedReport.partnerContribution}
                  </p>
                  <p>
                    <strong className="text-slate-800">Timeline:</strong> Completed{' '}
                    {selectedReport.completionDate}
                  </p>
                  {selectedReport.impactResult && (
                    <p>
                      <strong className="text-slate-800">Impact Result:</strong>{' '}
                      {selectedReport.impactResult}
                    </p>
                  )}
                </div>

                {selectedReport.reportData?.summary && (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Implementation Summary & Results:</h4>
                    <p className="leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      {selectedReport.reportData.summary}
                    </p>
                  </div>
                )}

                {selectedReport.reportData?.testimonial && (
                  <div className="rounded-xl border border-teal-100 bg-[#e8f5f5]/50 p-4 italic text-slate-700">
                    <Quote size={18} className="text-[#187e8d] mb-1 opacity-60" />
                    "{selectedReport.reportData.testimonial.quote}"
                    <p className="mt-2 not-italic font-bold text-slate-800 text-[11px]">
                      — {selectedReport.reportData.testimonial.author} ({selectedReport.reportData.testimonial.role})
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg border border-slate-100 p-3 text-center">
                    <p className="text-slate-400">Total Beneficiaries</p>
                    <p className="mt-1 font-[Manrope] text-lg font-bold text-[#13243b]">
                      {(selectedReport.beneficiaries ?? 8500).toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 p-3 text-center">
                    <p className="text-slate-400">Habitations Reached</p>
                    <p className="mt-1 font-[Manrope] text-lg font-bold text-[#187e8d]">
                      {selectedReport.communitiesReached}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </PartnerPage>
    </PartnerLayout>
  )
}