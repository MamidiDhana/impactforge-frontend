import { useMemo, useState } from 'react'
import {
  ChevronRight,
  ExternalLink,
  Filter,
  FolderKanban,
  RotateCcw,
  Search,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'
import { EmptyState } from '../../components/common/EmptyState'
import { facultyProjects } from '../../data/facultyProjects'

export function FacultyProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(facultyProjects.map((p) => p.category)))],
    []
  )

  const stages = useMemo(
    () => ['All', ...Array.from(new Set(facultyProjects.map((p) => p.stage)))],
    []
  )

  const filtered = useMemo(() => {
    return facultyProjects.filter((p) => {
      const matchesSearch =
        search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.problemTitle.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.studentTeam.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'All' || p.stage === statusFilter
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [search, statusFilter, categoryFilter])

  return (
    <FacultyStudentLayout role="faculty" title="Projects">
      <WorkspacePage
        role="faculty"
        title="Projects"
        description="Oversee mentored research initiatives, monitor development stages, and review team outputs."
        breadcrumbs={[
          { label: 'Faculty', href: '/faculty/dashboard' },
          { label: 'Projects' },
        ]}
      >
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by title, community problem, or student team..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Stage / Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg === 'All' ? 'All Stages' : stg}
                    </option>
                  ))}
                </select>

                <label className="text-xs font-semibold text-slate-500 ml-2">Category:</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>
                Showing <strong>{filtered.length}</strong> of {facultyProjects.length} assigned projects
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('All')
                  setCategoryFilter('All')
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#187e8d] hover:underline"
              >
                <RotateCcw size={12} />
                Reset filters
              </button>
            </div>
          </div>

          {/* Projects Cards Grid */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Projects</h2>
              <div className="grid gap-6 md:grid-cols-2">
              {filtered.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#b8dfe0] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#187e8d]">
                        {project.category}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        {project.stage}
                      </span>
                    </div>

                    <h3 className="mt-3 font-[Manrope] text-lg font-bold text-[#13243b]">
                      <Link to={`/projects/${project.id}/overview`} className="hover:text-[#187e8d]">
                        {project.title}
                      </Link>
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      Problem: <strong className="text-slate-700">{project.problemTitle}</strong>
                    </p>

                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar & Beneficiaries */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Stage Progress</span>
                        <span className="font-bold text-[#187e8d]">{project.progress}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#187e8d]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {project.studentTeam}
                        </span>
                        <span>{project.beneficiaries.toLocaleString()} Beneficiaries</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      <strong>Next Target:</strong> {project.nextMilestone}
                    </div>

                    {project.partners.length > 0 && (
                      <div className="mt-2 text-xs text-slate-500">
                        <strong>Partners:</strong> {project.partners.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link
                      to={`/projects/${project.id}/overview`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                    >
                      Open Project Workspace
                      <ExternalLink size={13} />
                    </Link>
                    <Link
                      to={`/faculty/projects/${project.id}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Summary
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="No projects match your search or filter"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                    setCategoryFilter('All')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <Filter size={14} />
                  Clear Filters
                </button>
              }
            />
          )}
        </div>
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}