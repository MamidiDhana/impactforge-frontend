import { useState, type ReactNode } from 'react'
import {
  Bell,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  Network,
  Users,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
  title: string
  role?: 'faculty'
  breadcrumbs?: { label: string; href?: string }[]
}

const facultyItems = [
  { label: 'Faculty', href: '/faculty/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/faculty/projects', icon: FolderKanban },
  { label: 'Teams', href: '/faculty/teams', icon: Users },
  { label: 'Requests', href: '/faculty/capability-gaps', icon: Network },
  { label: 'Guidance', href: '/faculty/guidance', icon: ClipboardCheck },
  { label: 'Milestones', href: '/faculty/milestones', icon: ClipboardCheck },
  { label: 'Resources', href: '/faculty/resources', icon: Network },
  { label: 'Reports', href: '/faculty/reports', icon: FolderKanban },
  { label: 'Alerts', href: '/faculty/notifications', icon: Bell },
  { label: 'Profile', href: '/faculty/profile', icon: UserRound },
]

export function FacultyStudentLayout({ children, title, breadcrumbs }: LayoutProps) {
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
        items={facultyItems}
        user={currentUser}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={signOut}
      />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          portalName="Faculty"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={3}
          onNotificationsClick={() => navigate('/faculty/notifications')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/faculty/profile')}
          onLogout={signOut}
        />
        <main>{children}</main>
      </div>
    </div>
  )
}

export const FacultyLayout = FacultyStudentLayout