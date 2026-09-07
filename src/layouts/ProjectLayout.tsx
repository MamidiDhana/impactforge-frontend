import { useState, type ReactNode } from 'react'
import { ArrowLeft, Bell, FileText, Flag, FolderKanban, MessageSquare, Network, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { ProjectProgress } from '../components/projects/ProjectProgress'
import { useAuth } from '../context/AuthContext'
import type { WorkspaceProjectDetail } from '../types'

interface ProjectLayoutProps { project: WorkspaceProjectDetail; section: string; children: ReactNode }
const tabs = [{ key: 'overview', label: 'Overview', icon: FolderKanban }, { key: 'team', label: 'Team', icon: Users }, { key: 'milestones', label: 'Milestones', icon: Flag }, { key: 'tasks', label: 'Tasks', icon: FileText }, { key: 'documents', label: 'Documents', icon: FileText }, { key: 'discussions', label: 'Discussions', icon: MessageSquare }, { key: 'capability-gaps', label: 'Capability Gaps', icon: Network }, { key: 'partners', label: 'Partners', icon: Users }, { key: 'feedback', label: 'Feedback', icon: MessageSquare }, { key: 'impact', label: 'Impact Report', icon: Flag }]
export function ProjectLayout({ project, section, children }: ProjectLayoutProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!currentUser) return null

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const sideItems = [
    { label: 'Project Workspace', href: `/projects/${project.id}/overview`, icon: FolderKanban },
    { label: 'My Dashboard', href: `/${currentUser.role}/dashboard`, icon: Users },
    { label: 'Notifications', href: `/${currentUser.role}/notifications`, icon: Bell },
  ]

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      <DashboardSidebar
        items={sideItems}
        user={currentUser}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={signOut}
      />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          title={project.name}
          user={currentUser}
          notificationCount={3}
          onNotificationsClick={() => navigate(`/${currentUser.role}/notifications`)}
          onProfile={() => navigate(`/${currentUser.role}/profile`)}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={signOut}
        />
        <main>
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <Link
                    to={`/${currentUser.role}/dashboard`}
                    className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#12365a]"
                  >
                    <ArrowLeft size={14} />Back to dashboard
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-[Manrope] text-2xl font-bold text-[#13243b]">{project.name}</h1>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {project.health}
                    </span>
                    <span className="rounded-full bg-[#e8f5f5] px-2.5 py-1 text-xs font-semibold text-[#187e8d]">
                      {project.stage}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {project.problemTitle} · {project.university}
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <ProjectProgress percentage={project.progress} currentStage={project.stage} />
                </div>
              </div>
              <nav className="mt-6 flex gap-1 overflow-x-auto pb-1" aria-label="Project navigation">
                {tabs.map((tab) => (
                  <Link
                    key={tab.key}
                    to={`/projects/${project.id}/${tab.key}`}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                      section === tab.key ? 'bg-[#e8f5f5] text-[#12365a]' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}