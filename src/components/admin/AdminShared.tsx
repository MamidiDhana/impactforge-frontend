import type { ReactNode } from 'react'
import type { BreadcrumbItem } from '../common/Breadcrumbs'
import { PageHeader } from '../common/PageHeader'

interface AdminPageProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  action?: ReactNode
  children: ReactNode
}

export function AdminPage({
  title,
  description,
  breadcrumbs,
  action,
  children,
}: AdminPageProps) {
  const finalBreadcrumbs =
    title === 'Super Admin'
      ? undefined
      : (breadcrumbs?.map((b) => (b.label === 'Dashboard' ? { ...b, label: 'Super Admin' } : b)) ?? [
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: title },
        ])

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={finalBreadcrumbs}
        action={action}
      />
      {children}
    </div>
  )
}
