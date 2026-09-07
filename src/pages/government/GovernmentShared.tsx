import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CitizenStatusBadge } from '../../components/citizen/CitizenStatusBadge'
import { FilterBar } from '../../components/forms/FilterBar'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import type { GovernmentProblem } from '../../types'

export function GovPage({
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
    title === 'Government'
      ? undefined
      : (breadcrumbs?.map((b) => (b.label === 'Dashboard' ? { ...b, label: 'Government' } : b)) ?? [
          { label: 'Government', href: '/government/dashboard' },
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
export function GovProblemRow({ problem }: { problem: GovernmentProblem }) {
  const trackId = problem.trackId || (problem.id.startsWith('IF-JH') ? problem.id : 'IF-JH-2026-0001')
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-[#12365a] px-2 py-0.5 font-mono text-xs font-bold text-white">
              {trackId}
            </span>
            <span className="text-xs text-slate-400">Jharkhand State Operations</span>
          </div>
          <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">{problem.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{problem.description}</p>
          <p className="mt-3 text-xs text-slate-400">
            {problem.category} · {problem.district ? `${problem.district}, Jharkhand` : problem.location} · Submitted {problem.submittedAt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              problem.priority === 'High' || problem.priority === 'Critical'
                ? 'bg-red-50 text-red-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {problem.priority} priority
          </span>
          <CitizenStatusBadge status={problem.status} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          to={`/government/problems/${problem.id}/review`}
          className="rounded-lg border border-[#12365a] px-4 py-2 text-sm font-semibold text-[#12365a] hover:bg-slate-50"
        >
          Review Problem
        </Link>
      </div>
    </article>
  )
}

export function GovFilters({
  search,
  onSearch,
  status,
  onStatus,
  category,
  onCategory,
  location,
  onLocation,
  priority,
  onPriority,
}: {
  search: string
  onSearch: (value: string) => void
  status?: string
  onStatus?: (value: string) => void
  category?: string
  onCategory?: (value: string) => void
  location?: string
  onLocation?: (value: string) => void
  priority?: string
  onPriority?: (value: string) => void
}) {
  const select = (
    label: string,
    value: string | undefined,
    onChange: ((value: string) => void) | undefined,
    options: string[]
  ) =>
    onChange
      ? {
          id: label,
          label,
          value: value ?? options[0],
          options: options.map((item) => ({ label: item, value: item })),
          onChange,
        }
      : null

  const filters = [
    select('Status', status, onStatus, [
      'All statuses',
      'Submitted',
      'Under Review',
      'More Information Required',
      'Validated',
      'Rejected',
      'Redirected',
      'Converted to Project',
    ]),
    select('Category', category, onCategory, [
      'All categories',
      'Water and Sanitation',
      'Healthcare',
      'Education',
      'Agriculture',
      'Environment',
      'Public Safety',
    ]),
    select('Jharkhand District', location, onLocation, [
      'All Jharkhand Districts',
      'Ranchi',
      'East Singhbhum (Jamshedpur)',
      'Dhanbad',
      'Bokaro',
      'Deoghar',
      'Hazaribagh',
      'Giridih',
      'Ramgarh',
      'Dumka',
      'Gumla',
      'Latehar',
      'Palamu',
    ]),
    select('Priority', priority, onPriority, ['All priorities', 'Low', 'Medium', 'High', 'Critical']),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item))

  return <FilterBar searchValue={search} onSearchChange={onSearch} filters={filters} />
}
export function SuccessNotice({ children }: { children: ReactNode }) { return <p role="status" className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{children}</p> }