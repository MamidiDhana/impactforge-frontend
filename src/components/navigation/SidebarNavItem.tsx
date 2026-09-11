import { useState, useEffect } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

export interface NavigationSubItem {
  label: string
  href: string
  icon?: LucideIcon
}

export interface SidebarNavItemProps {
  label: string
  href: string
  icon: LucideIcon
  children?: NavigationSubItem[]
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNavItem({
  label,
  href,
  icon: Icon,
  children: subItems,
  collapsed = false,
  onNavigate,
}: SidebarNavItemProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const hasChildren = Boolean(subItems && subItems.length > 0)

  // Check if any child item matches the current route
  const isAnyChildActive = Boolean(
    subItems?.some((child) => {
      if (child.href === '/university/faculty') {
        return location.pathname === '/university/faculty'
      }
      return (
        location.pathname === child.href ||
        location.pathname.startsWith(`${child.href}/`)
      )
    })
  )

  const isParentExactActive =
    location.pathname === href || (href !== '/' && location.pathname.startsWith(`${href}/`))

  const [isOpen, setIsOpen] = useState(isAnyChildActive || isParentExactActive)

  // Automatically remain expanded when the current route is any Faculty child route
  useEffect(() => {
    if (isAnyChildActive || isParentExactActive) {
      setIsOpen(true)
    }
  }, [location.pathname, isAnyChildActive, isParentExactActive])

  // Simple item without children
  if (!hasChildren) {
    return (
      <NavLink
        to={href}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-[#e8f5f5] text-[#12365a] font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#12365a]',
            collapsed && 'justify-center px-2'
          )
        }
      >
        <Icon size={18} className="shrink-0" />
        <span className={cn(collapsed && 'sr-only')}>{label}</span>
      </NavLink>
    )
  }

  // Collapsed desktop sidebar: render icon link with tooltip
  if (collapsed) {
    return (
      <div className="relative group flex justify-center">
        <NavLink
          to={href}
          onClick={onNavigate}
          title={label}
          className={cn(
            'flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors',
            isAnyChildActive || isParentExactActive
              ? 'bg-[#e8f5f5] text-[#12365a]'
              : 'text-slate-600 hover:bg-slate-100 hover:text-[#12365a]'
          )}
        >
          <Icon size={18} className="shrink-0" />
          <span className="sr-only">{label}</span>
        </NavLink>
      </div>
    )
  }

  // Expanded sidebar with collapsible submenu
  return (
    <div className="space-y-1">
      <div
        className={cn(
          'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isAnyChildActive || isParentExactActive
            ? 'bg-slate-100/80 text-[#12365a] font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-[#12365a]'
        )}
      >
        <button
          type="button"
          onClick={() => {
            navigate(href)
            setIsOpen(true)
            onNavigate?.()
          }}
          className="flex flex-1 items-center gap-3 text-left focus:outline-none"
        >
          <Icon size={18} className="shrink-0 text-[#187e8d]" />
          <span>{label}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen((prev) => !prev)
          }}
          aria-label={isOpen ? `Collapse ${label} menu` : `Expand ${label} menu`}
          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
        >
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Nested Submenu */}
      {isOpen && (
        <div className="ml-4 space-y-1 border-l-2 border-slate-200/80 pl-2.5 pt-1">
          {subItems?.map((child) => {
            const isChildActive =
              child.href === '/university/faculty'
                ? location.pathname === '/university/faculty'
                : location.pathname === child.href ||
                  location.pathname.startsWith(`${child.href}/`)

            return (
              <NavLink
                key={child.href}
                to={child.href}
                end={child.href === '/university/faculty'}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                  isChildActive
                    ? 'bg-[#e8f5f5] text-[#12365a] font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#12365a]'
                )}
              >
                {child.icon ? (
                  <child.icon size={14} className="shrink-0 text-[#187e8d]" />
                ) : (
                  <span
                    className={cn(
                      'size-1.5 rounded-full shrink-0',
                      isChildActive ? 'bg-[#187e8d]' : 'bg-slate-300'
                    )}
                  />
                )}
                <span>{child.label}</span>
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}