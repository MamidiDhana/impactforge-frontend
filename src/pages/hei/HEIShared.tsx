import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FilterBar } from '../../components/forms/FilterBar'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import type { HEIProblem } from '../../types'
export function HEIPage({
  title,
  description,
  breadcrumbs,
  children,
  action,
}: {
  title: string
  description?: string
  breadcrumbs?: { label: string; href?: string }[]
  children: ReactNode
  action?: ReactNode
}) {
  const finalBreadcrumbs =
    title === 'University'
      ? undefined
      : (breadcrumbs?.map((b) => (b.label === 'Dashboard' ? { ...b, label: 'University' } : b)) ?? [
          { label: 'University', href: '/hei/dashboard' },
          { label: title },
        ])

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={finalBreadcrumbs}
        action={action}
      />
      {children}
    </PageContainer>
  )
}
export function HEIProblemCard({ problem, onAccept }: { problem: HEIProblem; onAccept?: () => void }) { return <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.1em] text-[#187e8d]">{problem.category}</p><h2 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b]">{problem.title}</h2></div><span className="text-right text-sm font-bold text-[#187e8d]">{problem.match}%<span className="block text-[10px] font-medium text-slate-400">Mock AI match</span></span></div><p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">{problem.description}</p><p className="mt-3 text-xs text-slate-500">{problem.location} · {problem.affectedPeople.toLocaleString()} affected · Validated {problem.validationDate}</p><div className="mt-3 flex flex-wrap gap-2">{problem.requiredCapabilities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item}</span>)}</div><div className="mt-5 flex flex-wrap gap-2"><Link to={`/hei/problems/${problem.id}`} className="rounded-lg border border-[#12365a] px-3 py-2 text-xs font-semibold text-[#12365a]">View details</Link>{onAccept && <button type="button" onClick={onAccept} className="rounded-lg bg-[#12365a] px-3 py-2 text-xs font-semibold text-white">Accept challenge</button>}</div></article> }
export function HEIFilters({ search, setSearch, category, setCategory }: { search: string; setSearch: (value: string) => void; category: string; setCategory: (value: string) => void }) { return <FilterBar searchValue={search} onSearchChange={setSearch} filters={[{ id: 'category', label: 'Category', value: category, options: ['All categories', 'Water and Sanitation', 'Healthcare', 'Education', 'Agriculture'].map((value) => ({ label: value, value })), onChange: setCategory }]} /> }