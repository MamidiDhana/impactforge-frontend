import { useState } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Filter,
  Handshake,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ProjectLayout } from '../../layouts/ProjectLayout'
import { Modal } from '../../components/common/Modal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { TextAreaField } from '../../components/forms/TextAreaField'

import { workspaceProjects } from '../../data/workspaceProjects'
import { workspaceTeamMembers as initialTeamMembers } from '../../data/workspaceTeamMembers'
import { workspaceMilestones as initialMilestones } from '../../data/workspaceMilestones'
import { workspaceTasks as initialTasks } from '../../data/workspaceTasks'
import { workspaceDocuments as initialDocuments } from '../../data/workspaceDocuments'
import { workspaceDiscussions as initialDiscussions } from '../../data/workspaceDiscussions'
import { workspaceCapabilityGaps as initialGaps, type ExtendedCapabilityGap } from '../../data/workspaceCapabilityGaps'
import { workspacePartners } from '../../data/workspacePartners'
import { workspaceFeedback } from '../../data/workspaceFeedback'
import { collaborationRequests as initialCollabRequests } from '../../data/collaborationRequests'
import type {
  CollaborationRequest,
  ProjectDiscussion,
  ProjectWorkspaceDocument,
  ProjectWorkspaceMember,
  ProjectWorkspaceMilestone,
  ProjectWorkspaceTask,
} from '../../types'

const projectStages = [
  'Proposal',
  'Team Formation',
  'Development',
  'Prototype',
  'Testing',
  'Pilot',
  'Deployment',
  'Impact Tracking',
]

export function ProjectWorkspacePage({ section }: { section: string }) {
  const { id } = useParams()
  const project = workspaceProjects.find((item) => item.id === id) ?? workspaceProjects[0]

  // Shared interactive state
  const [teamMembers, setTeamMembers] = useState<ProjectWorkspaceMember[]>(initialTeamMembers)
  const [milestones, setMilestones] = useState<ProjectWorkspaceMilestone[]>(initialMilestones)
  const [tasks, setTasks] = useState<ProjectWorkspaceTask[]>(initialTasks)
  const [documents, setDocuments] = useState<ProjectWorkspaceDocument[]>(initialDocuments)
  const [discussions, setDiscussions] = useState<ProjectDiscussion[]>(initialDiscussions)
  const [gaps, setGaps] = useState<ExtendedCapabilityGap[]>(initialGaps)
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>(initialCollabRequests)
  const [impactMetrics, setImpactMetrics] = useState({
    beneficiaries: project.beneficiaries,
    villagesReached: 6,
    activeSensors: 14,
    fluorideReductionsPercent: 82,
  })

  // UI interaction states
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [removeId, setRemoveId] = useState<{ type: 'member' | 'doc' | 'task'; id: string } | null>(null)
  const [previewDoc, setPreviewDoc] = useState<ProjectWorkspaceDocument | null>(null)
  const [selectedGap, setSelectedGap] = useState<ExtendedCapabilityGap | null>(null)
  const [assignMember, setAssignMember] = useState<ProjectWorkspaceMember | null>(null)

  // Modals state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false)
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const showToast = (text: string) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Handle deletions
  const handleConfirmDelete = () => {
    if (!removeId) return
    if (removeId.type === 'member') {
      setTeamMembers((curr) => curr.filter((m) => m.id !== removeId.id))
      showToast('Team member removed from workspace.')
    } else if (removeId.type === 'doc') {
      setDocuments((curr) => curr.filter((d) => d.id !== removeId.id))
      showToast('Document removed from repository.')
    } else if (removeId.type === 'task') {
      setTasks((curr) => curr.filter((t) => t.id !== removeId.id))
      showToast('Task removed from sprint backlog.')
    }
    setRemoveId(null)
  }

  return (
    <ProjectLayout project={project} section={section}>
      {toastMessage && (
        <div
          role="status"
          className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {section === 'overview' && (
          <OverviewSection
            project={project}
            milestones={milestones}
            setMilestones={setMilestones}
            tasks={tasks}
            setTasks={setTasks}
            teamMembers={teamMembers}
            documents={documents}
            gaps={gaps}
            collabRequests={collabRequests}
            setCollabRequests={setCollabRequests}
            discussions={discussions}
            setDiscussions={setDiscussions}
            impactMetrics={impactMetrics}
            onOpenMilestoneModal={() => setIsMilestoneModalOpen(true)}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
            onOpenDocModal={() => setIsDocModalOpen(true)}
            onOpenGapDetails={(gap) => setSelectedGap(gap)}
            onAssignMember={(m) => setAssignMember(m)}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
            onOpenImpactModal={() => setIsImpactModalOpen(true)}
            showToast={showToast}
          />
        )}

        {section === 'team' && (
          <TeamSection
            teamMembers={teamMembers}
            onAssignMember={(m) => setAssignMember(m)}
            onRemoveMember={(id) => setRemoveId({ type: 'member', id })}
            onInviteOpen={() => setIsInviteModalOpen(true)}
          />
        )}

        {section === 'milestones' && (
          <MilestonesSection
            milestones={milestones}
            setMilestones={setMilestones}
            onOpenAdd={() => setIsMilestoneModalOpen(true)}
            showToast={showToast}
          />
        )}

        {section === 'tasks' && (
          <TasksSection
            tasks={tasks}
            setTasks={setTasks}
            onOpenAdd={() => setIsTaskModalOpen(true)}
            onDeleteTask={(id) => setRemoveId({ type: 'task', id })}
            showToast={showToast}
          />
        )}

        {section === 'documents' && (
          <DocumentsSection
            documents={documents}
            onOpenUpload={() => setIsDocModalOpen(true)}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
            onDeleteDoc={(id) => setRemoveId({ type: 'doc', id })}
          />
        )}

        {section === 'discussions' && (
          <DiscussionsSection
            discussions={discussions}
            setDiscussions={setDiscussions}
            onOpenNew={() => setIsDiscussionModalOpen(true)}
            showToast={showToast}
          />
        )}

        {section === 'capability-gaps' && (
          <CapabilityGapsSection
            gaps={gaps}
            setGaps={setGaps}
            onOpenDetails={(gap) => setSelectedGap(gap)}
            showToast={showToast}
          />
        )}

        {section === 'partners' && (
          <PartnersSection
            collabRequests={collabRequests}
            setCollabRequests={setCollabRequests}
            showToast={showToast}
          />
        )}

        {section === 'feedback' && <FeedbackSection />}

        {section === 'impact' && (
          <ImpactSection
            impactMetrics={impactMetrics}
            onOpenEdit={() => setIsImpactModalOpen(true)}
          />
        )}
      </div>

      {/* Confirmation Dialog for Deletions */}
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Confirm Removal"
        description="Are you sure you want to remove this item from the mock workspace? This simulation can be reloaded anytime."
        destructive
        confirmLabel="Remove"
        onCancel={() => setRemoveId(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Add Milestone Modal */}
      <AddMilestoneModal
        open={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        onSubmit={(newM) => {
          setMilestones([newM, ...milestones])
          showToast(`Milestone "${newM.title}" added to roadmap.`)
        }}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={isTaskModalOpen}
        teamMembers={teamMembers}
        milestones={milestones}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={(newTask) => {
          setTasks([newTask, ...tasks])
          showToast(`Task "${newTask.title}" assigned successfully.`)
        }}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        open={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={(newDoc) => {
          setDocuments([newDoc, ...documents])
          showToast(`Document "${newDoc.name}" uploaded.`)
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        showToast={showToast}
      />

      {/* Capability Gap Details Modal */}
      <GapDetailsModal
        gap={selectedGap}
        onClose={() => setSelectedGap(null)}
        onResolve={(id) => {
          setGaps((curr) => curr.map((g) => (g.id === id ? { ...g, status: 'Resolved' } : g)))
          setSelectedGap((prev) => (prev ? { ...prev, status: 'Resolved' } : null))
          showToast('Capability gap marked as resolved.')
        }}
        onRequestPartner={(id) => {
          setGaps((curr) => curr.map((g) => (g.id === id ? { ...g, status: 'In Review' } : g)))
          setSelectedGap((prev) => (prev ? { ...prev, status: 'In Review' } : null))
          showToast('Collaboration request sent to matching partners.')
        }}
      />

      {/* Assign Member Responsibility Modal */}
      <AssignResponsibilityModal
        member={assignMember}
        onClose={() => setAssignMember(null)}
        onSave={(updatedMember) => {
          setTeamMembers((curr) =>
            curr.map((m) => (m.id === updatedMember.id ? updatedMember : m))
          )
          setAssignMember(null)
          showToast(`Responsibilities updated for ${updatedMember.name}.`)
        }}
      />

      {/* New Discussion Modal */}
      <NewDiscussionModal
        open={isDiscussionModalOpen}
        onClose={() => setIsDiscussionModalOpen(false)}
        onSubmit={(newDisc) => {
          setDiscussions([newDisc, ...discussions])
          showToast(`Discussion topic "${newDisc.title}" created.`)
        }}
      />

      {/* Edit Impact Metrics Modal */}
      <EditImpactModal
        open={isImpactModalOpen}
        currentMetrics={impactMetrics}
        onClose={() => setIsImpactModalOpen(false)}
        onSave={(newMetrics) => {
          setImpactMetrics(newMetrics)
          setIsImpactModalOpen(false)
          showToast('Impact metrics updated.')
        }}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={(newMember) => {
          setTeamMembers([...teamMembers, newMember])
          showToast(`Invited ${newMember.name} to project team.`)
        }}
      />
    </ProjectLayout>
  )
}

/* ========================================================================= */
/* 1. OVERVIEW SECTION (All 13 Requirements from user request)                */
/* ========================================================================= */
interface OverviewProps {
  project: typeof workspaceProjects[0]
  milestones: ProjectWorkspaceMilestone[]
  setMilestones: React.Dispatch<React.SetStateAction<ProjectWorkspaceMilestone[]>>
  tasks: ProjectWorkspaceTask[]
  setTasks: React.Dispatch<React.SetStateAction<ProjectWorkspaceTask[]>>
  teamMembers: ProjectWorkspaceMember[]
  documents: ProjectWorkspaceDocument[]
  gaps: ExtendedCapabilityGap[]
  collabRequests: CollaborationRequest[]
  setCollabRequests: React.Dispatch<React.SetStateAction<CollaborationRequest[]>>
  discussions: ProjectDiscussion[]
  setDiscussions: React.Dispatch<React.SetStateAction<ProjectDiscussion[]>>
  impactMetrics: {
    beneficiaries: number
    villagesReached: number
    activeSensors: number
    fluorideReductionsPercent: number
  }
  onOpenMilestoneModal: () => void
  onOpenTaskModal: () => void
  onOpenDocModal: () => void
  onOpenGapDetails: (gap: ExtendedCapabilityGap) => void
  onAssignMember: (m: ProjectWorkspaceMember) => void
  onPreviewDoc: (doc: ProjectWorkspaceDocument) => void
  onOpenImpactModal: () => void
  showToast: (text: string) => void
}

function OverviewSection({
  project,
  milestones,
  setMilestones,
  tasks,
  setTasks,
  teamMembers,
  documents,
  gaps,
  collabRequests,
  setCollabRequests,
  discussions,
  setDiscussions,
  impactMetrics,
  onOpenMilestoneModal,
  onOpenTaskModal,
  onOpenDocModal,
  onOpenGapDetails,
  onAssignMember,
  onPreviewDoc,
  onOpenImpactModal,
  showToast,
}: OverviewProps) {
  const [newComment, setNewComment] = useState('')

  const facultyMentor = teamMembers.find((m) => m.role.toLowerCase().includes('faculty')) ?? teamMembers[0]

  const handleToggleMilestone = (id: string, nextStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setMilestones((curr) =>
      curr.map((m) => {
        if (m.id !== id) return m
        const progress =
          nextStatus === 'Completed' ? 100 : nextStatus === 'In Progress' ? (m.progress === 0 ? 50 : m.progress) : 0
        return { ...m, status: nextStatus, progress }
      })
    )
    showToast(`Milestone status updated to ${nextStatus}`)
  }

  const handleToggleTask = (id: string) => {
    setTasks((curr) =>
      curr.map((t) => {
        if (t.id !== id) return t
        const isComplete = t.status === 'Completed'
        const nextStatus = isComplete ? 'In Progress' : 'Completed'
        return { ...t, status: nextStatus }
      })
    )
    showToast('Task completion status updated.')
  }

  const handleAcceptRequest = (id: string) => {
    setCollabRequests((curr) =>
      curr.map((r) => (r.id === id ? { ...r, status: 'Accepted' } : r))
    )
    showToast('Collaboration offer accepted. Partner added to project team.')
  }

  const handleDeclineRequest = (id: string) => {
    setCollabRequests((curr) =>
      curr.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    )
    showToast('Collaboration offer declined.')
  }

  const handlePostQuickComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const commentObj = {
      id: `c-${Date.now()}`,
      author: 'Dr. Meera Nair (Faculty Lead)',
      text: newComment.trim(),
      timestamp: 'Just now',
    }

    setDiscussions((curr) => {
      if (curr.length === 0) {
        return [
          {
            id: `d-${Date.now()}`,
            title: 'Project Status & Weekly Updates',
            author: 'Dr. Meera Nair',
            timestamp: 'Just now',
            pinned: true,
            comments: [commentObj],
          },
        ]
      }
      return curr.map((d, index) =>
        index === 0 ? { ...d, comments: [...d.comments, commentObj] } : d
      )
    })

    setNewComment('')
    showToast('Project update published.')
  }

  return (
    <div className="space-y-8">
      {/* 1. Project Title & Problem Statement + Status Badges */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-bold text-[#187e8d]">
                {project.category}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                Health: {project.health}
              </span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Stage: {project.stage}
              </span>
              <span className="text-xs text-slate-400">ID: {project.id}</span>
            </div>

            <h1 className="mt-3 font-[Manrope] text-2xl font-extrabold text-[#13243b] sm:text-3xl">
              {project.name}
            </h1>
            <p className="mt-2 text-base font-semibold text-[#187e8d]">
              Validated Problem: {project.problemTitle}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {project.description}
            </p>

            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <span className="text-slate-400">Host University:</span>
                <p className="font-semibold text-slate-800">{project.university}</p>
              </div>
              <div>
                <span className="text-slate-400">Location:</span>
                <p className="font-semibold text-slate-800">{project.location}</p>
              </div>
              <div>
                <span className="text-slate-400">Timeline:</span>
                <p className="font-semibold text-slate-800">
                  {project.startDate} - {project.expectedCompletion}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Direct Beneficiaries:</span>
                <p className="font-semibold text-slate-800">
                  {project.beneficiaries.toLocaleString()} residents
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Progress Percentage & Timeline Stepper */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              Project Progress & Development Timeline
            </h2>
            <p className="text-xs text-slate-500">
              Stages follow the standardized ImpactForge civic engineering lifecycle.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-[#187e8d]">{project.progress}%</span>
            <span className="text-xs font-semibold text-slate-500">Milestone Completion</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#187e8d] to-[#12365a] transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>

        {/* 8-Stage Timeline */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {projectStages.map((stage, idx) => {
            const currentStageIndex = projectStages.indexOf(project.stage)
            const isCompleted = idx < currentStageIndex
            const isCurrent = idx === currentStageIndex

            return (
              <div
                key={stage}
                className={`flex flex-col items-center rounded-xl p-3 text-center text-xs transition ${
                  isCurrent
                    ? 'border-2 border-[#187e8d] bg-[#e8f5f5] font-bold text-[#12365a] shadow-sm'
                    : isCompleted
                    ? 'border border-emerald-200 bg-emerald-50/70 text-emerald-800'
                    : 'border border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div
                  className={`mb-2 grid size-7 place-items-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#187e8d] text-white shadow-sm'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : idx + 1}
                </div>
                <span className="leading-tight">{stage}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Faculty Mentor & Team Members Highlight */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Faculty Mentor Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <UserCheck className="text-[#187e8d]" size={20} />
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">Faculty Mentor</h2>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-[#12365a] font-[Manrope] text-lg font-bold text-white shadow">
              {facultyMentor.name.charAt(3) || 'M'}
            </span>
            <div>
              <h3 className="font-bold text-[#13243b]">{facultyMentor.name}</h3>
              <p className="text-xs text-slate-500">{facultyMentor.role}</p>
              <p className="text-xs text-slate-400">{facultyMentor.organization}</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">
            {facultyMentor.responsibility}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {facultyMentor.skills.map((s) => (
              <span key={s} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Office Hours: <strong className="text-slate-700">Mon & Wed, 3:00 - 5:00 PM</strong>
          </div>
        </section>

        {/* Team Members Roster */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Team Members & Responsibilities
              </h2>
              <p className="text-xs text-slate-500">
                {teamMembers.length} active researchers, engineers, and field specialists.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAssignMember(teamMembers[1])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users size={14} />
              Assign Roles
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {teamMembers.slice(1, 5).map((member) => (
              <article
                key={member.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#13243b]">{member.name}</h3>
                    <p className="text-xs text-[#187e8d]">{member.role}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {member.availability}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                  {member.responsibility}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {member.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Milestones with Status: Pending, In Progress, Completed */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              Milestones Roadmap
            </h2>
            <p className="text-xs text-slate-500">
              Interactive deliverables with live status toggling (Pending, In Progress, Completed).
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenMilestoneModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0e2a47]"
          >
            <Plus size={14} />
            Add Milestone
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {milestones.map((m) => {
            const isCompleted = m.status === 'Completed'
            const isInProgress = m.status === 'In Progress'
            const isPending = !isCompleted && !isInProgress

            return (
              <div
                key={m.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-[#13243b]">{m.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : isInProgress
                          ? 'bg-cyan-50 text-cyan-800'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{m.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Due: {m.dueDate}
                    </span>
                    <span>Assigned: {m.assignedMembers.join(', ')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <span className="text-xs font-bold text-[#187e8d]">{m.progress}% complete</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(m.id, 'Pending')}
                      disabled={isPending}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(m.id, 'In Progress')}
                      disabled={isInProgress}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        isInProgress
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(m.id, 'Completed')}
                      disabled={isCompleted}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Check size={12} />
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 5. Tasks & Responsibilities (interactive toggle) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              Tasks & Responsibilities
            </h2>
            <p className="text-xs text-slate-500">
              Click checkboxes or action buttons to update completion state.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTaskModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0e2a47]"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {tasks.map((task) => {
            const isCompleted = task.status === 'Completed'
            return (
              <div
                key={task.id}
                className={`flex items-start justify-between rounded-xl border p-4 transition ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id)}
                    className={`mt-0.5 grid size-5 place-items-center rounded border transition ${
                      isCompleted
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    aria-label={`Toggle task completion for ${task.title}`}
                  >
                    {isCompleted && <Check size={12} />}
                  </button>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isCompleted ? 'text-slate-500 line-through' : 'text-[#13243b]'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">{task.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{task.assignedMember}</span>
                      <span>·</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    task.priority === 'Critical'
                      ? 'bg-rose-50 text-rose-700'
                      : task.priority === 'High'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* 6. Project Documents & Outputs */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              Project Documents & Verified Outputs
            </h2>
            <p className="text-xs text-slate-500">
              Schematics, calibration logs, guides, and partner deliverables.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDocModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0e2a47]"
          >
            <Upload size={14} />
            Upload Document
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#13243b]">{doc.name}</h3>
                  <p className="text-xs text-slate-400">
                    {doc.type} · {doc.size} · {doc.version} · Uploaded by {doc.uploadedBy}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    doc.approvalStatus === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {doc.approvalStatus}
                </span>
                <button
                  type="button"
                  onClick={() => onPreviewDoc(doc)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Eye size={13} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Capability Gaps & 8. Collaboration Requests (Two Columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Capability Gaps */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">Capability Gaps</h2>
              <p className="text-xs text-slate-500">
                Missing skills or tooling flagged for partner collaboration.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              {gaps.filter((g) => g.status !== 'Resolved').length} Active
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {gaps.map((gap) => (
              <div
                key={gap.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-[#13243b]">{gap.required}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      gap.severity === 'Critical'
                        ? 'bg-rose-50 text-rose-700'
                        : gap.severity === 'High'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {gap.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-rose-700">Missing:</span> {gap.missing}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">Status: {gap.status}</span>
                  <button
                    type="button"
                    onClick={() => onOpenGapDetails(gap)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
                  >
                    <Eye size={12} />
                    Open Gap Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collaboration Requests */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Collaboration Requests
              </h2>
              <p className="text-xs text-slate-500">
                Industry, Startup, and CSR partner offers.
              </p>
            </div>
            <Handshake className="text-[#187e8d]" size={18} />
          </div>

          <div className="mt-4 space-y-3">
            {collabRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#13243b]">{req.organization}</h3>
                    <p className="text-xs text-[#187e8d]">{req.organizationType}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      req.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-700'
                        : req.status === 'Rejected'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-cyan-50 text-cyan-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700">
                  Offered: {req.requestedSupport}
                </p>
                <p className="mt-1 text-xs text-slate-500 italic">"{req.message}"</p>

                {req.status === 'Pending' && (
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3 py-1 text-xs font-bold text-white hover:bg-[#0e2a47]"
                    >
                      <Check size={12} />
                      Accept Offer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 9. Comments & Project Communication */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
              Project Communication & Sprint Updates
            </h2>
            <p className="text-xs text-slate-500">
              Shared discussion stream with mentors, faculty, students, and partners.
            </p>
          </div>
          <MessageSquare className="text-[#187e8d]" size={18} />
        </div>

        {/* Existing Comments Stream */}
        <div className="mt-5 space-y-4">
          {discussions.map((d) => (
            <article key={d.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#13243b]">{d.title}</h3>
                  {d.pinned && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Pinned
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{d.timestamp}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Initiated by {d.author}</p>

              {d.comments.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-[#187e8d]/30 pl-3">
                  {d.comments.map((c) => (
                    <div key={c.id} className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{c.author}</span>
                        <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Leave Project Comment / Update Form */}
        <form onSubmit={handlePostQuickComment} className="mt-5 border-t border-slate-100 pt-4">
          <label htmlFor="quick-comment-input" className="block text-xs font-bold text-slate-700 mb-1">
            Post an Update or Observation:
          </label>
          <div className="flex gap-2">
            <input
              id="quick-comment-input"
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share a sprint milestone update, field test result, or question..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0e2a47]"
            >
              <Send size={13} />
              Post Update
            </button>
          </div>
        </form>
      </section>

      {/* 10. Impact Metrics Dashboard */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">Impact Metrics</h2>
            <p className="text-xs text-slate-500">
              Verified ground outcomes reported to sponsoring government bodies and CSR partners.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenImpactModal}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Metrics
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">Direct Beneficiaries</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
              {impactMetrics.beneficiaries.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">Across rural habitations</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">Panchayat Kiosks</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
              {impactMetrics.villagesReached}
            </p>
            <p className="mt-1 text-[11px] text-[#187e8d]">Active pilot clusters</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">Installed IoT Probes</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
              {impactMetrics.activeSensors}
            </p>
            <p className="mt-1 text-[11px] text-indigo-600">Fluoride, TDS & pH units</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-500">Tox-Risk Reduction</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
              {impactMetrics.fluorideReductionsPercent}%
            </p>
            <p className="mt-1 text-[11px] text-emerald-600">Early pump shutdowns</p>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ========================================================================= */
/* 2. SUB-SECTION TABS                                                       */
/* ========================================================================= */

// TEAM SUB-SECTION
function TeamSection({
  teamMembers,
  onAssignMember,
  onRemoveMember,
  onInviteOpen,
}: {
  teamMembers: ProjectWorkspaceMember[]
  onAssignMember: (m: ProjectWorkspaceMember) => void
  onRemoveMember: (id: string) => void
  onInviteOpen: () => void
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">Project Team & Roles</h2>
          <p className="text-sm text-slate-500">
            Manage student responsibilities, mentor allocations, and external collaborator access.
          </p>
        </div>
        <button
          type="button"
          onClick={onInviteOpen}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          <Plus size={16} />
          Invite Team Member
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {teamMembers.map((member) => (
          <article
            key={member.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#e8f5f5] font-[Manrope] text-base font-bold text-[#12365a]">
                    {member.name.charAt(0)}
                  </span>
                  <div>
                    <h3 className="font-bold text-[#13243b]">{member.name}</h3>
                    <p className="text-xs text-[#187e8d] font-semibold">{member.role}</p>
                    <p className="text-xs text-slate-400">{member.organization}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  {member.availability}
                </span>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-600">
                <strong className="text-slate-700">Responsibilities: </strong>
                {member.responsibility}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onAssignMember(member)}
                className="text-xs font-bold text-[#187e8d] hover:underline"
              >
                Assign / Update Responsibility
              </button>
              <button
                type="button"
                onClick={() => onRemoveMember(member.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// MILESTONES SUB-SECTION
function MilestonesSection({
  milestones,
  setMilestones,
  onOpenAdd,
  showToast,
}: {
  milestones: ProjectWorkspaceMilestone[]
  setMilestones: React.Dispatch<React.SetStateAction<ProjectWorkspaceMilestone[]>>
  onOpenAdd: () => void
  showToast: (text: string) => void
}) {
  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All')

  const normalizeStatus = (status: string): 'Pending' | 'In Progress' | 'Completed' => {
    if (status === 'Completed') return 'Completed'
    if (status === 'In Progress') return 'In Progress'
    return 'Pending'
  }

  const filtered = milestones.filter((m) => {
    if (filter === 'All') return true
    return normalizeStatus(m.status) === filter
  })

  const handleUpdate = (id: string, nextStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setMilestones((curr) =>
      curr.map((m) => {
        if (m.id !== id) return m
        const progress =
          nextStatus === 'Completed' ? 100 : nextStatus === 'In Progress' ? (m.progress === 0 ? 50 : m.progress) : 0
        return { ...m, status: nextStatus, progress }
      })
    )
    showToast(`Milestone marked as ${nextStatus}`)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
            Milestones & Delivery Schedule
          </h2>
          <p className="text-sm text-slate-500">
            Track contractual and academic milestones with deliverables and verification criteria.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          <Plus size={16} />
          Add Milestone
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              filter === tab
                ? 'bg-[#12365a] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab} (
            {tab === 'All'
              ? milestones.length
              : milestones.filter((m) => normalizeStatus(m.status) === tab).length}
            )
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((m) => {
          const norm = normalizeStatus(m.status)
          return (
            <article
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      {m.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        norm === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : norm === 'In Progress'
                          ? 'bg-cyan-50 text-cyan-800'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {norm}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{m.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Duration: {m.startDate} - {m.dueDate} · Assigned Leads: {m.assignedMembers.join(', ')}
                  </p>
                  {m.deliverables && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.deliverables.map((d) => (
                        <span
                          key={d}
                          className="rounded bg-[#e8f5f5] px-2 py-0.5 text-[11px] font-medium text-[#187e8d]"
                        >
                          📦 {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span className="text-xs font-bold text-[#187e8d]">{m.progress}% complete</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdate(m.id, 'Pending')}
                      disabled={norm === 'Pending'}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        norm === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(m.id, 'In Progress')}
                      disabled={norm === 'In Progress'}
                      className={`rounded px-2.5 py-1 text-xs font-semibold ${
                        norm === 'In Progress'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(m.id, 'Completed')}
                      disabled={norm === 'Completed'}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold ${
                        norm === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Check size={12} />
                      Completed
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${
                    norm === 'Completed'
                      ? 'bg-emerald-600'
                      : norm === 'In Progress'
                      ? 'bg-[#187e8d]'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

// TASKS SUB-SECTION
function TasksSection({
  tasks,
  setTasks,
  onOpenAdd,
  onDeleteTask,
  showToast,
}: {
  tasks: ProjectWorkspaceTask[]
  setTasks: React.Dispatch<React.SetStateAction<ProjectWorkspaceTask[]>>
  onOpenAdd: () => void
  onDeleteTask: (id: string) => void
  showToast: (text: string) => void
}) {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const filtered = tasks.filter((t) => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.assignedMember.toLowerCase().includes(q)
    }
    return true
  })

  const toggleTask = (id: string) => {
    setTasks((curr) =>
      curr.map((t) => (t.id === id ? { ...t, status: t.status === 'Completed' ? 'In Progress' : 'Completed' } : t))
    )
    showToast('Task status updated.')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">Sprint Tasks & Workstream</h2>
          <p className="text-sm text-slate-500">
            Granular technical tickets, lab experiments, and field logistics items.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            aria-label="Filter tasks by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            aria-label="Search sprint tasks"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task title or assignee..."
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#187e8d]"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((task) => {
          const isDone = task.status === 'Completed'
          return (
            <article
              key={task.id}
              className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 grid size-5 place-items-center rounded border transition ${
                        isDone
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                      aria-label={`Toggle task completion for ${task.title}`}
                    >
                      {isDone && <Check size={12} />}
                    </button>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          isDone ? 'text-slate-400 line-through' : 'text-[#13243b]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600">{task.description}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                      task.priority === 'Critical'
                        ? 'bg-rose-50 text-rose-700'
                        : task.priority === 'High'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>
                  Lead: <strong className="text-slate-700">{task.assignedMember}</strong> · Due: {task.dueDate}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-600"
                  aria-label="Delete task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

// DOCUMENTS SUB-SECTION
function DocumentsSection({
  documents,
  onOpenUpload,
  onPreviewDoc,
  onDeleteDoc,
}: {
  documents: ProjectWorkspaceDocument[]
  onOpenUpload: () => void
  onPreviewDoc: (doc: ProjectWorkspaceDocument) => void
  onDeleteDoc: (id: string) => void
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
            Project Documents & Verified Outputs
          </h2>
          <p className="text-sm text-slate-500">
            Uploaded technical blueprints, laboratory logs, field manuals, and partner agreements.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <article
            key={doc.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="font-bold text-[#13243b]">{doc.name}</h3>
                <p className="text-xs text-slate-400">
                  {doc.type} · {doc.size} · Version {doc.version} · By {doc.uploadedBy} · {doc.uploadDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  doc.approvalStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {doc.approvalStatus}
              </span>
              <button
                type="button"
                onClick={() => onPreviewDoc(doc)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye size={13} />
                Preview
              </button>
              <button
                type="button"
                onClick={() => onDeleteDoc(doc.id)}
                className="text-slate-400 hover:text-rose-600"
                aria-label="Delete document"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// DISCUSSIONS SUB-SECTION
function DiscussionsSection({
  discussions,
  setDiscussions,
  onOpenNew,
  showToast,
}: {
  discussions: ProjectDiscussion[]
  setDiscussions: React.Dispatch<React.SetStateAction<ProjectDiscussion[]>>
  onOpenNew: () => void
  showToast: (text: string) => void
}) {
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({})

  const handleReplySubmit = (discId: string, e: React.FormEvent) => {
    e.preventDefault()
    const text = replyText[discId]?.trim()
    if (!text) return

    setDiscussions((curr) =>
      curr.map((d) => {
        if (d.id !== discId) return d
        return {
          ...d,
          comments: [
            ...d.comments,
            {
              id: `c-${Date.now()}`,
              author: 'Riya Shah (Student Lead)',
              text,
              timestamp: 'Just now',
            },
          ],
        }
      })
    )

    setReplyText({ ...replyText, [discId]: '' })
    showToast('Reply added to discussion.')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">Discussions & Notes</h2>
          <p className="text-sm text-slate-500">
            Transparent threads on engineering design decisions, field observations, and meeting minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          <Plus size={16} />
          New Discussion Topic
        </button>
      </div>

      <div className="space-y-4">
        {discussions.map((d) => (
          <article
            key={d.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">{d.title}</h3>
                {d.pinned && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    Pinned
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{d.timestamp}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Started by {d.author}</p>

            <div className="mt-4 space-y-2 border-l-2 border-[#187e8d]/30 pl-3">
              {d.comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                  <div className="flex justify-between font-bold text-[#13243b]">
                    <span>{c.author}</span>
                    <span className="text-[10px] font-normal text-slate-400">{c.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-600">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Quick reply input */}
            <form onSubmit={(e) => handleReplySubmit(d.id, e)} className="mt-4 flex gap-2">
              <input
                type="text"
                aria-label={`Reply to discussion: ${d.title}`}
                value={replyText[d.id] || ''}
                onChange={(e) => setReplyText({ ...replyText, [d.id]: e.target.value })}
                placeholder="Write a reply..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#187e8d]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0e2a47]"
              >
                Reply
              </button>
            </form>
          </article>
        ))}
      </div>
    </section>
  )
}

// CAPABILITY GAPS SUB-SECTION
function CapabilityGapsSection({
  gaps,
  setGaps,
  onOpenDetails,
  showToast,
}: {
  gaps: ExtendedCapabilityGap[]
  setGaps: React.Dispatch<React.SetStateAction<ExtendedCapabilityGap[]>>
  onOpenDetails: (gap: ExtendedCapabilityGap) => void
  showToast: (text: string) => void
}) {
  const handleResolve = (id: string) => {
    setGaps((curr) => curr.map((g) => (g.id === id ? { ...g, status: 'Resolved' } : g)))
    showToast('Capability gap marked as resolved.')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">Project Capability Gaps</h2>
          <p className="text-sm text-slate-500">
            Identified competencies required for deployment that are missing from current team roster.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {gaps.map((gap) => (
          <article
            key={gap.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-[#13243b]">{gap.required}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    gap.severity === 'Critical'
                      ? 'bg-rose-50 text-rose-700'
                      : gap.severity === 'High'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {gap.severity}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                <span className="text-slate-400">Current Level:</span> {gap.currentLevel}
              </p>
              <p className="mt-1 text-xs text-rose-700">
                <span className="text-slate-400">Missing Need:</span> {gap.missing}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                <span className="text-slate-400">Suggested Action:</span> {gap.suggestedAction}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onOpenDetails(gap)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
              >
                <Eye size={13} />
                Open Gap Details
              </button>

              {gap.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => handleResolve(gap.id)}
                  className="rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0e2a47]"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

// PARTNERS SUB-SECTION
function PartnersSection({
  collabRequests,
  setCollabRequests,
  showToast,
}: {
  collabRequests: CollaborationRequest[]
  setCollabRequests: React.Dispatch<React.SetStateAction<CollaborationRequest[]>>
  showToast: (text: string) => void
}) {
  const handleAccept = (id: string) => {
    setCollabRequests((curr) => curr.map((r) => (r.id === id ? { ...r, status: 'Accepted' } : r)))
    showToast('Partner offer accepted.')
  }

  const handleDecline = (id: string) => {
    setCollabRequests((curr) => curr.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)))
    showToast('Partner offer declined.')
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
          Project Partners & Collaboration Offers
        </h2>
        <p className="text-sm text-slate-500">
          Industry mentors, MSME fabricators, and CSR foundations supporting this initiative.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workspacePartners.map((partner) => (
          <article key={partner.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[#13243b]">{partner.organization}</h3>
                <p className="text-xs text-[#187e8d] font-semibold">{partner.type}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {partner.status}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600">Contact: {partner.contact}</p>
            <p className="mt-1 text-xs text-slate-600">Contribution: {partner.contributionType}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {partner.resources.map((r) => (
                <span key={r} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                  {r}
                </span>
              ))}
            </div>
          </article>
        ))}

        {collabRequests.map((req) => (
          <article key={req.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[#13243b]">{req.organization}</h3>
                <p className="text-xs text-[#187e8d] font-semibold">{req.organizationType}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  req.status === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-700'
                    : req.status === 'Rejected'
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {req.status}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Support: {req.requestedSupport}
            </p>
            <p className="mt-1 text-xs italic text-slate-500">"{req.message}"</p>

            {req.status === 'Pending' && (
              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleDecline(req.id)}
                  className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(req.id)}
                  className="rounded-lg bg-[#12365a] px-3 py-1 text-xs font-bold text-white hover:bg-[#0e2a47]"
                >
                  Accept Offer
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

// FEEDBACK SUB-SECTION
function FeedbackSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
          Community & Institutional Feedback
        </h2>
        <p className="text-sm text-slate-500">
          Independent ground evaluations submitted by Gram Panchayat representatives and government evaluators.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {workspaceFeedback.map((fb) => (
          <article key={fb.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#13243b]">{fb.source}</h3>
              <span className="text-amber-500">{'★'.repeat(fb.rating)}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">{fb.comments}</p>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
              Category: {fb.category} · Submitted {fb.submittedDate}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

// IMPACT SUB-SECTION
function ImpactSection({
  impactMetrics,
  onOpenEdit,
}: {
  impactMetrics: {
    beneficiaries: number
    villagesReached: number
    activeSensors: number
    fluorideReductionsPercent: number
  }
  onOpenEdit: () => void
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">Impact & Outcomes Report</h2>
          <p className="text-sm text-slate-500">
            Real-world metrics validated by community telemetry and field audits.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEdit}
          className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white hover:bg-[#0e2a47]"
        >
          Edit Impact Data
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Beneficiaries</p>
          <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
            {impactMetrics.beneficiaries.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-600">Population served</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Habitations</p>
          <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
            {impactMetrics.villagesReached}
          </p>
          <p className="mt-1 text-xs text-[#187e8d]">Kolar Panchayat clusters</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sensor Nodes</p>
          <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
            {impactMetrics.activeSensors}
          </p>
          <p className="mt-1 text-xs text-indigo-600">Continuous telemetry</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Fluoride Risk Cut</p>
          <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
            {impactMetrics.fluorideReductionsPercent}%
          </p>
          <p className="mt-1 text-xs text-emerald-600">Prevention efficacy</p>
        </div>
      </div>
    </section>
  )
}

/* ========================================================================= */
/* 3. MODALS & FORMS                                                         */
/* ========================================================================= */

// ADD MILESTONE MODAL
function AddMilestoneModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (m: ProjectWorkspaceMilestone) => void
}) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending')
  const [dueDate, setDueDate] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      id: `pm-${Date.now()}`,
      title: title.trim(),
      description: desc.trim() || 'No deliverable details provided.',
      startDate: '01 Sep 2026',
      dueDate: dueDate || '30 Oct 2026',
      status,
      progress: status === 'Completed' ? 100 : status === 'In Progress' ? 30 : 0,
      assignedMembers: ['Dr. Meera Nair', 'Riya Shah'],
      deliverables: ['Field verification report'],
      comments: 'Newly created milestone.',
    })
    onClose()
    setTitle('')
    setDesc('')
  }

  return (
    <Modal open={open} title="Add Project Milestone" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Milestone Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Solar Ingress & Gateway Enclosure Test"
        />
        <TextAreaField
          label="Description & Deliverables"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Specific requirements, deliverables, or testing standards..."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Initial Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Pending' | 'In Progress' | 'Completed')}
            options={[
              { label: 'Pending', value: 'Pending' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
            ]}
          />
          <FormField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Save Milestone
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ADD TASK MODAL
function AddTaskModal({
  open,
  teamMembers,
  milestones,
  onClose,
  onSubmit,
}: {
  open: boolean
  teamMembers: ProjectWorkspaceMember[]
  milestones: ProjectWorkspaceMilestone[]
  onClose: () => void
  onSubmit: (t: ProjectWorkspaceTask) => void
}) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [assignedMember, setAssignedMember] = useState(teamMembers[0]?.name || '')
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High')
  const [dueDate, setDueDate] = useState('')
  const [milestone, setMilestone] = useState(milestones[0]?.title || '')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      id: `pt-${Date.now()}`,
      title: title.trim(),
      description: desc.trim() || 'General task responsibility.',
      assignedMember: assignedMember || teamMembers[0]?.name,
      priority,
      dueDate: dueDate || '20 Sep 2026',
      status: 'In Progress',
      milestone: milestone || milestones[0]?.title,
      lastUpdated: 'Today',
    })
    onClose()
    setTitle('')
    setDesc('')
  }

  return (
    <Modal open={open} title="Create Sprint Task" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Task Summary"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Fabricate IP66 housing with acrylic mounting plate"
        />
        <TextAreaField
          label="Task Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Detail the technical action steps..."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Assigned Lead"
            value={assignedMember}
            onChange={(e) => setAssignedMember(e.target.value)}
            options={teamMembers.map((m) => ({ label: m.name, value: m.name }))}
          />
          <SelectField
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Critical' | 'High' | 'Medium' | 'Low')}
            options={[
              { label: 'Critical', value: 'Critical' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' },
            ]}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Related Milestone"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            options={milestones.map((m) => ({ label: m.title, value: m.title }))}
          />
          <FormField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Save Task
          </button>
        </div>
      </form>
    </Modal>
  )
}

// UPLOAD DOCUMENT MODAL
function UploadDocumentModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (doc: ProjectWorkspaceDocument) => void
}) {
  const [name, setName] = useState('')
  const [docType, setDocType] = useState('Technical Design')
  const [version, setVersion] = useState('v1.0')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      id: `pd-${Date.now()}`,
      name: name.trim().endsWith('.pdf') || name.trim().endsWith('.docx') ? name.trim() : `${name.trim()}.pdf`,
      type: docType,
      uploadedBy: 'Dr. Meera Nair (Faculty Mentor)',
      uploadDate: 'Today',
      size: '1.4 MB',
      version,
      approvalStatus: 'Pending Review',
    })
    onClose()
    setName('')
  }

  return (
    <Modal open={open} title="Upload Project Document / Output" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Document Name / Title"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Firmware_OTA_Update_Protocol.pdf"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SelectField
            label="Output Category"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            options={[
              { label: 'Problem Validation', value: 'Problem Validation' },
              { label: 'Technical Design', value: 'Technical Design' },
              { label: 'Test Report', value: 'Test Report' },
              { label: 'Field Manual / Guide', value: 'Field Manual / Guide' },
              { label: 'Partner Deliverable', value: 'Partner Deliverable' },
            ]}
          />
          <FormField
            label="Version Tag"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g., v1.1"
          />
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <Upload className="mx-auto text-slate-400" size={28} />
          <p className="mt-2 text-xs font-semibold text-slate-700">
            Drag and drop project files, or browse local system
          </p>
          <p className="mt-1 text-[11px] text-slate-400">PDF, DOCX, XLSX, or CAD files up to 25MB (Mock Storage)</p>
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Upload File
          </button>
        </div>
      </form>
    </Modal>
  )
}

// DOCUMENT PREVIEW MODAL
function DocumentPreviewModal({
  doc,
  onClose,
  showToast,
}: {
  doc: ProjectWorkspaceDocument | null
  onClose: () => void
  showToast: (text: string) => void
}) {
  if (!doc) return null

  return (
    <Modal open={Boolean(doc)} title={`Preview: ${doc.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          <span>Type: <strong>{doc.type}</strong></span>
          <span>Size: <strong>{doc.size}</strong></span>
          <span>Version: <strong>{doc.version}</strong></span>
          <span>Status: <strong className="text-emerald-700">{doc.approvalStatus}</strong></span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center">
          <FileText className="mx-auto text-[#187e8d]" size={48} />
          <p className="mt-3 font-semibold text-[#13243b]">{doc.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            Uploaded by {doc.uploadedBy} on {doc.uploadDate}
          </p>
          <p className="mt-4 text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
            This simulated document represents an approved project deliverable. In full production, this integrates with secure cloud bucket storage.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              showToast(`Simulated download for ${doc.name}`)
              onClose()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            <Download size={13} />
            Download Output
          </button>
        </div>
      </div>
    </Modal>
  )
}

// CAPABILITY GAP DETAILS MODAL
function GapDetailsModal({
  gap,
  onClose,
  onResolve,
  onRequestPartner,
}: {
  gap: ExtendedCapabilityGap | null
  onClose: () => void
  onResolve: (id: string) => void
  onRequestPartner: (id: string) => void
}) {
  if (!gap) return null

  return (
    <Modal open={Boolean(gap)} title="Capability Gap Intelligence" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#13243b]">{gap.required}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              gap.severity === 'Critical'
                ? 'bg-rose-50 text-rose-700'
                : gap.severity === 'High'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {gap.severity} Severity
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-xs space-y-2 text-slate-700">
          <div>
            <span className="text-slate-400">Current Student Competency:</span>
            <p className="font-semibold text-slate-800">{gap.currentLevel}</p>
          </div>
          <div>
            <span className="text-slate-400">Missing Competency:</span>
            <p className="font-semibold text-rose-700">{gap.missing}</p>
          </div>
          <div>
            <span className="text-slate-400">Status:</span>
            <p className="font-semibold text-[#187e8d]">{gap.status}</p>
          </div>
        </div>

        {gap.impactRisk && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <strong className="block mb-1 flex items-center gap-1">
              <ShieldAlert size={14} className="text-amber-700" />
              Impact Risk on Project Delivery:
            </strong>
            <p>{gap.impactRisk}</p>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
          <strong className="block text-slate-800 mb-1">Recommended Partner Profile:</strong>
          <p>{gap.suggestedPartnerType ?? 'Industry or Specialist Tech Partner'}</p>
          <p className="mt-2 text-slate-500">
            <strong>Suggested Action:</strong> {gap.suggestedAction}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          {gap.status !== 'Resolved' && (
            <>
              <button
                type="button"
                onClick={() => {
                  onRequestPartner(gap.id)
                  onClose()
                }}
                className="rounded-lg border border-[#187e8d] px-3.5 py-2 text-xs font-bold text-[#187e8d] hover:bg-[#e8f5f5]"
              >
                Request Partner Support
              </button>
              <button
                type="button"
                onClick={() => {
                  onResolve(gap.id)
                  onClose()
                }}
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
              >
                Mark Resolved
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ASSIGN RESPONSIBILITY MODAL
function AssignResponsibilityModal({
  member,
  onClose,
  onSave,
}: {
  member: ProjectWorkspaceMember | null
  onClose: () => void
  onSave: (updated: ProjectWorkspaceMember) => void
}) {
  const [responsibility, setResponsibility] = useState(member?.responsibility || '')
  const [availability, setAvailability] = useState(member?.availability || 'Available')

  if (!member) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...member,
      responsibility: responsibility.trim() || member.responsibility,
      availability,
    })
  }

  return (
    <Modal open={Boolean(member)} title={`Assign Responsibilities: ${member.name}`} onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <div>
          <p className="text-xs text-slate-500">Role: {member.role}</p>
          <p className="text-xs text-slate-400">{member.organization}</p>
        </div>
        <TextAreaField
          label="Assigned Project Responsibilities"
          required
          value={responsibility}
          onChange={(e) => setResponsibility(e.target.value)}
          placeholder="Detail exact workstream scope, deliverables, and field tasks..."
        />
        <SelectField
          label="Availability"
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          options={[
            { label: 'Available (Full time)', value: 'Available' },
            { label: 'Limited (Part time / exam period)', value: 'Limited' },
            { label: 'On Leave', value: 'On Leave' },
          ]}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Save Responsibility
          </button>
        </div>
      </form>
    </Modal>
  )
}

// NEW DISCUSSION MODAL
function NewDiscussionModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (disc: ProjectDiscussion) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      id: `disc-${Date.now()}`,
      title: title.trim(),
      author: 'Dr. Meera Nair (Faculty Lead)',
      timestamp: 'Today, Just now',
      pinned: false,
      comments: content.trim()
        ? [
            {
              id: `c-${Date.now()}`,
              author: 'Dr. Meera Nair',
              text: content.trim(),
              timestamp: 'Just now',
            },
          ]
        : [],
    })
    onClose()
    setTitle('')
    setContent('')
  }

  return (
    <Modal open={open} title="Start Project Discussion" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Topic Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Cellular Uplink Reliability in Kolar Habitations"
        />
        <TextAreaField
          label="Initial Message / Context"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Detail the technical dilemma or logistics question..."
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Post Topic
          </button>
        </div>
      </form>
    </Modal>
  )
}

// EDIT IMPACT MODAL
function EditImpactModal({
  open,
  currentMetrics,
  onClose,
  onSave,
}: {
  open: boolean
  currentMetrics: {
    beneficiaries: number
    villagesReached: number
    activeSensors: number
    fluorideReductionsPercent: number
  }
  onClose: () => void
  onSave: (metrics: {
    beneficiaries: number
    villagesReached: number
    activeSensors: number
    fluorideReductionsPercent: number
  }) => void
}) {
  const [beneficiaries, setBeneficiaries] = useState(String(currentMetrics.beneficiaries))
  const [villagesReached, setVillagesReached] = useState(String(currentMetrics.villagesReached))
  const [activeSensors, setActiveSensors] = useState(String(currentMetrics.activeSensors))
  const [fluorideReductionsPercent, setFluorideReductionsPercent] = useState(
    String(currentMetrics.fluorideReductionsPercent)
  )

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      beneficiaries: Number(beneficiaries) || currentMetrics.beneficiaries,
      villagesReached: Number(villagesReached) || currentMetrics.villagesReached,
      activeSensors: Number(activeSensors) || currentMetrics.activeSensors,
      fluorideReductionsPercent: Number(fluorideReductionsPercent) || currentMetrics.fluorideReductionsPercent,
    })
  }

  return (
    <Modal open={open} title="Update Verified Impact Metrics" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Direct Beneficiaries (Count)"
          type="number"
          value={beneficiaries}
          onChange={(e) => setBeneficiaries(e.target.value)}
        />
        <FormField
          label="Habitations / Villages Reached"
          type="number"
          value={villagesReached}
          onChange={(e) => setVillagesReached(e.target.value)}
        />
        <FormField
          label="Installed Probes / Hardware Units"
          type="number"
          value={activeSensors}
          onChange={(e) => setActiveSensors(e.target.value)}
        />
        <FormField
          label="Fluoride Exposure Reduction (%)"
          type="number"
          value={fluorideReductionsPercent}
          onChange={(e) => setFluorideReductionsPercent(e.target.value)}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Save Metrics
          </button>
        </div>
      </form>
    </Modal>
  )
}

// INVITE MEMBER MODAL
function InviteMemberModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (m: ProjectWorkspaceMember) => void
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [organization, setOrganization] = useState('NITK Department of Water Resources')
  const [responsibility, setResponsibility] = useState('')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      id: `tm-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Student Researcher',
      organization: organization.trim() || 'NITK',
      skills: ['Field Research', 'Data Analysis'],
      availability: 'Available',
      responsibility: responsibility.trim() || 'General project tasks.',
      participation: 'Active',
    })
    onClose()
    setName('')
    setRole('')
    setResponsibility('')
  }

  return (
    <Modal open={open} title="Invite New Team Member" onClose={onClose}>
      <form onSubmit={handleSave} className="grid gap-4">
        <FormField
          label="Full Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Ananya Deshmukh"
        />
        <FormField
          label="Project Role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Student ML Researcher or Lab Specialist"
        />
        <FormField
          label="Department / Organization"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
        <TextAreaField
          label="Primary Responsibilities"
          value={responsibility}
          onChange={(e) => setResponsibility(e.target.value)}
          placeholder="Outline what workstream they will lead or support..."
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
          >
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  )
}