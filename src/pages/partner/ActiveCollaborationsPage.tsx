import { useState } from 'react'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Milestone,
  MessageSquare,
  PenTool,
  Send,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { PartnerStatusBadge } from '../../components/partner/PartnerStatusBadge'
import { activeCollaborations as initialCollaborations } from '../../data/activeCollaborations'
import type { ActiveCollaboration } from '../../types'

export function ActiveCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<ActiveCollaboration[]>(initialCollaborations)
  const [selectedCollab, setSelectedCollab] = useState<ActiveCollaboration | null>(null)

  // Modals state
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false)
  const [contributionModalOpen, setContributionModalOpen] = useState(false)
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)

  // Form states
  const [updatedContribution, setUpdatedContribution] = useState('')
  const [teamMessage, setTeamMessage] = useState('')
  const [progressNote, setProgressNote] = useState('')
  const [newProgress, setNewProgress] = useState(50)
  const [expandedCommId, setExpandedCommId] = useState<string | null>('ac1')
  const [inlineReplies, setInlineReplies] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<string | null>(null)

  // Handlers
  const handleOpenMilestones = (c: ActiveCollaboration) => {
    setSelectedCollab(c)
    setMilestonesModalOpen(true)
  }

  const handleOpenContribution = (c: ActiveCollaboration) => {
    setSelectedCollab(c)
    setUpdatedContribution(c.contribution)
    setContributionModalOpen(true)
  }

  const handleSaveContribution = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollab) return
    setCollaborations((prev) =>
      prev.map((item) =>
        item.id === selectedCollab.id ? { ...item, contribution: updatedContribution, lastUpdate: 'Just now' } : item
      )
    )
    setContributionModalOpen(false)
    setFeedback(`Contribution details for "${selectedCollab.projectTitle}" successfully updated.`)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleOpenMessage = (c: ActiveCollaboration) => {
    setSelectedCollab(c)
    setTeamMessage('')
    setMessageModalOpen(true)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollab || !teamMessage.trim()) return
    setMessageModalOpen(false)
    setFeedback(`Message sent to ${selectedCollab.universityRepresentative} and the project team.`)
    setTeamMessage('')
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleOpenProgress = (c: ActiveCollaboration) => {
    setSelectedCollab(c)
    setNewProgress(c.progress)
    setProgressNote('')
    setProgressModalOpen(true)
  }

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCollab) return
    setCollaborations((prev) =>
      prev.map((item) =>
        item.id === selectedCollab.id
          ? { ...item, progress: newProgress, lastUpdate: 'Just now' }
          : item
      )
    )
    setProgressModalOpen(false)
    setFeedback(`Progress update logged for "${selectedCollab.projectTitle}". Stage progress updated to ${newProgress}%.`)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleSendInlineReply = (collabId: string) => {
    const text = inlineReplies[collabId]?.trim()
    if (!text) return
    const currentCount = collaborations.find((c) => c.id === collabId)?.communications?.length ?? 0
    const newMsg = {
      id: `msg-${collabId}-${currentCount + 1}`,
      sender: 'CivicGrid Partner Lead',
      role: 'Corporate Partner Lead',
      message: text,
      timestamp: 'Just now',
    }
    setCollaborations((prev) =>
      prev.map((item) =>
        item.id === collabId
          ? { ...item, communications: [...(item.communications ?? []), newMsg] }
          : item
      )
    )
    setInlineReplies((prev) => ({ ...prev, [collabId]: '' }))
    setFeedback('Message posted to project communication thread.')
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <PartnerLayout title="Contributions">
      <PartnerPage
        title="Contributions"
        description="Monitor ongoing partnerships, track milestones, and coordinate resource deployments."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Contributions' },
        ]}
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

          <div className="grid gap-6">
            {collaborations.map((collab) => (
              <article
                key={collab.id}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300"
              >
                {/* Top header row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold text-[#187e8d]">
                        {collab.collaborationType}
                      </span>
                      <PartnerStatusBadge status={collab.status ?? 'Active'} />
                    </div>
                    <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                      {collab.projectTitle}
                    </h3>
                    <p className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 size={13} className="text-[#187e8d]" />
                      <span className="font-semibold text-slate-700">{collab.university}</span>
                    </p>
                  </div>

                  {/* Progress percentage meter */}
                  <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Stage Progress</span>
                      <p className="font-[Manrope] text-2xl font-black text-[#187e8d]">
                        {collab.progress}%
                      </p>
                    </div>
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#187e8d]"
                        style={{ width: `${collab.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key metadata grid */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs text-slate-600">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">
                      Representatives & Leads
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      <strong>Partner:</strong> {collab.partnerRepresentative}
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      <strong>University:</strong> {collab.universityRepresentative}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">
                      Project Stage & Schedule
                    </p>
                    <p className="mt-1 font-medium text-slate-800">
                      Current Stage: <span className="font-bold text-[#187e8d]">{collab.stage}</span>
                    </p>
                    <p className="mt-0.5 text-slate-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {collab.startDate} — {collab.expectedCompletion}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2 lg:col-span-1">
                    <p className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">
                      Next Milestone Target
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 line-clamp-2">
                      {collab.nextMilestone}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Last update: {collab.lastUpdate ?? 'Recent'}
                    </p>
                  </div>
                </div>

                {/* Partner Role and Resources Committed */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
                    <strong className="text-slate-700">Resources Committed:</strong>{' '}
                    <span className="text-slate-600">{collab.contribution}</span>
                  </div>
                  {collab.partnerResponsibility && (
                    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xs">
                      <strong className="text-slate-700">Partner Role & Responsibilities:</strong>{' '}
                      <span className="text-slate-600">{collab.partnerResponsibility}</span>
                    </div>
                  )}
                </div>

                {/* Upcoming Activities Section */}
                {collab.upcomingActivities && collab.upcomingActivities.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#187e8d]" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Upcoming Activities & Field Syncs
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {collab.upcomingActivities.length} scheduled
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                      {collab.upcomingActivities.map((act) => (
                        <div key={act.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                          <div className="flex items-center justify-between gap-1">
                            <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-[#187e8d]">
                              {act.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{act.date}</span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-slate-800 line-clamp-1">{act.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500 truncate">Lead: {act.owner}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communication Section */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#187e8d]" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Communication Section
                      </h4>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {collab.communications?.length ?? 0} messages
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedCommId(expandedCommId === collab.id ? null : collab.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#187e8d] hover:underline"
                    >
                      {expandedCommId === collab.id ? 'Collapse Thread' : 'Expand Thread'}
                      {expandedCommId === collab.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {expandedCommId === collab.id && (
                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                        {(collab.communications ?? []).map((msg) => {
                          const isPartner = msg.role.includes('Partner')
                          return (
                            <div
                              key={msg.id}
                              className={`rounded-lg p-3 ${
                                isPartner
                                  ? 'ml-6 bg-teal-50/70 border border-teal-100'
                                  : 'mr-6 bg-slate-50 border border-slate-200/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 text-[11px]">
                                <span className="font-bold text-slate-800">
                                  {msg.sender} <span className="font-normal text-slate-500">({msg.role})</span>
                                </span>
                                <span className="text-slate-400">{msg.timestamp}</span>
                              </div>
                              <p className="mt-1 text-slate-700 leading-relaxed">{msg.message}</p>
                            </div>
                          )
                        })}
                      </div>

                      {/* Inline quick reply input */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type a coordination update or query for the project team..."
                          value={inlineReplies[collab.id] ?? ''}
                          onChange={(e) => setInlineReplies({ ...inlineReplies, [collab.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSendInlineReply(collab.id)
                            }
                          }}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendInlineReply(collab.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                        >
                          <Send size={12} />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {collab.projectId && (
                      <Link
                        to={`/partner/projects/${collab.projectId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ExternalLink size={13} />
                        View Project
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenMilestones(collab)}
                      className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-[#e8f5f5] px-3 py-1.5 text-xs font-bold text-[#187e8d] hover:bg-teal-100"
                    >
                      <Milestone size={13} />
                      View Milestones
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenContribution(collab)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <PenTool size={13} />
                      Update Contribution
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProgress(collab)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                    >
                      <Clock size={13} />
                      Submit Progress Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenMessage(collab)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <MessageSquare size={13} />
                      Message Team
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 1. View Milestones Modal */}
        {milestonesModalOpen && selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setMilestonesModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Milestone size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Project Milestones
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-sm">
                    {selectedCollab.projectTitle}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 max-h-80 overflow-y-auto pr-1">
                {(selectedCollab.milestones ?? [
                  { title: 'Requirement baseline & team setup', dueDate: '15 Jul 2026', completed: true },
                  { title: 'Component bench testing & firmware v1.0', dueDate: '20 Aug 2026', completed: true },
                  { title: 'Field trial at 5 pilot kiosks', dueDate: '30 Sep 2026', completed: false },
                  { title: 'Civic authority evaluation & report', dueDate: '15 Nov 2026', completed: false },
                ]).map((m, idx) => (
                  <div
                    key={m.title}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-xs ${
                      m.completed
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span
                      className={`grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                        m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${m.completed ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {m.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Target: {m.dueDate}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.completed ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setMilestonesModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Update Contribution Modal */}
        {contributionModalOpen && selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setContributionModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <PenTool size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Update Committed Contribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust resource quantities, engineering hours, or hardware scopes.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveContribution} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Contribution Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={updatedContribution}
                    onChange={(e) => setUpdatedContribution(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContributionModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Message Project Team Modal */}
        {messageModalOpen && selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setMessageModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <MessageSquare size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Message Project Lead
                  </h3>
                  <p className="text-xs text-slate-500">
                    To: {selectedCollab.universityRepresentative} ({selectedCollab.university})
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={teamMessage}
                    onChange={(e) => setTeamMessage(e.target.value)}
                    placeholder="Share updates, coordinate sync calls, or ask milestone questions..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessageModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <Send size={13} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Submit Progress Update Modal */}
        {progressModalOpen && selectedCollab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setProgressModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Clock size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Submit Progress Update
                  </h3>
                  <p className="text-xs text-slate-500">
                    Log partner milestone accomplishment and update progress percentage.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProgress} className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <label>Updated Completion Progress</label>
                    <span className="text-[#187e8d]">{newProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={newProgress}
                    onChange={(e) => setNewProgress(Number(e.target.value))}
                    className="mt-2 w-full accent-[#187e8d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Progress Notes / Deliverables Completed
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={progressNote}
                    onChange={(e) => setProgressNote(e.target.value)}
                    placeholder="e.g. Conducted 40 hours of FreeRTOS code review. Sensor sleep current confirmed down to 14uA."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setProgressModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Log Progress Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PartnerPage>
    </PartnerLayout>
  )
}