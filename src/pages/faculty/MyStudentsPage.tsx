import { useState, useMemo } from 'react'
import {
  Search,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { FilterSelect } from '../../components/forms/FilterSelect'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { EmptyState } from '../../components/common/EmptyState'
import {
  initialFacultyStudentMembers,
  type FacultyStudentMember,
} from '../../data/facultyStudentManagement'

export function MyStudentsPage() {
  const [students, setStudents] = useState<FacultyStudentMember[]>(initialFacultyStudentMembers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [projectFilter, setProjectFilter] = useState('All Projects')
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // New Student state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newProject, setNewProject] = useState('Solar Water Monitoring Pilot')
  const [newSkills, setNewSkills] = useState('')

  const statusOptions = ['All Statuses', 'Component Lead', 'Active', 'On Leave', 'Completed']
  const projectOptions = useMemo(() => {
    const s = new Set<string>()
    students.forEach((item) => s.add(item.projectName))
    return ['All Projects', ...Array.from(s)]
  }, [students])

  const filteredStudents = useMemo(() => {
    return students.filter((stu) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        stu.name.toLowerCase().includes(q) ||
        stu.email.toLowerCase().includes(q) ||
        stu.role.toLowerCase().includes(q) ||
        stu.skills.some((sk) => sk.toLowerCase().includes(q))

      const matchesStatus =
        statusFilter === 'All Statuses' || stu.participationStatus === statusFilter
      const matchesProject =
        projectFilter === 'All Projects' || stu.projectName === projectFilter

      return matchesSearch && matchesStatus && matchesProject
    })
  }, [students, search, statusFilter, projectFilter])

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const newEntry: FacultyStudentMember = {
      id: `stu-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole.trim() || 'Research Assistant',
      skills: newSkills
        ? newSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Technical Prototyping'],
      participationStatus: 'Active',
      projectId: 'wp1',
      projectName: newProject,
      joinedDate: 'Sep 2026',
      tasksAssigned: 2,
      tasksCompleted: 0,
    }

    setStudents((prev) => [newEntry, ...prev])
    setIsAssignOpen(false)
    setNewName('')
    setNewEmail('')
    setNewRole('')
    setNewSkills('')
    setFeedback(`Student "${newName.trim()}" registered to ${newProject}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <HEILayout
      title="My Students"
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'My Students' },
      ]}
    >
      <PageContainer>
        <PageHeader
          title="My Students"
          description="Supervise, evaluate, and assign tasks to student innovators under your faculty guidance."
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'My Students' },
          ]}
          action={
            <button
              type="button"
              onClick={() => setIsAssignOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1a4a7a]"
            >
              <Plus size={15} />
              <span>Enroll Student</span>
            </button>
          }
        />

        {feedback && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by student name, role, email, or skill..."
            />
          </div>
          <div className="w-full md:w-44">
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </div>
          <div className="w-full md:w-56">
            <FilterSelect
              label="Project"
              value={projectFilter}
              options={projectOptions}
              onChange={setProjectFilter}
            />
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No students found"
            description="Try changing your search keywords or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Core Skills</th>
                  <th className="px-4 py-3.5">Tasks</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const taskRate =
                    stu.tasksAssigned > 0
                      ? Math.round((stu.tasksCompleted / stu.tasksAssigned) * 100)
                      : 0

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-full bg-[#d9eeee] font-bold text-[#12365a]">
                            {stu.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-bold text-[#13243b]">{stu.name}</p>
                            <p className="text-[11px] text-slate-400">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate font-medium text-slate-800">
                        {stu.projectName}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700">{stu.role}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {stu.skills.map((sk) => (
                            <span
                              key={sk}
                              className="rounded bg-[#e8f5f5] px-2 py-0.5 text-[10px] font-semibold text-[#187e8d]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">
                            {stu.tasksCompleted}/{stu.tasksAssigned}
                          </span>
                          <span className="text-[10px] text-slate-400">({taskRate}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            stu.participationStatus === 'Component Lead'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : stu.participationStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {stu.participationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setFeedback(`Tasks reviewed for ${stu.name}.`)
                            setTimeout(() => setFeedback(null), 3000)
                          }}
                          className="rounded border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Enroll Student Modal */}
        <Modal
          open={isAssignOpen}
          title="Enroll Student in Innovation Project"
          onClose={() => setIsAssignOpen(false)}
        >
          <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs">
            <FormField
              label="Full Name"
              required
              placeholder="e.g. Anand Mahindra"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <FormField
              label="University Email"
              type="email"
              required
              placeholder="e.g. anand.m@nitk.edu.in"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <FormField
              label="Functional Role"
              placeholder="e.g. Hardware Circuit Designer"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />

            <div>
              <label className="block font-bold text-slate-700">Assigned Project</label>
              <select
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              >
                {projectOptions
                  .filter((p) => p !== 'All Projects')
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
            </div>

            <FormField
              label="Skills (comma separated)"
              placeholder="e.g. Python, PCB Layout, Arduino"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsAssignOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
              >
                Enroll Student
              </button>
            </div>
          </form>
        </Modal>
      </PageContainer>
    </HEILayout>
  )
}
