import { useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { FilterBar } from '../../components/forms/FilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { ProjectProgress } from '../../components/projects/ProjectProgress'
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge'
import { governmentProjects } from '../../data/governmentProjects'
export function GovernmentProjectsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [stage, setStage] = useState('All stages')
  const results = useMemo(
    () =>
      governmentProjects.filter(
        (item) =>
          `${item.title} ${item.problemTitle}`.toLowerCase().includes(search.toLowerCase()) &&
          (status === 'All statuses' || item.status === status) &&
          (stage === 'All stages' || item.stage === stage)
      ),
    [search, stage, status]
  )
  return (
    <GovernmentLayout title="Projects">
      <GovPage
        title="Projects"
        description="Follow projects created from validated community problems."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Projects' },
        ]}
      >
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: status,
              options: ['All statuses', 'Active', 'Completed'].map((value) => ({ label: value, value })),
              onChange: setStatus,
            },
            {
              id: 'stage',
              label: 'Current stage',
              value: stage,
              options: ['All stages', 'Prototype', 'Pilot', 'Completed'].map((value) => ({ label: value, value })),
              onChange: setStage,
            },
          ]}
        />
        {results.length ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Projects</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((project) => (
                <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">{project.title}</h3>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">Related problem: {project.problemTitle}</p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Building2 size={14} className="text-[#187e8d]" />
                  {project.organization} · {project.facultyLead}
                </p>
                <div className="mt-5">
                  <ProjectProgress percentage={project.progress} currentStage={project.stage} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                  <span>Updated {project.lastUpdated}</span>
                </div>
                <button type="button" className="mt-5 rounded-lg border border-[#12365a] px-4 py-2 text-sm font-semibold text-[#12365a]">
                  View project
                </button>
              </article>
            ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={Search} title="No projects found" description="Try a different project filter." />
          </div>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}