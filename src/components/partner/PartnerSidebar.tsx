import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileSearch,
  FileText,
  Handshake,
  Layers,
  LayoutDashboard,
  PlusCircle,
  Settings,
} from 'lucide-react'
import { DashboardSidebar } from '../navigation/DashboardSidebar'
import type { User } from '../../types'

const partnerNavItems = [
  { label: 'Partner', href: '/partner/dashboard', icon: LayoutDashboard },
  { label: 'Resources', href: '/partner/resources', icon: Layers },
  { label: 'Add Resource', href: '/partner/resources', icon: PlusCircle },
  { label: 'Requests', href: '/partner/collaboration-requests', icon: Handshake },
  { label: 'Contributions', href: '/partner/active-collaborations', icon: BriefcaseBusiness },
  { label: 'Matches', href: '/partner/recommended-projects', icon: FileSearch },
  { label: 'Impact', href: '/partner/impact', icon: ChartNoAxesCombined },
  { label: 'Documents', href: '/partner/supported-projects', icon: FileText },
  { label: 'Alerts', href: '/partner/notifications', icon: Bell },
  { label: 'Settings', href: '/partner/settings', icon: Settings },
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
