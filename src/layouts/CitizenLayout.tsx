import { useState, type ReactNode } from 'react'
import { Bell, Compass, FilePlus2, LayoutDashboard, MessageSquare, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardSidebar } from '../components/navigation/DashboardSidebar'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { CitizenLanguageSelector } from '../components/citizen/CitizenLanguageSelector'
import { useAuth } from '../context/AuthContext'

interface CitizenLayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: { label: string; href?: string }[]
}

export function CitizenLayout({ children, title, breadcrumbs }: CitizenLayoutProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!currentUser) return null

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const items = [
    { label: 'Citizen', href: '/citizen/dashboard', icon: LayoutDashboard },
    { label: 'Report Problem', href: '/citizen/submit-problem', icon: FilePlus2 },
    { label: 'Track Problem', href: '/citizen/problems', icon: Compass },
    { label: 'Feedback', href: '/citizen/feedback', icon: MessageSquare },
    { label: 'Alerts', href: '/citizen/notifications', icon: Bell },
    { label: 'Profile', href: '/citizen/profile', icon: UserRound },
  ]

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
          portalName="Citizen"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={2}
          actions={<CitizenLanguageSelector />}
          onNotificationsClick={() => navigate('/citizen/notifications')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/citizen/profile')}
          onLogout={signOut}
        />
        <main>{children}</main>
      </div>
    </div>
  )
}