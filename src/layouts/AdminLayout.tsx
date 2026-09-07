import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardTopbar } from '../components/navigation/DashboardTopbar'
import { AdminSidebar } from '../components/admin/AdminSidebar'
import { useAuth } from '../context/AuthContext'
import type { BreadcrumbItem } from '../components/common/Breadcrumbs'

interface AdminLayoutProps {
  children: ReactNode
  title: string
  breadcrumbs?: BreadcrumbItem[]
  search?: ReactNode
}

export function AdminLayout({ children, title, breadcrumbs, search }: AdminLayoutProps) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  if (!currentUser) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      {/* Super Admin Sidebar */}
      <AdminSidebar
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
          portalName="Super Admin"
          title={title}
          breadcrumbs={breadcrumbs}
          user={currentUser}
          notificationCount={4}
          onNotificationsClick={() => navigate('/admin/audit-logs')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => navigate('/admin/settings')}
          onLogout={handleLogout}
          search={
            search ?? (
              <div className="relative">
                <span className="hidden xl:inline-block rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                  Super Admin Console
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
