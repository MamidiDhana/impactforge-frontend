import { useState, useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  LayoutGrid,
  List,
  Plus,
  Search,
  Users,
  UserCheck,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { FilterSelect } from '../../components/forms/FilterSelect'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { useStudentTeams } from '../../hooks/useStudentTeams'
import { useAuth } from '../../context/AuthContext'

export function StudentTeamsPage() {
  const { currentUser } = useAuth()
  const { teams, createTeam } = useStudentTeams()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [mentorFilter, setMentorFilter] = useState('All Mentors')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [isLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Form states for Create Team modal
  const [newTeamName, setNewTeamName] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newMentor, setNewMentor] = useState(
    currentUser?.role === 'faculty' ? currentUser.name : 'Dr. Meera Nair'
  )
  const [newLeadStudent, setNewLeadStudent] = useState('')
  const [newStudents, setNewStudents] = useState('')
  const [newCapabilities, setNewCapabilities] = useState('')
  const [newStatus, setNewStatus] = useState<string>('Active')

  // Derive filter options
  const statusOptions = ['All Statuses', 'Working', 'Active', 'Formation Pending']
  const mentorOptions = useMemo(() => {
    const set = new Set<string>()
    teams.forEach((t) => {
      if (t.facultyMentor) set.add(t.facultyMentor)
    })
    return ['All Mentors', ...Array.from(set)]
  }, [teams])

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        team.id.toLowerCase().includes(q) ||
        team.project.toLowerCase().includes(q) ||
        (team.leadStudent && team.leadStudent.toLowerCase().includes(q)) ||
        team.facultyMentor.toLowerCase().includes(q) ||
        team.capabilities.some((c) => c.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'All Statuses' || team.status === statusFilter

      const matchesMentor =
        mentorFilter === 'All Mentors' || team.facultyMentor === mentorFilter

      return matchesSearch && matchesStatus && matchesMentor
    })
  }, [teams, search, statusFilter, mentorFilter])

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim() || !newProject.trim()) return

    const studentList = newStudents
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (newLeadStudent.trim() && !studentList.some((s) => s.includes(newLeadStudent.trim()))) {
      studentList.unshift(`${newLeadStudent.trim()} (Lead)`)
    }

    const caps = newCapabilities
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)

    createTeam({
      name: newTeamName.trim(),
      project: newProject.trim(),
      facultyMentor: newMentor.trim(),
      leadStudent: newLeadStudent.trim() || undefined,
      students: studentList.length > 0 ? studentList : ['Student Member 1 (Contributor)'],
      capabilities: caps.length > 0 ? caps : ['Applied Research', 'Prototyping'],
      missingCapabilities: [],
      status: newStatus,
      progress: 15,
      completedMilestones: 0,
      meetingSchedule: 'Tuesdays at 4:00 PM',
      description: `Interdisciplinary cohort dedicated to ${newProject.trim()}.`,
    })

    setIsCreateOpen(false)
    setNewTeamName('')
    setNewProject('')
    setNewLeadStudent('')
    setNewStudents('')
    setNewCapabilities('')
    setFeedback(`Team "${newTeamName}" created successfully.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Working':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Working
          </span>
        )
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Active
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Formation Pending
          </span>
        )
    }
  }

  return (
    <HEILayout
      title="Student Teams"
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'Student Teams' },
      ]}
    >
      <PageContainer>
        <PageHeader
          title="Student Teams"
          description="Manage and monitor student teams assigned to you."
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'Student Teams' },
          ]}
          action={
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1a4a7a]"
            >
              <Plus size={16} />
              <span>Form New Team</span>
            </button>
          }
        />

        {feedback && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-md">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search team name, ID, project, or student lead..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-44">
                <FilterSelect
                  label="Status"
                  value={statusFilter}
                  options={statusOptions}
                  onChange={setStatusFilter}
                />
              </div>

              <div className="w-52">
                <FilterSelect
                  label="Mentor"
                  value={mentorFilter}
                  options={mentorOptions}
                  onChange={setMentorFilter}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                  className={`rounded p-1.5 text-xs font-semibold transition ${
                    viewMode === 'cards'
                      ? 'bg-white text-[#12365a] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Table view"
                  className={`rounded p-1.5 text-xs font-semibold transition ${
                    viewMode === 'table'
                      ? 'bg-white text-[#12365a] shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredTeams.length}</strong> of{' '}
              <strong>{teams.length}</strong> student innovation teams
            </span>
            {(search || statusFilter !== 'All Statuses' || mentorFilter !== 'All Mentors') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All Statuses')
                  setMentorFilter('All Mentors')
                }}
                className="font-semibold text-[#187e8d] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <LoadingState rows={4} />
        ) : filteredTeams.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No student teams found"
            description="No teams matched your current filters or search query. Try adjusting your parameters or create a new team."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All Statuses')
                  setMentorFilter('All Mentors')
                }}
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white"
              >
                Clear all filters
              </button>
            }
          />
        ) : viewMode === 'cards' ? (
          /* Cards View */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => {
              const progressVal = team.progress ?? 45
              const memberCount = team.studentCount ?? team.students.length

              return (
                <article
                  key={team.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#a9d9d9] hover:shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#187e8d]">
                          ID: {team.id}
                        </span>
                        <h2 className="mt-1 font-[Manrope] text-lg font-bold text-[#13243b]">
                          {team.name}
                        </h2>
                      </div>
                      {getStatusBadge(team.status)}
                    </div>

                    {/* Problem / Project info */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <FolderKanban size={14} className="shrink-0 text-[#187e8d]" />
                        <span className="line-clamp-1 font-semibold">
                          Project: {team.project}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <UserCheck size={14} className="shrink-0 text-slate-400" />
                        <span>Leader: {team.leadStudent || team.students[0] || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <GraduationCap size={14} className="shrink-0 text-slate-400" />
                        <span className="line-clamp-1">Mentor: {team.facultyMentor}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600">Milestone Progress</span>
                        <span className="font-bold text-[#187e8d]">{progressVal}%</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#187e8d] transition-all"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>

                    {/* Members Roster Summary */}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} className="text-[#187e8d]" />
                        <strong>{memberCount}</strong> Members
                      </span>
                      {team.meetingSchedule && (
                        <span className="inline-flex items-center gap-1 truncate text-slate-400">
                          <Calendar size={13} />
                          {team.meetingSchedule.split('(')[0]}
                        </span>
                      )}
                    </div>

                    {/* Capabilities Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {team.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="rounded-md bg-[#e8f5f5] px-2 py-0.5 text-[11px] font-semibold text-[#187e8d]"
                        >
                          {cap}
                        </span>
                      ))}
                      {team.capabilities.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                          +{team.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link
                      to={`/university/faculty/teams/${team.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#12365a] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#1a4a7a]"
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          /* Responsive Table View */
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Team</th>
                  <th className="px-4 py-3.5">Project / Problem</th>
                  <th className="px-4 py-3.5">Team Leader</th>
                  <th className="px-4 py-3.5">Mentor</th>
                  <th className="px-4 py-3.5 text-center">Members</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeams.map((team) => {
                  const progressVal = team.progress ?? 40
                  return (
                    <tr key={team.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 font-semibold text-[#13243b]">
                        <div>{team.name}</div>
                        <div className="text-[10px] font-normal text-slate-400">ID: {team.id}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="truncate font-medium text-slate-800">{team.project}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {team.leadStudent || team.students[0] || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {team.facultyMentor}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                        {team.studentCount ?? team.students.length}
                      </td>
                      <td className="px-4 py-3.5 w-36">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#187e8d]"
                              style={{ width: `${progressVal}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#187e8d]">{progressVal}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{getStatusBadge(team.status)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/university/faculty/teams/${team.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#12365a] px-3 py-1.5 text-xs font-bold text-[#12365a] hover:bg-slate-50"
                        >
                          <span>View Details</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Team Modal */}
        <Modal
          open={isCreateOpen}
          title="Form New Student Team"
          onClose={() => setIsCreateOpen(false)}
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <FormField
              label="Team Name"
              required
              placeholder="e.g. EcoGrid Micro-Inverter Team"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />

            <FormField
              label="Assigned Project / Community Challenge"
              required
              placeholder="e.g. Solar Mini-Grid for Rural Health Subcenter"
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
            />

            <FormField
              label="Faculty Mentor"
              required
              value={newMentor}
              onChange={(e) => setNewMentor(e.target.value)}
            />

            <FormField
              label="Designated Student Leader"
              placeholder="e.g. Priya Sharma (Final Year EEE)"
              value={newLeadStudent}
              onChange={(e) => setNewLeadStudent(e.target.value)}
            />

            <FormField
              label="Student Members (comma separated)"
              placeholder="e.g. Rahul Sen, Fatima Sheikh, David K"
              value={newStudents}
              onChange={(e) => setNewStudents(e.target.value)}
            />

            <FormField
              label="Key Demonstrated Capabilities (comma separated)"
              placeholder="e.g. Power Electronics, IoT Telemetry, Python"
              value={newCapabilities}
              onChange={(e) => setNewCapabilities(e.target.value)}
            />

            <div>
              <label className="block font-bold text-slate-700">Initial Team Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Working">Working</option>
                <option value="Formation Pending">Formation Pending</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
              >
                Create Team
              </button>
            </div>
          </form>
        </Modal>
      </PageContainer>
    </HEILayout>
  )
}
