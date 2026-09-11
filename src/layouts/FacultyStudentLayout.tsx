import type { ReactNode } from 'react'
import { HEILayout } from './HEILayout'

interface LayoutProps {
  children: ReactNode
  title: string
  role?: 'faculty'
  breadcrumbs?: { label: string; href?: string }[]
}

/**
 * Re-routes Faculty layout to the unified University Portal layout.
 * Faculty is now a feature inside the University Portal.
 */
export function FacultyStudentLayout({ children, title, breadcrumbs }: LayoutProps) {
  return (
    <HEILayout title={title} breadcrumbs={breadcrumbs}>
      {children}
    </HEILayout>
  )
}

export const FacultyLayout = FacultyStudentLayout