import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'
interface PageHeaderProps { title: string; description?: string; action?: ReactNode; breadcrumbs?: BreadcrumbItem[]; className?: string }
export function PageHeader({ title, description, action, breadcrumbs, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 space-y-3', className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-[Manrope] text-xl font-bold tracking-tight text-[#13243b] sm:text-2xl break-words">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}