import type { ComponentProps } from 'react'
import { StatCard } from '../common/StatCard'
type Stat = ComponentProps<typeof StatCard>
interface DashboardStatGridProps { stats: Stat[] }
export function DashboardStatGrid({ stats }: DashboardStatGridProps) { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat, index) => <StatCard key={`${stat.label}-${index}`} {...stat} />)}</div> }