import { useMemo, useState } from 'react'
import { Building2, Search } from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { FilterBar } from '../../components/forms/FilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { ProjectProgress } from '../../components/projects/ProjectProgress'
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge'
import { heiProjects } from '../../data/heiProjects'

export function HEIProjectsPage() {
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All stages')

  const results = useMemo(
    () =>
      heiProjects.filter(
        (item) =>
          `${item.title} ${item.problemTitle}`.toLowerCase().includes(search.toLowerCase()) &&
          (stage === 'All stages' || item.stage === stage)
      ),
    [search, stage]
  )

  return (
    <HEILayout title="Projects">
      <HEIPage
        title="Projects"
        description="Track projects, capability gaps, and partner status."
        breadcrumbs={[
          { label: 'University', href: '/hei/dashboard' },
          { label: 'Projects' },
        ]}
      >
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: 'stage',
              label: 'Current stage',
              value: stage,
              options: ['All stages', 'Team Formation', 'Prototype', 'Pilot', 'Completed'].map((value) => ({
                label: value,
                value,
              })),
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
                  <p className="mt-2 text-sm text-slate-500">{project.problemTitle}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Building2 size={14} className="text-[#187e8d]" />
                    {project.facultyLead} · {project.studentTeam}
                  </p>
                  <div className="mt-5">
                    <ProjectProgress percentage={project.progress} currentStage={project.stage} />
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Capability gaps: {project.capabilityGaps.join(' · ')} · Partner status: {project.partnerStatus}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">Updated {project.lastUpdated}</p>
                  <button
                    type="button"
                    className="mt-4 rounded-lg border border-[#12365a] px-4 py-2 text-sm font-semibold text-[#12365a]"
                  >
                    View project
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={Search} title="No projects found" />
          </div>
        )}
      </HEIPage>
    </HEILayout>
  )
}