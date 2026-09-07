import { useState, type ReactNode } from 'react'
import { Bell, ClipboardList, FileSearch, FolderKanban, GraduationCap, LayoutDashboard, Network, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { useAuth } from '../context/AuthContext'
interface HEILayoutProps { children: ReactNode; title: string; breadcrumbs?: { label: string; href?: string }[] }
const items = [
  { label: 'University', href: '/hei/dashboard', icon: LayoutDashboard },
  { label: 'Problems', href: '/hei/accepted-challenges', icon: FileSearch },
  { label: 'Recommendations', href: '/hei/recommended-problems', icon: ClipboardList },
  { label: 'Requests', href: '/hei/collaboration-requests', icon: Network },
  { label: 'Projects', href: '/hei/projects', icon: FolderKanban },
  { label: 'Faculty', href: '/hei/faculty', icon: GraduationCap },
  { label: 'Resources', href: '/hei/resources', icon: Package },
  { label: 'Progress', href: '/hei/capability-gaps', icon: ClipboardList },
  { label: 'Alerts', href: '/hei/notifications', icon: Bell },
]
export function HEILayout({ children, title, breadcrumbs }: HEILayoutProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!currentUser) return null

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      <DashboardSidebar
        items={items}
        user={currentUser}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={signOut}
      />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          portalName="University"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={4}
          onNotificationsClick={() => navigate('/hei/notifications')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/hei/profile')}
          onLogout={signOut}
        />
        <main>{children}</main>
      </div>
    </div>
  )
}