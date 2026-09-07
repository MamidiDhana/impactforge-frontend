import { useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  Plus,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'
import { facultyTeams as initialTeams, type ExtendedWorkspaceTeam } from '../../data/facultyTeams'

export function FacultyTeamsPage() {
  const [teams, setTeams] = useState<ExtendedWorkspaceTeam[]>(initialTeams)
  const [selectedTeam, setSelectedTeam] = useState<ExtendedWorkspaceTeam | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentRole, setNewStudentRole] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleOpenAssign = (team: ExtendedWorkspaceTeam) => {
    setSelectedTeam(team)
    setNewStudentName('')
    setNewStudentRole('')
    setAssignModalOpen(true)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !newStudentName.trim()) return

    const formatted = `${newStudentName.trim()} (${newStudentRole.trim() || 'Contributor'})`
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeam.id
          ? {
              ...t,
              students: [...t.students, formatted],
              studentCount: (t.studentCount ?? t.students.length) + 1,
            }
          : t
      )
    )

    setAssignModalOpen(false)
    setFeedback(`Student "${newStudentName}" assigned to ${selectedTeam.name}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <FacultyStudentLayout role="faculty" title="Teams">
      <WorkspacePage
        role="faculty"
        title="Teams"
        description="Guide interdisciplinary innovation teams assigned to validated community projects."
        breadcrumbs={[
          { label: 'Faculty', href: '/faculty/dashboard' },
          { label: 'Teams' },
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

          <div className="grid gap-6 md:grid-cols-2">
            {teams.map((team) => (
              <article
                key={team.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-10 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                        <Users size={20} />
                      </span>
                      <div>
                        <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                          {team.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {team.studentCount ?? team.students.length} Team Members
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        team.status === 'Working'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {team.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs space-y-1.5">
                    <p className="flex items-center gap-1.5 text-slate-700">
                      <FolderKanban size={13} className="text-[#187e8d] shrink-0" />
                      <span>
                        Project: <strong>{team.project}</strong>
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap size={13} className="text-slate-400 shrink-0" />
                      <span>Mentor: {team.facultyMentor}</span>
                    </p>
                    {team.meetingSchedule && (
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={13} className="shrink-0 text-slate-400" />
                        <span>Weekly Sync: {team.meetingSchedule}</span>
                      </p>
                    )}
                  </div>

                  {/* Student Members List */}
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Team Members & Responsibilities
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {team.students.map((student) => (
                        <div
                          key={student}
                          className="flex items-center justify-between rounded-md border border-slate-100 bg-white px-3 py-1.5 text-xs text-slate-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-[#187e8d]" />
                            {student}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTeams((prev) =>
                                  prev.map((t) =>
                                    t.id === team.id
                                      ? {
                                          ...t,
                                          students: t.students.filter((s) => s !== student),
                                          studentCount: Math.max(0, (t.studentCount ?? t.students.length) - 1),
                                        }
                                      : t
                                  )
                                )
                                setFeedback(`Student "${student}" removed from ${team.name}.`)
                                setTimeout(() => setFeedback(null), 4000)
                              }}
                              className="text-slate-300 hover:text-red-600 transition"
                              title="Remove from team"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills & Capabilities */}
                  <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Demonstrated Capabilities
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {team.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="rounded-md bg-[#e8f5f5] px-2.5 py-0.5 text-xs font-semibold text-[#187e8d]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenAssign(team)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <UserCheck size={13} />
                    Assign Member / Task
                  </button>
                  <Link
                    to={`/faculty/projects/${team.id === 'wt1' ? 'wp1' : 'wp2'}`}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Faculty Project Workspace &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Assign Student Member Modal */}
        {assignModalOpen && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Plus size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Assign Student to {selectedTeam.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add registered student to cohort roster.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddMember} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Student Name</label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Divya Prakash"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Role / Functional Area</label>
                  <input
                    type="text"
                    value={newStudentRole}
                    onChange={(e) => setNewStudentRole(e.target.value)}
                    placeholder="e.g. Data Analysis, Sensor Calibration"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Assign to Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}