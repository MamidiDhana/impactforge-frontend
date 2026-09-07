import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import type { WorkspaceProject } from '../../types'

export function WorkspacePage({
  title,
  description,
  breadcrumbs,
  children,
  action,
  role: _role = 'faculty',
}: {
  title: string
  description?: string
  role?: 'faculty'
  breadcrumbs?: { label: string; href?: string }[]
  children: ReactNode
  action?: ReactNode
}) {
  const finalBreadcrumbs =
    title === 'Faculty'
      ? undefined
      : (breadcrumbs?.map((b) => (b.label === 'Dashboard' ? { ...b, label: 'Faculty' } : b)) ?? [
          { label: 'Faculty', href: '/faculty/dashboard' },
          { label: title },
        ])

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={finalBreadcrumbs}
        action={action}
      />
      {children}
    </PageContainer>
  )
}

export function WorkspaceProjectCard({ project, role = 'faculty' }: { project: WorkspaceProject; role?: 'faculty' }) { return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#187e8d]">{project.category}</p><h2 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b]">{project.title}</h2></div><span className="text-sm font-bold text-[#187e8d]">{project.progress}%</span></div><p className="mt-2 text-sm text-slate-500">{project.problemTitle}</p><p className="mt-3 text-xs text-slate-500">{project.facultyLead} · {project.studentTeam} · {project.stage}</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1c91a1]" style={{ width: `${project.progress}%` }} /></div><p className="mt-3 text-xs text-slate-500">Next milestone: {project.nextMilestone} · Updated {project.lastUpdated}</p><Link to={`/${role}/projects/${project.id}`} className="mt-4 inline-flex rounded-lg border border-[#12365a] px-3 py-2 text-xs font-semibold text-[#12365a]">View project</Link></article> }