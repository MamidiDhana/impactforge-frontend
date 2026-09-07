import { Link } from 'react-router-dom'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { ProjectCard } from '../../components/projects/ProjectCard'
import { citizenProjects } from '../../data/citizenProjects'
export function MyProjectsPage() {
  return (
    <CitizenLayout title="Projects">
      <PageContainer>
        <PageHeader
          title="Projects"
          description="Follow the teams, milestones, and progress created from your submitted challenges."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Projects' },
          ]}
        />
        <div className="mb-5 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm leading-6 text-slate-600">
          Project information in this portal is mock data for frontend demonstration. Implementation decisions remain with the participating teams and institutions.
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {citizenProjects.map((project) => (
              <ProjectCard key={project.id} project={project} detailsHref={`/citizen/projects/${project.id}`} />
            ))}
          </div>
        </div>
        <Link to="/problems" className="mt-8 inline-flex rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
          Explore more approved problems
        </Link>
      </PageContainer>
    </CitizenLayout>
  )
}