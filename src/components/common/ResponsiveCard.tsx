import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
interface ResponsiveCardProps { children: ReactNode; className?: string; as?: 'article' | 'div' | 'section' }
export function ResponsiveCard({ children, className, as = 'article' }: ResponsiveCardProps) { const Component = as; return <Component className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}>{children}</Component> }