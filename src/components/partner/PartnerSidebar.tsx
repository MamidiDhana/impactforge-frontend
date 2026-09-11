import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileSearch,
  FileText,
  Handshake,
  LayoutDashboard,
} from 'lucide-react'
import { DashboardSidebar } from '../navigation/DashboardSidebar'
import type { User } from '../../types'

const partnerNavItems = [
  { label: 'Industry Partnerships', href: '/partner/dashboard', icon: LayoutDashboard },
  { label: 'Requests', href: '/partner/collaboration-requests', icon: Handshake },
  { label: 'Contributions', href: '/partner/active-collaborations', icon: BriefcaseBusiness },
  { label: 'Matches', href: '/partner/recommended-projects', icon: FileSearch },
  { label: 'Impact', href: '/partner/impact', icon: ChartNoAxesCombined },
  { label: 'Documents', href: '/partner/supported-projects', icon: FileText },
  { label: 'Alerts', href: '/partner/notifications', icon: Bell },
]

interface PartnerSidebarProps {
  user?: User
  collapsed?: boolean
  mobileOpen?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onMobileClose?: () => void
  onLogout?: () => void
}

export function PartnerSidebar({
  user,
  collapsed = false,
  mobileOpen = false,
  onCollapsedChange,
  onMobileClose,
  onLogout,
}: PartnerSidebarProps) {
  return (
    <DashboardSidebar
      items={partnerNavItems}
      user={user}
      collapsed={collapsed}
      mobileOpen={mobileOpen}
      onCollapsedChange={onCollapsedChange}
      onMobileClose={onMobileClose}
      onLogout={onLogout}
    />
  )
}
