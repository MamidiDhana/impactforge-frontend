import { useState, type ReactNode } from 'react'
import {
  ClipboardList,
  FileSearch,
  FileText,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar, type NavigationItem } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { useAuth } from '../context/AuthContext'

interface HEILayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

const items: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/university',
    icon: LayoutDashboard,
  },
  {
    label: 'Faculty',
    href: '/university/faculty',
    icon: Users,
    children: [
      {
        label: 'Faculty Dashboard',
        href: '/university/faculty',
        icon: LayoutDashboard,
      },
      {
        label: 'Problems',
        href: '/university/problems',
        icon: FileSearch,
      },
      {
        label: 'Reports',
        href: '/university/faculty/reports',
        icon: FileText,
      },
    ],
  },
  {
    label: 'Capability & Resources',
    href: '/university/reports',
    icon: ClipboardList,
  },
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
          portalName="University Portal"
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

export const UniversityLayout = HEILayout