import { useState } from 'react'
import { CheckCircle2, Clock, Filter, Flag, Plus, Search, Sparkles } from 'lucide-react'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { SelectField } from '../../components/forms/SelectField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { EmptyState } from '../../components/common/EmptyState'
import { facultyMilestones as initialFacultyMilestones } from '../../data/facultyMilestones'
import type { WorkspaceMilestone } from '../../types'

type FilterStatus = 'All' | 'Pending' | 'In Progress' | 'Completed'

export function MilestonesPage() {
  const [milestones, setMilestones] = useState<WorkspaceMilestone[]>(initialFacultyMilestones)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('All')
  const [projectFilter, setProjectFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<WorkspaceMilestone | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Milestone Form State
  const [newTitle, setNewTitle] = useState('')
  const [newProject, setNewProject] = useState('Solar Water Monitoring Pilot')
  const [newDescription, setNewDescription] = useState('')
  const [newResponsible, setNewResponsible] = useState('Dr. Meera Nair')
  const [newStartDate, setNewStartDate] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newStatus, setNewStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const projectsList = ['All', ...Array.from(new Set(milestones.map((m) => m.project)))]

  const normalizeStatus = (status: string): 'Pending' | 'In Progress' | 'Completed' => {
    if (status === 'Completed') return 'Completed'
    if (status === 'In Progress') return 'In Progress'
    return 'Pending'
  }

  const filteredMilestones = milestones.filter((m) => {
    const normalized = normalizeStatus(m.status)
    if (filterStatus !== 'All' && normalized !== filterStatus) return false
    if (projectFilter !== 'All' && m.project !== projectFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = m.title.toLowerCase().includes(q)
      const matchesProject = m.project.toLowerCase().includes(q)
      const matchesResp = m.responsible.toLowerCase().includes(q)
      if (!matchesTitle && !matchesProject && !matchesResp) return false
    }
    return true
  })

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const created: WorkspaceMilestone = {
      id: `fm-${Date.now()}`,
      title: newTitle.trim(),
      project: newProject,
      description: newDescription.trim() || 'No description provided.',
      responsible: newResponsible.trim() || 'Dr. Meera Nair',
      startDate: newStartDate || '01 Sep 2026',
      dueDate: newDueDate || '30 Oct 2026',
      status: newStatus,
      progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 25 : 0,
    }

    setMilestones([created, ...milestones])
    setIsAddModalOpen(false)
    setNewTitle('')
    setNewDescription('')
    setNewStartDate('')
    setNewDueDate('')
    setNewStatus('Pending')
    showToast(`Milestone "${created.title}" created successfully.`)
  }

  const handleUpdateStatus = (id: string, nextStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setMilestones((current) =>
      current.map((m) => {
        if (m.id !== id) return m
        const progress = nextStatus === 'Completed' ? 100 : nextStatus === 'In Progress' ? (m.progress === 0 || m.progress === 100 ? 50 : m.progress) : 0
        return {
          ...m,
          status: nextStatus,
          progress,
          completionDate: nextStatus === 'Completed' ? 'Today' : undefined,
        }
      })
    )
    showToast(`Status updated to "${nextStatus}"`)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMilestone) return
    setMilestones((current) =>
      current.map((m) => (m.id === editingMilestone.id ? editingMilestone : m))
    )
    setEditingMilestone(null)
    showToast('Milestone details updated.')
  }

  return (
    <FacultyStudentLayout role="faculty" title="Milestones">
      {toastMessage && (
        <div
          role="status"
          className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <WorkspacePage
        role="faculty"
        title="Milestones"
        description="Monitor delivery commitments, track completion dates, and update milestone statuses."
        breadcrumbs={[{ label: 'Faculty', href: '/faculty/dashboard' }, { label: 'Milestones' }]}
        action={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0e2a47]"
          >
            <Plus size={16} />
            Add Milestone
          </button>
        }
      >
        {/* KPI Bar */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Milestones</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">{milestones.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending / Not Started</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-amber-700">
              {milestones.filter((m) => normalizeStatus(m.status) === 'Pending').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#187e8d]">In Progress</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#187e8d]">
              {milestones.filter((m) => normalizeStatus(m.status) === 'In Progress').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-emerald-700">
              {milestones.filter((m) => normalizeStatus(m.status) === 'Completed').length}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Milestone status filter">
            {(['All', 'Pending', 'In Progress', 'Completed'] as FilterStatus[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filterStatus === tab}
                onClick={() => setFilterStatus(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filterStatus === tab
                    ? 'bg-[#12365a] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
                <span className="ml-1.5 opacity-80">
                  {tab === 'All'
                    ? milestones.length
                    : milestones.filter((m) => normalizeStatus(m.status) === tab).length}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Project Filter */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <select
                aria-label="Filter by project"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
              >
                {projectsList.map((p) => (
                  <option key={p} value={p}>
                    {p === 'All' ? 'All Projects' : p}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                aria-label="Search milestones"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search milestones..."
                className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#187e8d] sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Milestones List */}
        {filteredMilestones.length === 0 ? (
          <EmptyState
            icon={Flag}
            title="No milestones match your criteria"
            description="Try switching status tabs or clearing search filters to see all project deliverables."
            action={
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('All')
                  setProjectFilter('All')
                  setSearchQuery('')
                }}
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-4">
            {filteredMilestones.map((milestone) => {
              const currentStatus = normalizeStatus(milestone.status)
              return (
                <article
                  key={milestone.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#e8f5f5] px-2.5 py-0.5 text-xs font-semibold text-[#187e8d]">
                          {milestone.project}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            currentStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : currentStatus === 'In Progress'
                              ? 'bg-cyan-50 text-cyan-800'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                      <h2 className="mt-2 font-[Manrope] text-base font-bold text-[#13243b]">
                        {milestone.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">{milestone.description}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <button
                        type="button"
                        onClick={() => setEditingMilestone({ ...milestone })}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>

                  {/* Meta and Progress Bar */}
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>
                          Responsible: <strong className="text-slate-700">{milestone.responsible}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          {milestone.startDate} - {milestone.dueDate}
                        </span>
                      </div>
                      <span className="font-bold text-[#187e8d]">{milestone.progress}% completed</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-300 ${
                          currentStatus === 'Completed'
                            ? 'bg-emerald-600'
                            : currentStatus === 'In Progress'
                            ? 'bg-[#1c91a1]'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Status Update Buttons */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <span className="text-xs font-medium text-slate-500">Update Status:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(milestone.id, 'Pending')}
                        disabled={currentStatus === 'Pending'}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          currentStatus === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(milestone.id, 'In Progress')}
                        disabled={currentStatus === 'In Progress'}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          currentStatus === 'In Progress'
                            ? 'bg-cyan-100 text-cyan-800'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(milestone.id, 'Completed')}
                        disabled={currentStatus === 'Completed'}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          currentStatus === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 size={13} />
                        Completed
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Add Milestone Modal */}
        <Modal open={isAddModalOpen} title="Add Project Milestone" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleCreateMilestone} className="grid gap-4">
            <FormField
              label="Milestone Title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Cellular Gateway Testing & Firmware Deployment"
            />
            <SelectField
              label="Related Project"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              options={[
                { label: 'Solar Water Monitoring Pilot', value: 'Solar Water Monitoring Pilot' },
                { label: 'Offline-First Digital STEM Library', value: 'Offline-First Digital STEM Library' },
                { label: 'Rural Clinic Low-Bandwidth Tele-Triage', value: 'Rural Clinic Low-Bandwidth Tele-Triage' },
                { label: 'Decentralized Organic Waste Bio-Digester', value: 'Decentralized Organic Waste Bio-Digester' },
              ]}
            />
            <TextAreaField
              label="Deliverable Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Detail specific deliverables, technical standards, or validation targets..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Responsible Lead"
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                placeholder="Dr. Meera Nair / Riya Shah"
              />
              <SelectField
                label="Initial Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'Pending' | 'In Progress' | 'Completed')}
                options={[
                  { label: 'Pending / Not Started', value: 'Pending' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Completed', value: 'Completed' },
                ]}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Start Date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
              <FormField
                label="Due Date"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
              />
            </div>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e2a47]"
              >
                Create Milestone
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Milestone Modal */}
        <Modal
          open={Boolean(editingMilestone)}
          title="Edit Milestone Details"
          onClose={() => setEditingMilestone(null)}
        >
          {editingMilestone && (
            <form onSubmit={handleSaveEdit} className="grid gap-4">
              <FormField
                label="Milestone Title"
                required
                value={editingMilestone.title}
                onChange={(e) =>
                  setEditingMilestone({ ...editingMilestone, title: e.target.value })
                }
              />
              <TextAreaField
                label="Description"
                value={editingMilestone.description}
                onChange={(e) =>
                  setEditingMilestone({ ...editingMilestone, description: e.target.value })
                }
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Responsible"
                  value={editingMilestone.responsible}
                  onChange={(e) =>
                    setEditingMilestone({ ...editingMilestone, responsible: e.target.value })
                  }
                />
                <FormField
                  label="Progress Percentage (0 - 100)"
                  type="number"
                  value={String(editingMilestone.progress)}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                    setEditingMilestone({
                      ...editingMilestone,
                      progress: val,
                      status: val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Pending',
                    })
                  }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  label="Start Date"
                  value={editingMilestone.startDate}
                  onChange={(e) =>
                    setEditingMilestone({ ...editingMilestone, startDate: e.target.value })
                  }
                />
                <FormField
                  label="Due Date"
                  value={editingMilestone.dueDate}
                  onChange={(e) =>
                    setEditingMilestone({ ...editingMilestone, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0e2a47]"
                >
                  <Sparkles size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </Modal>
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}