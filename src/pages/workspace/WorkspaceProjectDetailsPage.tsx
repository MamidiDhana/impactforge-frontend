import { useState } from 'react'
import { Bot, CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from './WorkspaceShared'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import { Modal } from '../../components/common/Modal'
import { facultyProjects } from '../../data/facultyProjects'
import { initialFacultyProjectTasks } from '../../data/facultyStudentManagement'

export function WorkspaceProjectDetailsPage({ role: _role = 'faculty' }: { role?: 'faculty' } = {}) {
  const { id } = useParams()
  const project = facultyProjects.find((item) => item.id === id) ?? facultyProjects[0]
  const [open, setOpen] = useState(false)

  return (
    <FacultyStudentLayout role="faculty" title="Project Details">
      <WorkspacePage
        role="faculty"
        title={project.title}
        description="Track project delivery, milestones, tasks, outputs, and recent updates."
        breadcrumbs={[
          { label: 'Faculty', href: '/faculty/dashboard' },
          { label: 'Projects', href: '/faculty/projects' },
          { label: 'Project Details' },
        ]}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <ResponsiveCard>
            <h2 className="font-[Manrope] font-bold text-[#13243b]">Related problem</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {project.problemTitle}: {project.description}
            </p>
            <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2">
              <span>University: <b>{project.university}</b></span>
              <span>Faculty lead: <b>{project.facultyLead}</b></span>
              <span>Student team: <b>{project.studentTeam}</b></span>
              <span>Beneficiaries: <b>{project.beneficiaries.toLocaleString()}</b></span>
              <span>Stage: <b>{project.stage}</b></span>
              <span>Partners: <b>{project.partners.join(', ') || 'None yet'}</b></span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-sm font-semibold">
                <span>{project.stage}</span>
                <span className="text-[#187e8d]">{project.progress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[#1c91a1]" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          </ResponsiveCard>

          <ResponsiveCard className="border-[#b8dfe0]">
            <div className="flex items-center gap-3">
              <Bot className="text-[#187e8d]" />
              <h2 className="font-[Manrope] font-bold text-[#13243b]">Mock AI-assisted capability-gap analysis</h2>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Required capabilities are compared with the current team for frontend demonstration only.
            </p>
            <div className="mt-5 space-y-3">
              {project.capabilityGaps.map((gap) => (
                <p key={gap} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  {gap} · Suggested action: request additional support
                </p>
              ))}
            </div>
          </ResponsiveCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResponsiveCard>
            <h2 className="font-[Manrope] font-bold text-[#13243b]">Milestones and timeline</h2>
            <div className="mt-4 grid gap-3">
              {['Proposal', 'Team Formation', project.stage, 'Testing', 'Impact Tracking'].map((stage, index) => (
                <div key={stage} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid size-7 place-items-center rounded-full ${
                      index <= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {index <= 2 ? <CheckCircle2 size={15} /> : index + 1}
                  </span>
                  {stage}
                </div>
              ))}
            </div>
          </ResponsiveCard>

          <ResponsiveCard>
            <h2 className="font-[Manrope] font-bold text-[#13243b]">Tasks and recent updates</h2>
            <div className="mt-4 space-y-3">
              {initialFacultyProjectTasks
                .filter((task) => task.projectName === project.title || project.id === 'wp1')
                .map((task) => (
                  <p key={task.id} className="flex justify-between text-sm text-slate-600">
                    <span>{task.title}</span>
                    <span className="text-xs text-slate-400">{task.status}</span>
                  </p>
                ))}
            </div>
          </ResponsiveCard>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-[#12365a] px-4 py-2.5 text-sm font-bold text-white"
          >
            Add milestone
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            Assign task
          </button>
          <Link
            to="/faculty/teams"
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            View team members
          </Link>
          <Link
            to={`/faculty/projects/${project.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#187e8d] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#156e7c]"
          >
            Open Faculty Project Workspace &rarr;
          </Link>
        </div>

        <Modal open={open} title="Add milestone" onClose={() => setOpen(false)}>
          <p className="text-sm text-slate-600">This is a mock frontend form. No files or updates are sent to a server.</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-5 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white"
          >
            Save
          </button>
        </Modal>
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}