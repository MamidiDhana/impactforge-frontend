import {
  Activity,
  Bell,
  Building2,
  Cpu,
  FileText,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Tags,
  Users,
} from 'lucide-react'
import { DashboardSidebar } from '../navigation/DashboardSidebar'
import type { User } from '../../types'

const adminNavItems = [
  { label: 'Super Admin', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Roles', href: '/admin/roles', icon: ShieldCheck },
  { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
  { label: 'HEI Registry', href: '/admin/hei-registry', icon: GraduationCap },
  { label: 'Partner Registry', href: '/admin/partner-registry', icon: Handshake },
  { label: 'Taxonomy', href: '/admin/taxonomy', icon: Tags },
  { label: 'AI Models', href: '/admin/ai-models', icon: Cpu },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { label: 'System Health', href: '/admin/system-health', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Alerts', href: '/admin/audit-logs', icon: Bell },
]

interface AdminSidebarProps {
  user?: User
  collapsed?: boolean
  mobileOpen?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onMobileClose?: () => void
  onLogout?: () => void
}

export function AdminSidebar({
  user,
  collapsed = false,
  mobileOpen = false,
  onCollapsedChange,
  onMobileClose,
  onLogout,
}: AdminSidebarProps) {
  return (
    <DashboardSidebar
      items={adminNavItems}
      user={user}
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onCollapsedChange={onCollapsedChange}
      onMobileClose={onMobileClose}
      onLogout={onLogout}
    />
  )
}
