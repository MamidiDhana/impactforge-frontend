import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Bot,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { AppLogo } from '../common/AppLogo'
import { MobileSidebar } from '../navigation/MobileSidebar'
import type { User } from '../../types'

export type AdminSection =
  | 'overview'
  | 'users'
  | 'universities'
  | 'problems'
  | 'teams'
  | 'ai'
  | 'reports'
  | 'settings'
  | 'audit'
  | 'categories'
  | 'announcements'

export interface AdminNavSubItem {
  id: string
  label: string
  href: string
  icon?: LucideIcon
}

export interface AdminNavItemConfig {
  id: string
  label: string
  href: string
  icon: LucideIcon
  children?: AdminNavSubItem[]
}

export const ADMIN_NAV_ITEMS: AdminNavItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', href: '/admin/users', icon: Users },
  { id: 'universities', label: 'Universities', href: '/admin/universities', icon: Building2 },
  { id: 'problems', label: 'Problems', href: '/admin/problems', icon: FileText },
  {
    id: 'ai-management',
    label: 'AI Management',
    href: '/admin/ai/overview',
    icon: Sparkles,
    children: [
      { id: 'ai-overview', label: 'AI Overview', href: '/admin/ai/overview', icon: Bot },
      { id: 'ai-predictions', label: 'AI Predictions', href: '/admin/ai/predictions', icon: Sparkles },
      { id: 'training-dataset', label: 'Training Dataset', href: '/admin/ai/dataset', icon: Database },
      { id: 'retraining-jobs', label: 'Retraining Jobs', href: '/admin/ai/retraining', icon: Cpu },
      { id: 'ai-settings', label: 'AI Settings', href: '/admin/ai/settings', icon: Sliders },
    ],
  },
]

export interface AdminSidebarProps {
  user?: User
  collapsed?: boolean
  mobileOpen?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onMobileClose?: () => void
  onLogout?: () => void
  activeSection?: AdminSection
  onSelectSection?: (section: any) => void
}

export function AdminSidebar({
  user,
  collapsed = false,
  mobileOpen = false,
  onCollapsedChange,
  onMobileClose,
  onLogout,
  activeSection: _activeSection,
  onSelectSection,
}: AdminSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [aiMenuOpen, setAiMenuOpen] = useState(true)

  // Auto-expand AI submenu if on an AI route
  useEffect(() => {
    if (location.pathname.startsWith('/admin/ai')) {
      setAiMenuOpen(true)
    }
  }, [location.pathname])

  const isItemActive = (href: string) => {
    if (href === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/dashboard')) {
      return true
    }
    return location.pathname === href
  }

  const isAiParentActive = location.pathname.startsWith('/admin/ai')

  const handleNavClick = (item: AdminNavItemConfig) => {
    if (item.children) {
      setAiMenuOpen((prev) => !prev)
      if (!location.pathname.startsWith('/admin/ai')) {
        navigate(item.href)
        if (onMobileClose) onMobileClose()
      }
      return
    }

    if (onSelectSection && location.pathname === '/admin/dashboard') {
      onSelectSection(item.id)
    }
    navigate(item.href)
    if (onMobileClose) onMobileClose()
  }

  const handleChildClick = (child: AdminNavSubItem) => {
    navigate(child.href)
    if (onMobileClose) onMobileClose()
  }

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex h-full flex-col">
      {/* Header / Logo */}
      <div className="mb-6 flex items-center justify-between">
        <AppLogo compact={collapsed && !isMobile} />
        {!isMobile && onCollapsedChange && (
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav aria-label="Super Admin Navigation" className="space-y-1.5 overflow-y-auto pr-1">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const active = hasChildren ? isAiParentActive : isItemActive(item.href)

          return (
            <div key={item.id} className="space-y-1">
              <button
                type="button"
                onClick={() => handleNavClick(item)}
                title={item.label}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                  active
                    ? 'bg-[#12365a] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? 'text-teal-300' : 'text-slate-400'} />
                  {(!collapsed || isMobile) && <span>{item.label}</span>}
                </div>

                {hasChildren && (!collapsed || isMobile) && (
                  <span className="text-slate-400">
                    {aiMenuOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>

              {/* Submenu for AI Management */}
              {hasChildren && aiMenuOpen && (!collapsed || isMobile) && (
                <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-3 py-1">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon || Sparkles
                    const isChildActive = location.pathname === child.href

                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => handleChildClick(child)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          isChildActive
                            ? 'bg-teal-50 font-bold text-[#12365a] shadow-2xs border-l-2 border-[#187e8d]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <ChildIcon size={14} className={isChildActive ? 'text-[#187e8d]' : 'text-slate-400'} />
                        <span>{child.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      {user && (
        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className={collapsed && !isMobile ? 'flex justify-center' : 'flex items-center gap-3 px-2'}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-100 text-sm font-bold text-rose-800">
              {user.name.charAt(0)}
            </span>
            {(!collapsed || isMobile) && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-800">{user.name}</p>
                <p className="truncate text-[11px] font-medium text-rose-700">Super Admin</p>
              </div>
            )}
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={
                collapsed && !isMobile
                  ? 'mx-auto mt-3 flex rounded-lg p-2 text-slate-500 hover:bg-slate-100'
                  : 'mt-3 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100'
              }
              aria-label="Log out"
            >
              <LogOut size={16} />
              {(!collapsed || isMobile) && 'Log out'}
            </button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside
        className={`hidden min-h-screen shrink-0 border-r border-slate-200 bg-white p-4 transition-[width] lg:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>
      <MobileSidebar open={mobileOpen} onClose={onMobileClose ?? (() => undefined)}>
        {renderSidebarContent(true)}
      </MobileSidebar>
    </>
  )
}
