import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ResponsiveCardProps {
  children: ReactNode
  className?: string
  as?: 'article' | 'div' | 'section'
  onClick?: () => void
}

export function ResponsiveCard({ children, className, as = 'article', onClick }: ResponsiveCardProps) {
  const Component = as
  return (
    <Component
      onClick={onClick}
      className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}
    >
      {children}
    </Component>
  )
}