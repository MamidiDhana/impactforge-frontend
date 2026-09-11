import { useMemo, useState } from 'react'
import {
  Bot,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Edit2,
  FileCheck2,
  FileOutput,
  FolderKanban,
  GraduationCap,
  Megaphone,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import { Modal } from '../../components/common/Modal'
import { facultyProjects } from '../../data/facultyProjects'
import { facultyMilestones } from '../../data/facultyMilestones'
import {
  initialFacultyAnnouncements,
  initialFacultyProjectOutputs,
  initialFacultyProjectTasks,
  initialFacultyStudentMembers,
  type FacultyAnnouncement,
  type FacultyProjectOutput,
  type FacultyProjectTask,
  type FacultyStudentMember,
} from '../../data/facultyStudentManagement'

let idCounter = 1000
function createUniqueId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

export function FacultyProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const project = facultyProjects.find((p) => p.id === id) ?? facultyProjects[0]

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<'team' | 'tasks' | 'outputs' | 'announcements' | 'overview'>('team')

  // Feedback Notification Banner
  const [feedback, setFeedback] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 4500)
  }

  // -------------------------------------------------------------
  // 1 & 2: Student Project Participation & Team Management State
  // -------------------------------------------------------------
  const [members, setMembers] = useState<FacultyStudentMember[]>(() =>
    initialFacultyStudentMembers.filter((m) => m.projectId === project.id || (project.id === 'wp1' && m.projectId === 'wp1'))
  )
  const [memberSearch, setMemberSearch] = useState('')
  const [memberStatusFilter, setMemberStatusFilter] = useState('All')

  // Modals for Team Management
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('')
  const [newMemberSkills, setNewMemberSkills] = useState('')
  const [newMemberStatus, setNewMemberStatus] = useState<FacultyStudentMember['participationStatus']>('Active')

  const [editRoleMember, setEditRoleMember] = useState<FacultyStudentMember | null>(null)
  const [editRoleTitle, setEditRoleTitle] = useState('')
  const [editRoleStatus, setEditRoleStatus] = useState<FacultyStudentMember['participationStatus']>('Active')

  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<FacultyStudentMember | null>(null)

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim() || !newMemberEmail.trim()) return

    const skillsArray = newMemberSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const newStudent: FacultyStudentMember = {
      id: createUniqueId('stu'),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole.trim() || 'Research Contributor',
      skills: skillsArray.length > 0 ? skillsArray : ['Research', 'Data Analysis'],
      participationStatus: newMemberStatus,
      projectId: project.id,
      projectName: project.title,
      joinedDate: 'Today',
      tasksAssigned: 0,
      tasksCompleted: 0,
    }

    setMembers((prev) => [newStudent, ...prev])
    setAddMemberOpen(false)
    setNewMemberName('')
    setNewMemberEmail('')
    setNewMemberRole('')
    setNewMemberSkills('')
    showFeedback(`Student member "${newStudent.name}" added to ${project.title}.`)
  }

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editRoleMember) return

    setMembers((prev) =>
      prev.map((m) =>
        m.id === editRoleMember.id
          ? {
              ...m,
              role: editRoleTitle.trim() || m.role,
              participationStatus: editRoleStatus,
            }
          : m
      )
    )

    showFeedback(`Updated role & status for ${editRoleMember.name}.`)
    setEditRoleMember(null)
  }

  const handleRemoveMember = (student: FacultyStudentMember) => {
    setMembers((prev) => prev.filter((m) => m.id !== student.id))
    setRemoveMemberConfirm(null)
    showFeedback(`Student member "${student.name}" removed from project.`)
  }

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.skills.some((s) => s.toLowerCase().includes(memberSearch.toLowerCase()))
      const matchStatus = memberStatusFilter === 'All' || m.participationStatus === memberStatusFilter
      return matchSearch && matchStatus
    })
  }, [members, memberSearch, memberStatusFilter])

  // -------------------------------------------------------------
  // 3: Task Management State
  // -------------------------------------------------------------
  const [tasks, setTasks] = useState<FacultyProjectTask[]>(() =>
    initialFacultyProjectTasks.filter((t) => t.projectId === project.id || (project.id === 'wp1' && t.projectId === 'wp1'))
  )
  const [taskStatusFilter, setTaskStatusFilter] = useState<'All' | 'To Do' | 'In Progress' | 'Review' | 'Completed'>('All')
  const [taskSearch, setTaskSearch] = useState('')

  // Modals for Task Management
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState(members[0]?.id || '')
  const [newTaskPriority, setNewTaskPriority] = useState<FacultyProjectTask['priority']>('Medium')
  const [newTaskDueDate, setNewTaskDueDate] = useState('30 Sep 2026')
  const [newTaskStatus, setNewTaskStatus] = useState<FacultyProjectTask['status']>('To Do')

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const assignedStudent = members.find((m) => m.id === newTaskAssigneeId) || members[0]

    const newTask: FacultyProjectTask = {
      id: createUniqueId('ftask'),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Assigned task deliverable for project milestone.',
      projectId: project.id,
      projectName: project.title,
      assignedStudentId: assignedStudent?.id || 'unassigned',
      assignedStudentName: assignedStudent?.name || 'Unassigned',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      status: newTaskStatus,
      progress: newTaskStatus === 'Completed' ? 100 : newTaskStatus === 'In Progress' ? 50 : 0,
    }

    setTasks((prev) => [newTask, ...prev])
    setCreateTaskOpen(false)
    setNewTaskTitle('')
    setNewTaskDesc('')
    showFeedback(`Task "${newTask.title}" created and assigned to ${newTask.assignedStudentName}.`)
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: FacultyProjectTask['status']) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              progress: newStatus === 'Completed' ? 100 : newStatus === 'In Progress' ? 60 : newStatus === 'Review' ? 90 : 0,
            }
          : t
      )
    )
    showFeedback(`Task status updated to "${newStatus}".`)
  }

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    showFeedback(`Task "${taskTitle}" removed.`)
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchStatus = taskStatusFilter === 'All' || t.status === taskStatusFilter
      const matchSearch =
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.assignedStudentName.toLowerCase().includes(taskSearch.toLowerCase()) ||
        t.description.toLowerCase().includes(taskSearch.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [tasks, taskStatusFilter, taskSearch])

  // -------------------------------------------------------------
  // 5 & 6: Project Outputs & Student Submissions Review State
  // -------------------------------------------------------------
  const [outputs, setOutputs] = useState<FacultyProjectOutput[]>(() =>
    initialFacultyProjectOutputs.filter((o) => o.projectId === project.id || (project.id === 'wp1' && o.projectId === 'wp1'))
  )
  const [reviewOutputModal, setReviewOutputModal] = useState<FacultyProjectOutput | null>(null)
  const [reviewStatusChoice, setReviewStatusChoice] = useState<'Approved' | 'Changes Requested' | 'Rejected'>('Approved')
  const [reviewCommentsText, setReviewCommentsText] = useState('')

  const handleOpenReviewModal = (output: FacultyProjectOutput) => {
    setReviewOutputModal(output)
    setReviewStatusChoice(output.reviewStatus === 'Pending Review' ? 'Approved' : output.reviewStatus)
    setReviewCommentsText(output.reviewerComments || '')
  }

  const handleSaveReviewDecision = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewOutputModal) return

    setOutputs((prev) =>
      prev.map((o) =>
        o.id === reviewOutputModal.id
          ? {
              ...o,
              reviewStatus: reviewStatusChoice,
              reviewerComments: reviewCommentsText.trim() || `Reviewed as ${reviewStatusChoice} by Faculty Mentor.`,
            }
          : o
      )
    )

    showFeedback(`Deliverable "${reviewOutputModal.title}" updated to ${reviewStatusChoice}.`)
    setReviewOutputModal(null)
  }

  // -------------------------------------------------------------
  // 7: Student Communication & Announcements State
  // -------------------------------------------------------------
  const [announcements, setAnnouncements] = useState<FacultyAnnouncement[]>(() =>
    initialFacultyAnnouncements.filter((a) => a.projectId === project.id || (project.id === 'wp1' && a.projectId === 'wp1'))
  )
  const [postAnnouncementOpen, setPostAnnouncementOpen] = useState(false)
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('')
  const [newAnnouncementMsg, setNewAnnouncementMsg] = useState('')
  const [newAnnouncementPriority, setNewAnnouncementPriority] = useState<FacultyAnnouncement['priority']>('Normal')

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnouncementTitle.trim() || !newAnnouncementMsg.trim()) return

    const newAnn: FacultyAnnouncement = {
      id: createUniqueId('fann'),
      title: newAnnouncementTitle.trim(),
      message: newAnnouncementMsg.trim(),
      projectId: project.id,
      projectName: project.title,
      author: 'Dr. Arjun Menon (Faculty Lead)',
      date: 'Today',
      priority: newAnnouncementPriority,
    }

    setAnnouncements((prev) => [newAnn, ...prev])
    setPostAnnouncementOpen(false)
    setNewAnnouncementTitle('')
    setNewAnnouncementMsg('')
    showFeedback(`Announcement "${newAnn.title}" published to student team members.`)
  }

  // Task progress calculation for project
  const completedTaskCount = tasks.filter((t) => t.status === 'Completed').length
  const projectMilestones = facultyMilestones.filter((m) => m.project === project.title || project.id === 'wp1')

  return (
    <HEILayout
      title={`Project: ${project.title}`}
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'Projects', href: '/university/faculty/projects' },
        { label: project.title },
      ]}
    >
      <PageContainer>
        <PageHeader
          title={project.title}
          description="Faculty project workspace: supervise student innovators, assign tasks, review submitted deliverables, and communicate project updates."
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'Projects', href: '/university/faculty/projects' },
            { label: project.title },
          ]}
          action={
            <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setCreateTaskOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1a4a7a]"
            >
              <Plus size={15} />
              Create Task
            </button>
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <UserPlus size={15} />
              Add Student
            </button>
            <button
              type="button"
              onClick={() => setPostAnnouncementOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Megaphone size={15} />
              Post Announcement
            </button>
            <Link
              to={`/projects/${project.id}/overview`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#187e8d] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#156e7c]"
            >
              Interactive Workspace &rarr;
            </Link>
          </div>
        }
      />
        <div className="space-y-6">
          {/* Status Feedback Toast */}
          {feedback && (
            <div
              role="status"
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Project Header Banner & Progress Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#e8f5f5] px-2.5 py-0.5 text-xs font-bold text-[#187e8d]">
                    {project.category}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    Stage: {project.stage}
                  </span>
                  <span className="text-xs text-slate-400">
                    Lead: <strong className="text-slate-700">{project.facultyLead}</strong>
                  </span>
                </div>
                <h2 className="font-[Manrope] text-xl sm:text-2xl font-extrabold text-[#13243b]">
                  {project.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Target Community Need: <strong className="text-slate-700">{project.problemTitle}</strong>
                </p>
              </div>

              {/* High-level progress badge */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-center px-2">
                  <p className="text-xs text-slate-500">Team Size</p>
                  <p className="text-base font-extrabold text-[#13243b]">{members.length} Members</p>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <p className="text-xs text-slate-500">Tasks</p>
                  <p className="text-base font-extrabold text-emerald-700">
                    {completedTaskCount}/{tasks.length} Done
                  </p>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div className="text-center px-2">
                  <p className="text-xs text-slate-500">Beneficiaries</p>
                  <p className="text-base font-extrabold text-[#187e8d]">
                    {project.beneficiaries.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Overall Delivery Milestone Completion</span>
                <span className="text-[#187e8d] font-bold">{project.progress}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#187e8d] to-teal-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'team'
                  ? 'bg-[#12365a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users size={16} />
              Team Members ({members.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'tasks'
                  ? 'bg-[#12365a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardCheck size={16} />
              Task Management ({tasks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('outputs')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'outputs'
                  ? 'bg-[#12365a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileOutput size={16} />
              Outputs & Reviews ({outputs.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'announcements'
                  ? 'bg-[#12365a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Megaphone size={16} />
              Announcements ({announcements.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-[#12365a] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FolderKanban size={16} />
              Overview & Milestones
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: TEAM MEMBERS & PARTICIPATION */}
          {/* ========================================================= */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Assigned Team Members
                  </h3>
                  <p className="text-xs text-slate-500">
                    Team members working on {project.title}. View roles, technical skills, and manage assignments.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search member or skill..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>

                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#187e8d] focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Component Lead">Component Lead</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setAddMemberOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <UserPlus size={14} />
                    Add Student Member
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {filteredMembers.map((student) => (
                  <div
                    key={student.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#b8dfe0]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-[#12365a] text-white font-bold text-sm">
                            {student.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <h4 className="font-[Manrope] text-base font-bold text-[#13243b]">
                              {student.name}
                            </h4>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            student.participationStatus === 'Component Lead'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : student.participationStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : student.participationStatus === 'On Leave'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {student.participationStatus}
                        </span>
                      </div>

                      <div className="mt-3.5 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Assigned Role:
                        </span>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{student.role}</p>
                      </div>

                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Skills & Competencies:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {student.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-[#e8f5f5] px-2 py-0.5 text-[11px] font-medium text-[#187e8d]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>Joined: <strong>{student.joinedDate}</strong></span>
                        <span>Tasks Completed: <strong className="text-emerald-700">{student.tasksCompleted}</strong></span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditRoleMember(student)
                          setEditRoleTitle(student.role)
                          setEditRoleStatus(student.participationStatus)
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Edit2 size={13} />
                        Assign Role
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemoveMemberConfirm(student)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: TASK MANAGEMENT (Req 3)                            */}
          {/* ========================================================= */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Project Tasks & Student Assignments
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track deliverables, allocate work to students, and update task status across work streams.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setCreateTaskOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <Plus size={14} />
                    Create Task
                  </button>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
                {(['All', 'To Do', 'In Progress', 'Review', 'Completed'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTaskStatusFilter(status)}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      taskStatusFilter === status
                        ? 'bg-white text-[#12365a] shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}{' '}
                    <span className="ml-1 text-[11px] opacity-75">
                      ({status === 'All' ? tasks.length : tasks.filter((t) => t.status === status).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex flex-col md:flex-row md:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm gap-4 transition hover:border-[#b8dfe0]"
                    >
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                              task.priority === 'Critical'
                                ? 'bg-red-50 text-red-700'
                                : task.priority === 'High'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={13} />
                            Due {task.dueDate}
                          </span>
                        </div>

                        <h4 className="font-[Manrope] text-base font-bold text-[#13243b]">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>

                        <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <GraduationCap size={14} className="text-[#187e8d]" />
                            Assigned to: <strong className="text-slate-900">{task.assignedStudentName}</strong>
                          </span>
                          {task.progressNote && (
                            <span className="text-[11px] text-slate-400 italic">
                              — {task.progressNote}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Selector & Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Status
                          </label>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleUpdateTaskStatus(
                                task.id,
                                e.target.value as FacultyProjectTask['status']
                              )
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                              task.status === 'Completed'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : task.status === 'Review'
                                  ? 'border-purple-300 bg-purple-50 text-purple-800'
                                  : task.status === 'In Progress'
                                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                                    : 'border-slate-200 bg-slate-50 text-slate-700'
                            }`}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="text-right min-w-[100px]">
                          <span className="text-xs font-bold text-slate-700">{task.progress}%</span>
                          <div className="mt-1 h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#187e8d]"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-700 transition"
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No tasks found matching your filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PROJECT OUTPUTS & DELIVERABLES */}
          {/* ========================================================= */}
          {activeTab === 'outputs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Project Outputs & Deliverable Reviews
                  </h3>
                  <p className="text-xs text-slate-500">
                    Examine technical prototypes, code builds, and reports submitted by students. Approve or request changes.
                  </p>
                </div>

                <span className="rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-bold text-[#187e8d]">
                  {outputs.length} Submitted Deliverables
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#b8dfe0]"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {output.outputType} · {output.version}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            output.reviewStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : output.reviewStatus === 'Pending Review'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : output.reviewStatus === 'Changes Requested'
                                  ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {output.reviewStatus}
                        </span>
                      </div>

                      <h4 className="mt-3 font-[Manrope] text-base font-bold text-[#13243b]">
                        {output.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {output.description}
                      </p>

                      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                        <p>
                          <strong>Submitted By:</strong> {output.submittedBy} on {output.submissionDate}
                        </p>
                        <p>
                          <strong>Attachment:</strong>{' '}
                          <span className="text-[#187e8d] font-semibold underline cursor-pointer">
                            {output.attachmentName || 'deliverable-package.zip'}
                          </span>
                        </p>
                        {output.reviewerComments && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-slate-700">
                            <strong>Faculty Feedback:</strong> {output.reviewerComments}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(output)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                      >
                        <FileCheck2 size={14} />
                        Review Deliverable
                      </button>

                      {output.reviewStatus !== 'Approved' && (
                        <button
                          type="button"
                          onClick={() => {
                            setOutputs((prev) =>
                              prev.map((o) =>
                                o.id === output.id
                                  ? { ...o, reviewStatus: 'Approved', reviewerComments: 'Approved by Dr. Menon' }
                                  : o
                              )
                            )
                            showFeedback(`Approved "${output.title}".`)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <CheckCircle2 size={13} />
                          Quick Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: TEAM COMMUNICATION & ANNOUNCEMENTS */}
          {/* ========================================================= */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Project Announcements & Team Notices
                  </h3>
                  <p className="text-xs text-slate-500">
                    Broadcast milestone updates, laboratory schedules, and technical instructions to assigned students.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPostAnnouncementOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <Megaphone size={14} />
                  Post Announcement
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 transition hover:border-[#b8dfe0]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            item.priority === 'Urgent'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.priority === 'Important'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.priority} Priority
                        </span>
                        <span className="text-xs text-slate-400">Posted {item.date}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Author: <strong className="text-slate-700">{item.author}</strong>
                      </span>
                    </div>

                    <h4 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      {item.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: OVERVIEW & MILESTONES                              */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <ResponsiveCard>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Community Problem Context
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    <strong className="text-slate-800">{project.problemTitle}:</strong>{' '}
                    {project.description}
                  </p>
                  <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-xs text-slate-600 sm:grid-cols-2">
                    <span>University: <b>{project.university}</b></span>
                    <span>Faculty lead: <b>{project.facultyLead}</b></span>
                    <span>Student team: <b>{project.studentTeam}</b></span>
                    <span>Target beneficiaries: <b>{project.beneficiaries.toLocaleString()}</b></span>
                    <span>Stage: <b>{project.stage}</b></span>
                    <span>Partners: <b>{project.partners.join(', ') || 'None yet'}</b></span>
                  </div>
                </ResponsiveCard>

                <ResponsiveCard className="border-[#b8dfe0]">
                  <div className="flex items-center gap-3">
                    <Bot className="text-[#187e8d]" />
                    <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                      AI-Assisted Capability Gap Analysis
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Identified technical areas requiring external partner mentorship or specialized laboratory resources:
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {project.capabilityGaps.map((gap) => (
                      <div key={gap} className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200/60">
                        <strong>{gap}</strong> — Recommended action: initiate industry partner collaboration request.
                      </div>
                    ))}
                  </div>
                </ResponsiveCard>
              </div>

              {/* Milestones Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="text-[#187e8d]" size={20} />
                    <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      Milestones & Timeline Schedule
                    </h3>
                  </div>
                  <Link
                    to="/university/faculty/reports"
                    className="text-xs font-bold text-[#187e8d] hover:underline"
                  >
                    Manage all milestones &rarr;
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-slate-100">
                  {projectMilestones.map((m) => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-[#13243b]">{m.title}</h4>
                        <p className="text-xs text-slate-500">Responsible: {m.responsible}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Due {m.dueDate}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            m.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL: ADD TEAM MEMBER                                    */}
        {/* ========================================================= */}
        <Modal
          open={addMemberOpen}
          title="Add Member to Project Team"
          onClose={() => setAddMemberOpen(false)}
        >
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="e.g. Tanvi Joshi"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="tanvi.j@nitk.edu.in"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Assigned Role / Responsibility
              </label>
              <input
                type="text"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                placeholder="e.g. Telemetry Firmware Developer"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                value={newMemberSkills}
                onChange={(e) => setNewMemberSkills(e.target.value)}
                placeholder="e.g. C++, Embedded Linux, KiCad"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Participation Status
              </label>
              <select
                value={newMemberStatus}
                onChange={(e) => setNewMemberStatus(e.target.value as FacultyStudentMember['participationStatus'])}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Component Lead">Component Lead</option>
                <option value="On Leave">On Leave</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddMemberOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
              >
                Assign Student
              </button>
            </div>
          </form>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: EDIT / ASSIGN ROLE                                 */}
        {/* ========================================================= */}
        <Modal
          open={Boolean(editRoleMember)}
          title={`Assign Role: ${editRoleMember?.name || ''}`}
          onClose={() => setEditRoleMember(null)}
        >
          {editRoleMember && (
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Project Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Participation Status
                </label>
                <select
                  value={editRoleStatus}
                  onChange={(e) => setEditRoleStatus(e.target.value as FacultyStudentMember['participationStatus'])}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Component Lead">Component Lead</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditRoleMember(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: CONFIRM REMOVE MEMBER                              */}
        {/* ========================================================= */}
        <Modal
          open={Boolean(removeMemberConfirm)}
          title="Remove Member from Project"
          onClose={() => setRemoveMemberConfirm(null)}
        >
          {removeMemberConfirm && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong>{removeMemberConfirm.name}</strong> from this project team?
                Their task history and submitted files will remain recorded.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRemoveMemberConfirm(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(removeMemberConfirm)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Confirm Removal
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: CREATE TASK                                        */}
        {/* ========================================================= */}
        <Modal
          open={createTaskOpen}
          title="Create New Project Task"
          onClose={() => setCreateTaskOpen(false)}
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Calibrate optical sensor in tank sample"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Description & Deliverable Notes
              </label>
              <textarea
                rows={3}
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Provide instructions, acceptance criteria, or testing constraints..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign to Student
                </label>
                <select
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Priority
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as FacultyProjectTask['priority'])}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Deadline Date
                </label>
                <input
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="30 Sep 2026"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Initial Status
                </label>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value as FacultyProjectTask['status'])}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateTaskOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
              >
                Create Task
              </button>
            </div>
          </form>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: REVIEW PROJECT SUBMISSION */}
        {/* ========================================================= */}
        <Modal
          open={Boolean(reviewOutputModal)}
          title={`Review Submission: ${reviewOutputModal?.title || ''}`}
          onClose={() => setReviewOutputModal(null)}
        >
          {reviewOutputModal && (
            <form onSubmit={handleSaveReviewDecision} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-100">
                <p><strong>Student Author:</strong> {reviewOutputModal.submittedBy}</p>
                <p><strong>Deliverable Type:</strong> {reviewOutputModal.outputType} ({reviewOutputModal.version})</p>
                <p><strong>Attachment:</strong> {reviewOutputModal.attachmentName || 'sensor-report.pdf'}</p>
                <p><strong>Summary:</strong> {reviewOutputModal.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Faculty Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Approved', 'Changes Requested', 'Rejected'] as const).map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setReviewStatusChoice(choice)}
                      className={`rounded-lg border py-2 text-xs font-bold transition ${
                        reviewStatusChoice === choice
                          ? choice === 'Approved'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : choice === 'Changes Requested'
                              ? 'border-orange-500 bg-orange-50 text-orange-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Mentor Review Feedback / Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewCommentsText}
                  onChange={(e) => setReviewCommentsText(e.target.value)}
                  placeholder="State review findings, calibration criteria, or next test guidelines..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewOutputModal(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Save Review Decision
                </button>
              </div>
            </form>
          )}
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: POST ANNOUNCEMENT                                  */}
        {/* ========================================================= */}
        <Modal
          open={postAnnouncementOpen}
          title="Broadcast Announcement to Team"
          onClose={() => setPostAnnouncementOpen(false)}
        >
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Announcement Subject / Title *
              </label>
              <input
                type="text"
                required
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                placeholder="e.g. Field Deployment Schedule & Lab Inspection"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Priority Level
              </label>
              <select
                value={newAnnouncementPriority}
                onChange={(e) => setNewAnnouncementPriority(e.target.value as FacultyAnnouncement['priority'])}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Announcement Body / Message *
              </label>
              <textarea
                rows={4}
                required
                value={newAnnouncementMsg}
                onChange={(e) => setNewAnnouncementMsg(e.target.value)}
                placeholder="Write your notice for the student cohort members..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPostAnnouncementOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
              >
                Publish Notice
              </button>
            </div>
          </form>
        </Modal>
      </PageContainer>
    </HEILayout>
  )
}