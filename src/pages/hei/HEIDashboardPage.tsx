import { BarChart3, ClipboardList, FilePlus2, FolderKanban, GraduationCap, Network, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { DashboardWelcome } from '../../components/dashboard/DashboardWelcome'
import { StatCard } from '../../components/common/StatCard'
import { QuickActionCard } from '../../components/dashboard/QuickActionCard'
import { SectionHeader } from '../../components/common/SectionHeader'
import { HEIProblemCard } from './HEIShared'
import { heiProblems } from '../../data/heiProblems'
import { heiProjects } from '../../data/heiProjects'

export function HEIDashboardPage() {
  const navigate = useNavigate()
  return (
    <HEILayout title="University">
      <HEIPage
        title="University"
        description="Manage institutional project collaboration"
        breadcrumbs={[{ label: 'University' }]}
      >
        <div className="space-y-8">
          <DashboardWelcome
            name="Collaboration Overview"
            description="Discover validated community problems, contribute institutional capabilities, and build solution teams."
          />
          <section>
            <SectionHeader title="University overview" description="Illustrative institutional data." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Recommended problems" value="12" description="Demo data" icon={FilePlus2} />
              <StatCard label="Accepted challenges" value="4" description="Demo data" icon={ClipboardList} />
              <StatCard label="Active projects" value="2" description="Demo data" icon={FolderKanban} />
              <StatCard label="Faculty members" value="36" description="Demo data" icon={GraduationCap} />
              <StatCard label="Capability gaps" value="5" description="Demo data" icon={Network} />
              <StatCard label="Collaboration requests" value="8" description="Demo data" icon={Package} />
            </div>
          </section>
          <section>
            <SectionHeader title="Quick actions" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="Explore recommended problems"
                description="Find validated challenges that fit your institution."
                icon={FilePlus2}
                onClick={() => navigate('/hei/recommended-problems')}
              />
              <QuickActionCard
                title="View accepted challenges"
                description="Track challenges your university accepted."
                icon={ClipboardList}
                onClick={() => navigate('/hei/accepted-challenges')}
              />
              <QuickActionCard
                title="Add faculty member"
                description="Grow the academic capability directory."
                icon={GraduationCap}
                onClick={() => navigate('/hei/faculty')}
              />
              <QuickActionCard
                title="Add resource"
                description="Make institutional resources visible."
                icon={Package}
                onClick={() => navigate('/hei/resources')}
              />
              <QuickActionCard
                title="Review requests"
                description="Respond to collaboration offers and requests."
                icon={ClipboardList}
                onClick={() => navigate('/hei/collaboration-requests')}
              />
              <QuickActionCard
                title="Review capability gaps"
                description="Plan for missing expertise and resources."
                icon={Network}
                onClick={() => navigate('/hei/capability-gaps')}
              />
            </div>
          </section>
          <section>
            <SectionHeader
              title="Recommended problems"
              actionText="View all"
              onAction={() => navigate('/hei/recommended-problems')}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {heiProblems.slice(0, 3).map((problem) => (
                <HEIProblemCard key={problem.id} problem={problem} />
              ))}
            </div>
          </section>
          <section>
            <SectionHeader
              title="Active projects"
              actionText="View all"
              onAction={() => navigate('/hei/projects')}
            />
            <div className="grid gap-3">
              {heiProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-semibold text-[#13243b]">{project.title}</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.problemTitle} · {project.facultyLead} · {project.stage}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#187e8d]">{project.progress}%</span>
                    <Link to="/hei/projects" className="text-sm font-semibold text-[#187e8d]">
                      View project
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-[#e8f5f5] p-4">
              <p className="text-xs uppercase text-[#187e8d]">Strong capabilities</p>
              <p className="mt-2 text-sm font-semibold text-[#13243b]">Water systems · Data science</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-xs uppercase text-slate-500">Available resources</p>
              <p className="mt-2 text-sm font-semibold text-[#13243b]">Labs · Field sensors</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs uppercase text-amber-700">Missing capabilities</p>
              <p className="mt-2 text-sm font-semibold text-[#13243b]">Community deployment</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs uppercase text-blue-700">Partner areas</p>
              <p className="mt-2 text-sm font-semibold text-[#13243b]">Water MSMEs · CSR</p>
            </div>
          </section>
          <section>
            <SectionHeader title="Recent activity" />
            <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 sm:grid-cols-2">
              {[
                'Challenge accepted',
                'Faculty member added',
                'Institutional resource updated',
                'Capability gap identified',
                'Collaboration request received',
                'Project milestone completed',
              ].map((item, index) => (
                <p key={item} className="flex gap-3">
                  <BarChart3 size={16} className="text-[#187e8d]" />
                  {item}
                  <span className="ml-auto text-xs text-slate-400">{index + 1}d ago</span>
                </p>
              ))}
            </div>
          </section>
        </div>
      </HEIPage>
    </HEILayout>
  )
}