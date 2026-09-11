import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CitizenStatusBadge } from '../../components/citizen/CitizenStatusBadge'
import { FilterBar } from '../../components/forms/FilterBar'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import type { GovernmentProblem, ValidationStatus } from '../../types'
import {
  mapBackendReportToCitizenProblem,
  isCitizenSubmittedReport,
  type BackendReportResponse,
} from '../../services/reportService'

export { isCitizenSubmittedReport }

/**
 * Maps a backend Citizen Portal report response into a GovernmentProblem structure
 * suitable for Government Portal queues, problem rows, and review workflows.
 */
export function mapBackendReportToGovernmentProblem(report: BackendReportResponse): GovernmentProblem {
  const citizenProb = mapBackendReportToCitizenProblem(report)

  let validationStatus: ValidationStatus = 'Submitted'
  const st = (report.status || '').trim().toLowerCase()
  if (st === 'open') validationStatus = 'Submitted'
  else if (st === 'in progress') validationStatus = 'Under Review'
  else if (st === 'resolved' || st === 'validated') validationStatus = 'Validated'
  else if (st === 'rejected') validationStatus = 'Rejected'
  else if (
    ['submitted', 'under review', 'more information required', 'validated', 'rejected', 'redirected', 'converted to project'].includes(st)
  ) {
    validationStatus = report.status as ValidationStatus
  }

  const priorityNormalized = (['Low', 'Medium', 'High', 'Critical'].includes(report.priority)
    ? report.priority
    : 'Medium') as 'Low' | 'Medium' | 'High' | 'Critical'

  return {
    ...citizenProb,
    id: report.track_id,
    status: validationStatus,
    priority: priorityNormalized,
    citizenLabel: report.citizen_id ? `Citizen #${report.citizen_id}` : 'Verified Citizen',
    attachedFiles: [],
    currentStage:
      report.status === 'In Progress'
        ? 'Stage 2 - Under Review'
        : report.status === 'Resolved' || report.status === 'Validated'
        ? 'Stage 4 - Validated'
        : report.status === 'Rejected'
        ? 'Stage 0 - Rejected'
        : 'Stage 1 - Submitted',
    matchingStatus: 'Awaiting Review',
  }
}


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
export function GovProblemRow({
  problem,
  isSelected,
  onViewDetails,
}: {
  problem: GovernmentProblem
  isSelected?: boolean
  onViewDetails?: () => void
}) {
  const trackId = problem.trackId || (problem.id.startsWith('IF-JH') ? problem.id : 'IF-JH-2026-0001')
  return (
    <article
      id={`row-${trackId}`}
      className={`rounded-xl border p-5 shadow-sm transition ${
        isSelected
          ? 'border-[#187e8d] bg-[#f0f9fa]/70 ring-2 ring-[#187e8d]/30 shadow-md'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-[#12365a] px-2 py-0.5 font-mono text-xs font-bold text-white">
              {trackId}
            </span>
            {isSelected && (
              <span className="rounded bg-teal-100 px-2 py-0.5 font-sans text-xs font-bold text-teal-800 border border-teal-200">
                Selected from Duplicates
              </span>
            )}
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
      <div className="mt-4 flex items-center justify-end gap-2">
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Details
          </button>
        )}
        <Link
          to={`/government/problems/${problem.trackId || problem.id}/review`}
          className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0e2a47]"
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
      'Rural Development',
      'Roads and Transport',
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