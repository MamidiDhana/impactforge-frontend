import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { PartnerSidebar } from '../components/partner/PartnerSidebar'
import { useAuth } from '../context/AuthContext'
import { partnerOrganization } from '../data/partnerOrganization'
import { partnerNotifications } from '../data/partnerNotifications'
import type { BreadcrumbItem } from '../components/common/Breadcrumbs'

interface PartnerLayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: BreadcrumbItem[]
  search?: ReactNode
}

export function PartnerLayout({ children, title, breadcrumbs, search }: PartnerLayoutProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!currentUser) return null

  const unreadNotificationsCount = partnerNotifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      {/* Responsive Sidebar */}
      <PartnerSidebar
        user={currentUser}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardTopbar
          portalName="Partner"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={unreadNotificationsCount}
          onNotificationsClick={() => navigate('/partner/notifications')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/partner/profile')}
          onLogout={handleLogout}
          search={
            search ?? (
              <div className="relative">
                <span className="hidden xl:inline-block rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold text-[#187e8d] border border-teal-100">
                  {partnerOrganization.name}
                </span>
              </div>
            )
          }
        />

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}