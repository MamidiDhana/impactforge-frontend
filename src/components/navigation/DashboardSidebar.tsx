import type { LucideIcon } from 'lucide-react'
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { AppLogo } from '../common/AppLogo'
import { SidebarNavItem, type NavigationSubItem } from './SidebarNavItem'
import { MobileSidebar } from './MobileSidebar'
import type { User } from '../../types'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  children?: NavigationSubItem[]
}

interface DashboardSidebarProps {
  items: NavigationItem[]
  user?: User
  collapsed?: boolean
  mobileOpen?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onMobileClose?: () => void
  onLogout?: () => void
}

function SidebarContent({
  items,
  user,
  collapsed = false,
  onLogout,
  onToggle,
  onNavigate,
}: Pick<DashboardSidebarProps, 'items' | 'user' | 'collapsed' | 'onLogout'> & {
  onToggle?: () => void
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <AppLogo compact={collapsed} />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <nav aria-label="Dashboard navigation" className="space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {user && (
        <div className="mt-auto border-t border-slate-200 pt-4">
          <div className={collapsed ? 'flex justify-center' : 'flex items-center gap-3 px-2'}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d9eeee] text-sm font-bold text-[#12365a]">
              {user.name.charAt(0)}
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-700">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.role}</p>
              </div>
            )}
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className={
                collapsed
                  ? 'mx-auto mt-3 flex rounded-lg p-2 text-slate-500 hover:bg-slate-100'
                  : 'mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100'
              }
              aria-label="Log out"
            >
              <LogOut size={16} />
              {!collapsed && 'Log out'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function DashboardSidebar({
  items,
  user,
  collapsed = false,
  mobileOpen = false,
  onCollapsedChange,
  onMobileClose,
  onLogout,
}: DashboardSidebarProps) {
  const content = (
    <SidebarContent
      items={items}
      user={user}
      collapsed={collapsed}
      onLogout={onLogout}
      onNavigate={onMobileClose}
      onToggle={() => onCollapsedChange?.(!collapsed)}
    />
  )

  return (
    <>
      <aside
        className={`hidden min-h-screen shrink-0 border-r border-slate-200 bg-white p-4 transition-[width] lg:block ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {content}
      </aside>
      <MobileSidebar open={mobileOpen} onClose={onMobileClose ?? (() => undefined)}>
        {content}
      </MobileSidebar>
    </>
  )
}