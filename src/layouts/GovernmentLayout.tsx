import { useState, type ReactNode } from 'react'
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  FileSearch,
  FolderKanban,
  History,
  LayoutDashboard,
  Network,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { useAuth } from '../context/AuthContext'

interface GovernmentLayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

const governmentNavItems = [
  { label: 'Government', href: '/government/dashboard', icon: LayoutDashboard },
  { label: 'Problem Queue', href: '/government/problem-queue', icon: FileSearch },
  { label: 'Validation', href: '/government/validation', icon: ClipboardCheck },
  { label: 'Duplicates', href: '/government/duplicate-analysis', icon: Network },
  { label: 'Validated', href: '/government/validated-problems', icon: ShieldCheck },
  { label: 'HEI Match', href: '/government/hei-matching', icon: Network },
  { label: 'Projects', href: '/government/projects', icon: FolderKanban },
  { label: 'Impact', href: '/government/analytics', icon: BarChart3 },
  { label: 'Audit Logs', href: '/government/audit-logs', icon: History },
  { label: 'Alerts', href: '/government/notifications', icon: Bell },
  { label: 'Profile', href: '/government/profile', icon: UserRound },
]

export function GovernmentLayout({ children, title, breadcrumbs }: GovernmentLayoutProps) {
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
        items={governmentNavItems}
        user={currentUser}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={signOut}
      />
      <div className="min-w-0 flex-1">
        <DashboardTopbar
          portalName="Government"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={5}
          actions={
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Jharkhand Government Operations</span>
            </div>
          }
          onNotificationsClick={() => navigate('/government/notifications')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/government/profile')}
          onLogout={signOut}
        />
        <main>{children}</main>
      </div>
    </div>
  )
}