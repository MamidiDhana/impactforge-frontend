import { useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  FileSearch,
  Handshake,
  Layers,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { PartnerStats } from '../../components/partner/PartnerStats'
import { ContributionSummary } from '../../components/partner/ContributionSummary'
import { ProjectRecommendationCard } from '../../components/partner/ProjectRecommendationCard'
import { ExpressInterestModal } from '../../components/partner/ExpressInterestModal'
import { SectionHeader } from '../../components/common/SectionHeader'
import { QuickActionCard } from '../../components/dashboard/QuickActionCard'
import { partnerOrganization } from '../../data/partnerOrganization'
import { partnerProjects } from '../../data/partnerProjects'
import { activeCollaborations } from '../../data/activeCollaborations'
import { partnerRequests } from '../../data/partnerRequests'
import type { PartnerProject, PartnerCollaborationRequest } from '../../types'

export function PartnerDashboardPage() {
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<PartnerProject | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  const handleExpressInterest = (project: PartnerProject) => {
    setSelectedProject(project)
    setModalOpen(true)
  }

  const handleInterestSubmitted = (req: PartnerCollaborationRequest) => {
    setFeedbackMessage(`Your collaboration offer for "${req.projectTitle}" has been logged as Pending Review.`)
    setTimeout(() => setFeedbackMessage(null), 5000)
  }

  // Recommended preview projects (top 3)
  const topRecommendations = partnerProjects.slice(0, 3)

  // Recent Collaboration Activity
  const collaborationActivities = [
    {
      id: 'act1',
      title: 'New collaboration request received',
      desc: 'Dr. Kavya Shah (TISS) requested technical review for Rural Clinic Tele-Triage.',
      time: '2 hours ago',
      icon: Handshake,
      badge: 'Incoming',
      badgeColor: 'bg-sky-50 text-sky-700',
    },
    {
      id: 'act2',
      title: 'Collaboration request accepted',
      desc: 'COEP accepted the ₹3.5L CSR funding grant for Offline Digital STEM Library.',
      time: 'Yesterday',
      icon: CheckCircle2,
      badge: 'Accepted',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'act3',
      title: 'Resource contribution updated',
      desc: 'Added 15 Industrial Water Quality Sensor Bundles to Solar Water Monitoring Pilot.',
      time: '2 days ago',
      icon: Layers,
      badge: 'Inventory',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      id: 'act4',
      title: 'Project milestone completed',
      desc: 'NITK student team completed Milestone 2: Solar enclosure weatherproofing.',
      time: '3 days ago',
      icon: FileCheck,
      badge: 'Milestone',
      badgeColor: 'bg-teal-50 text-teal-700',
    },
    {
      id: 'act5',
      title: 'Impact report submitted & audited',
      desc: 'Bhubaneswar School Crossings certified with zero collisions over 6 months.',
      time: '5 days ago',
      icon: Calendar,
      badge: 'Verified',
      badgeColor: 'bg-purple-50 text-purple-700',
    },
  ]

  return (
    <PartnerLayout title="Partner">
      <PartnerPage
        title="Partner"
        description="Contribute resources and support projects"
        breadcrumbs={[{ label: 'Partner' }]}
      >
        <div className="space-y-8">
          {feedbackMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in duration-200"
            >
              <CheckCircle2 size={18} className="text-emerald-600" />
              {feedbackMessage}
            </div>
          )}

          {/* 1. Welcome Section */}
          <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-bold text-[#187e8d]">
                    <Building2 size={14} />
                    {partnerOrganization.name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {partnerOrganization.type} Partner
                  </span>
                </div>
                <h2 className="font-[Manrope] text-lg sm:text-xl font-bold text-[#13243b]">
                  Empower Academic Innovations That Drive Ground-Level Impact
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Welcome back! Your organization can discover validated community challenges, review university requirements, sponsor hardware, offer technical expertise, and monitor measurable beneficiary outcomes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/partner/recommended-projects')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1a4a7a]"
                >
                  <FileSearch size={16} />
                  Explore Projects
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/partner/resources')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Layers size={16} />
                  Manage Resources
                </button>
              </div>
            </div>
          </section>

          {/* 2. Summary Cards */}
          <section>
            <SectionHeader
              title="Overview & Key Metrics"
              description="Real-time summary of your engagement across the ImpactForge network."
            />
            <PartnerStats
              recommendedCount={partnerProjects.length}
              pendingRequestsCount={partnerRequests.filter((r) => r.status.includes('Pending') || r.status.includes('Sent')).length}
              activeCollaborationsCount={activeCollaborations.length}
              supportedProjectsCount={3}
              resourcesContributedCount={9}
              communitiesReachedCount="41,400"
              onCardClick={(type) => {
                if (type === 'recommended') navigate('/partner/recommended-projects')
                if (type === 'pending') navigate('/partner/collaboration-requests')
                if (type === 'active') navigate('/partner/active-collaborations')
                if (type === 'supported') navigate('/partner/supported-projects')
                if (type === 'resources') navigate('/partner/resources')
                if (type === 'communities') navigate('/partner/impact')
              }}
            />
          </section>

          {/* 3. Recommended Projects Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <SectionHeader
                  title="Recommended Projects for Your Organization"
                  description="Validated university projects matching your civic technology and telemetry capabilities."
                />
              </div>
              <Link
                to="/partner/recommended-projects"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
              >
                View all ({partnerProjects.length})
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* AI Disclaimer Notice */}
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-teal-200 bg-[#e8f5f5]/60 p-3 text-xs text-slate-700">
              <Sparkles size={16} className="shrink-0 text-[#187e8d]" />
              <span>
                <strong>AI-assisted recommendation</strong> — final participation decision belongs to the partner.
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topRecommendations.map((project) => (
                <ProjectRecommendationCard
                  key={project.id}
                  project={project}
                  onExpressInterest={handleExpressInterest}
                />
              ))}
            </div>
          </section>

          {/* 4. Active Collaborations Preview & Activity Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Partnerships preview */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness size={18} className="text-[#187e8d]" />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Active Collaborations
                  </h3>
                </div>
                <Link
                  to="/partner/active-collaborations"
                  className="text-xs font-bold text-[#187e8d] hover:underline"
                >
                  View all ({activeCollaborations.length})
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {activeCollaborations.map((collab) => (
                  <div
                    key={collab.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-[#13243b]">
                          {collab.projectTitle}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {collab.university} · Stage: <span className="font-medium text-slate-700">{collab.stage}</span>
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        {collab.progress}%
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[240px]">
                        Next: {collab.nextMilestone}
                      </span>
                      <Link
                        to="/partner/active-collaborations"
                        className="font-semibold text-[#187e8d] hover:underline flex items-center gap-1"
                      >
                        Track <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Collaboration Activity Feed */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#187e8d]" />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Collaboration Activity Feed
                  </h3>
                </div>
                <Link
                  to="/partner/notifications"
                  className="text-xs font-bold text-[#187e8d] hover:underline"
                >
                  Activity history
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {collaborationActivities.map((act) => {
                  const Icon = act.icon
                  return (
                    <div key={act.id} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-slate-50 transition-colors">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{act.title}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${act.badgeColor}`}>
                            {act.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{act.desc}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* 5. Contribution Summary Section */}
          <section>
            <ContributionSummary
              funding="₹12.4 Lakhs"
              equipment="35 Sensor Bundles"
              technicalHours="680 Hours"
              mentorshipSessions="42 Sessions"
              fieldSupport="18 Field Days"
            />
          </section>

          {/* Quick Actions */}
          <section>
            <SectionHeader title="Partner Workflows" description="Fast access to key partner tools and tasks." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickActionCard
                title="Discover Projects"
                description="Explore projects filtered by capability gaps."
                icon={FileSearch}
                onClick={() => navigate('/partner/recommended-projects')}
              />
              <QuickActionCard
                title="Review Requests"
                description="Respond to incoming and pending collaboration requests."
                icon={Handshake}
                onClick={() => navigate('/partner/collaboration-requests')}
              />
              <QuickActionCard
                title="Resource Inventory"
                description="Allocate equipment, credits, or staff hours."
                icon={Layers}
                onClick={() => navigate('/partner/resources')}
              />
              <QuickActionCard
                title="Impact Dashboard"
                description="Analyze reached communities and verified metrics."
                icon={CheckCircle2}
                onClick={() => navigate('/partner/impact')}
              />
            </div>
          </section>
        </div>

        {/* Express Interest Modal */}
        <ExpressInterestModal
          open={modalOpen}
          project={selectedProject}
          onClose={() => {
            setModalOpen(false)
            setSelectedProject(null)
          }}
          onSubmit={handleInterestSubmitted}
        />
      </PartnerPage>
    </PartnerLayout>
  )
}