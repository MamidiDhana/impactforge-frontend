import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Handshake,
  HeartHandshake,
  HelpCircle,
  Layers,
  MapPin,
  MessageSquare,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { ExpressInterestModal } from '../../components/partner/ExpressInterestModal'
import { EmptyState } from '../../components/common/EmptyState'
import { partnerProjects } from '../../data/partnerProjects'
import type { PartnerCollaborationRequest } from '../../types'

export function PartnerProjectDetailsPage() {
  const { id } = useParams()
  const project = partnerProjects.find((item) => item.id === id) || partnerProjects[0]

  // Local state
  const [isSaved, setIsSaved] = useState(false)
  const [interestModalOpen, setInterestModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoQuestion, setInfoQuestion] = useState('')
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!project) {
    return (
      <PartnerLayout title="Project Not Found">
        <PartnerPage title="Project Not Found">
          <EmptyState
            title="Project not found"
            action={
              <Link
                to="/partner/recommended-projects"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-semibold text-white"
              >
                Back to Recommended Projects
              </Link>
            }
          />
        </PartnerPage>
      </PartnerLayout>
    )
  }

  const handleInterestSubmitted = (req: PartnerCollaborationRequest) => {
    setFeedback(`Collaboration offer successfully submitted as "${req.status}". Notification sent to ${project.facultyLead}.`)
    setTimeout(() => setFeedback(null), 6000)
  }

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!infoQuestion.trim()) return
    setFeedback(`Information inquiry sent to ${project.facultyLead} at ${project.university}. You will receive a notification when they reply.`)
    setInfoQuestion('')
    setInfoModalOpen(false)
    setTimeout(() => setFeedback(null), 6000)
  }

  const toggleSave = () => {
    const next = !isSaved
    setIsSaved(next)
    setFeedback(next ? `Project "${project.title}" saved to your organization bookmarks.` : 'Project removed from bookmarks.')
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <PartnerLayout title={project.title}>
      <PartnerPage
        title={project.title}
        description="Comprehensive project overview, problem context, academic leads, and resource gaps."
        breadcrumbs={[
          { label: 'Industry Partnerships', href: '/partner/dashboard' },
          { label: 'Matches', href: '/partner/recommended-projects' },
          { label: 'Project Details' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSave}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                isSaved
                  ? 'border-teal-300 bg-[#e8f5f5] text-[#187e8d]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              {isSaved ? 'Saved to Bookmarks' : 'Save Project'}
            </button>
            <button
              type="button"
              onClick={() => setInterestModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
            >
              <HeartHandshake size={15} />
              Express Interest
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Top Banner: Stage, Match %, and University */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#187e8d]">
                    {project.category}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    Stage: {project.stage}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-[#187e8d]">
                    <Sparkles size={13} />
                    {project.match}% AI Match
                  </span>
                </div>
                <h1 className="font-[Manrope] text-2xl font-extrabold text-[#13243b]">
                  {project.title}
                </h1>
                <p className="text-sm text-slate-600 max-w-3xl">
                  {project.description}
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-1.5 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-xs text-slate-400 font-medium">Overall Progress</span>
                <span className="font-[Manrope] text-2xl font-black text-[#187e8d]">
                  {project.progress}%
                </span>
                <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#187e8d]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1">
                  Updated {project.lastUpdated}
                </span>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                  <Building2 size={16} />
                </span>
                <div>
                  <p className="text-slate-400">Host Institution</p>
                  <p className="font-semibold text-slate-800 truncate">{project.university}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <GraduationCap size={16} />
                </span>
                <div>
                  <p className="text-slate-400">Faculty Lead</p>
                  <p className="font-semibold text-slate-800">{project.facultyLead}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-purple-50 text-purple-700">
                  <Users size={16} />
                </span>
                <div>
                  <p className="text-slate-400">Student Team</p>
                  <p className="font-semibold text-slate-800">{project.studentTeam}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <MapPin size={16} />
                </span>
                <div>
                  <p className="text-slate-400">Field Location</p>
                  <p className="font-semibold text-slate-800">{project.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Problem & Project Goals vs Partner Requirements */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Details, Goals, Timeline */}
            <div className="space-y-6 lg:col-span-2">
              {/* Problem Statement Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Community Problem Addressed
                  </h3>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Validated Need
                  </span>
                </div>
                <h4 className="mt-4 font-bold text-slate-800 text-sm">
                  {project.problemTitle}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {project.problemDescription ?? project.description}
                </p>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <span>
                    Expected Beneficiaries: <strong>{project.beneficiaries.toLocaleString()} citizens</strong>
                  </span>
                  <Link
                    to="/problems"
                    className="font-semibold text-[#187e8d] hover:underline inline-flex items-center gap-1"
                  >
                    View Community Problem <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Project Goals & Outcomes */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Project Goals & Deliverables
                </h3>
                <div className="mt-4 space-y-2.5">
                  {(project.projectGoals ?? [
                    'Develop low-power sensor kiosk hardware with solar battery backup',
                    'Implement secure cellular/LoRa telemetry ingestion protocol',
                    'Conduct community pilot validation with local civic authorities',
                  ]).map((goal) => (
                    <div key={goal} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-teal-100 bg-[#e8f5f5]/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#187e8d]">
                    Expected Measurable Outcome
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {project.expectedOutcome}
                  </p>
                </div>
              </div>

              {/* Timeline & Existing Partners */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Expected Timeline & Existing Network
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar size={13} />
                    {project.expectedTimeline ?? 'August 2026 - March 2027'}
                  </span>
                </div>

                {/* Stages visualization */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {['Proposal', 'Team Formation', 'Prototype', 'Pilot'].map((stg) => {
                    const isPassed =
                      (project.stage === 'Prototype' && (stg === 'Proposal' || stg === 'Team Formation' || stg === 'Prototype')) ||
                      (project.stage === 'Pilot') ||
                      (project.stage === stg)
                    return (
                      <div
                        key={stg}
                        className={`rounded-lg p-3 border font-semibold ${
                          isPassed
                            ? 'border-teal-200 bg-[#e8f5f5] text-[#187e8d]'
                            : 'border-slate-100 bg-slate-50 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 size={14} className="mx-auto mb-1 opacity-70" />
                        {stg}
                      </div>
                    )
                  })}
                </div>

                {project.existingPartners && project.existingPartners.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-700">Existing Civic / Institutional Partners:</strong>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {project.existingPartners.map((part) => (
                        <span
                          key={part}
                          className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Required Capabilities, Gap Analysis, & Actions */}
            <div className="space-y-6">
              {/* Partner Match & Capability Gaps Card */}
              <div className="rounded-xl border border-teal-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#187e8d]" />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    AI Match & Capability Gaps
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  How your organization profile fulfills the university team's needs.
                </p>

                <div className="mt-4 rounded-lg bg-teal-50/70 p-3.5 border border-teal-100 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#187e8d]">
                    <span>High Affinity Score</span>
                    <span>{project.match}% Match</span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Matches your listed strengths in <strong>{project.requiredSupport.slice(0, 2).join(', ')}</strong>.
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Required Support Areas
                      </h4>
                      <span className="text-[10px] text-[#187e8d] font-semibold">Click to inspect</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.requiredSupport.map((req) => (
                        <button
                          key={req}
                          type="button"
                          onClick={() => setSelectedCapability(req)}
                          className="rounded-md bg-slate-100 hover:bg-teal-50 hover:text-[#187e8d] hover:border-teal-200 border border-transparent px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors text-left"
                        >
                          {req}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Required Resources & Tools
                    </h4>
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {project.requiredResources.map((res) => (
                        <p key={res} className="flex items-center gap-2">
                          <Layers size={13} className="text-[#187e8d] shrink-0" />
                          <span>{res}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Identified Capability Gaps
                      </h4>
                      <span className="text-[10px] text-amber-700 font-semibold">Click to open</span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-xs text-amber-800">
                      {project.capabilityGaps.map((gap) => (
                        <button
                          key={gap}
                          type="button"
                          onClick={() => setSelectedCapability(gap)}
                          className="w-full text-left rounded-md bg-amber-50 hover:bg-amber-100/70 p-2.5 border border-amber-200/60 transition-colors flex items-center justify-between gap-2"
                        >
                          <span>{gap}</span>
                          <span className="text-[10px] font-bold text-amber-700 underline shrink-0">Details</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setInterestModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#12365a] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1a4a7a]"
                  >
                    <HeartHandshake size={16} />
                    Express Interest
                  </button>

                  <button
                    type="button"
                    onClick={() => setInterestModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#12365a] py-2.5 text-xs font-bold text-[#12365a] hover:bg-slate-50"
                  >
                    <Handshake size={14} />
                    Request Collaboration
                  </button>

                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <HelpCircle size={14} />
                    Request More Information
                  </button>
                </div>
              </div>

              {/* Contact Lead Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-xs">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#d9eeee] font-bold text-[#12365a]">
                    {project.facultyLead.charAt(3) || 'D'}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800">{project.facultyLead}</h4>
                    <p className="text-slate-500">{project.university}</p>
                  </div>
                </div>
                <p className="mt-3 text-slate-600">
                  Have quick questions about project feasibility, student IP agreements, or field deployment requirements?
                </p>
                <button
                  type="button"
                  onClick={() => setInfoModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#187e8d] hover:underline"
                >
                  <MessageSquare size={13} />
                  Message Lead Directly
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              to="/partner/recommended-projects"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              Back to all recommended projects
            </Link>
          </div>
        </div>

        {/* Express Interest / Offer Support Modal */}
        <ExpressInterestModal
          open={interestModalOpen}
          project={project}
          onClose={() => setInterestModalOpen(false)}
          onSubmit={handleInterestSubmitted}
        />

        {/* Request More Information Modal */}
        {infoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <HelpCircle size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Request More Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct inquiry to {project.facultyLead}
                  </p>
                </div>
              </div>

              <form onSubmit={handleInfoSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    What information or clarification do you need?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoQuestion}
                    onChange={(e) => setInfoQuestion(e.target.value)}
                    placeholder="e.g. Could you share the electrical pinout of the water sensor board, or clarify whether field travel costs are covered under university grants?"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Send Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Capability Details Modal */}
        {selectedCapability && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedCapability(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Sparkles size={20} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#187e8d]">
                    Capability Requirement Dossier
                  </span>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    {selectedCapability}
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3.5 text-xs text-slate-600">
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-700">Role in Project Architecture:</p>
                  <p className="leading-relaxed">
                    Essential for bridging student prototype validation with civic-grade deployment standards for <strong>{project.title}</strong>.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="font-bold text-slate-500 uppercase text-[10px]">Required Domain Skill</p>
                    <p className="mt-1 font-semibold text-slate-800">Advanced Industry Proficiency</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="font-bold text-slate-500 uppercase text-[10px]">Partner Match Status</p>
                    <p className="mt-1 font-semibold text-emerald-700">Fulfills Stated Need</p>
                  </div>
                </div>

                <div className="rounded-lg bg-[#e8f5f5]/60 p-3.5 border border-teal-100">
                  <p className="font-bold text-[#187e8d]">Suggested Partner Contribution:</p>
                  <p className="mt-1 text-slate-700 leading-relaxed">
                    Provide specialized engineering mentorship, tooling access, or equipment grants aligned with {selectedCapability}.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedCapability(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCapability(null)
                    setInterestModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <HeartHandshake size={14} />
                  Offer Support for this Capability
                </button>
              </div>
            </div>
          </div>
        )}
      </PartnerPage>
    </PartnerLayout>
  )
}