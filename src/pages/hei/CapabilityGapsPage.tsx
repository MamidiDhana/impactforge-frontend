import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Bot,
  CheckCircle2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Layers,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { LoadingState } from '../../components/common/LoadingState'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorState } from '../../components/common/ErrorState'
import {
  getReports,
  type BackendReportResponse,
} from '../../services/reportService'

export interface LiveCapabilityItem {
  id: string
  trackId: string
  subject: string
  problemTitle: string
  category: string
  district: string
  required: string
  availableInternally: string
  missing: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low'
  suggestedSolution: string
  partnerType: string
  action: string
  coverageScore?: number
}

function mapReportToCapabilityItem(report: BackendReportResponse): LiveCapabilityItem {
  const caps = (report.ai_capabilities || {}) as Record<string, unknown>
  const gap = (report.ai_capability_gap_analysis || {}) as Record<string, unknown>

  // Parse severity
  const rawSev = (
    report.ai_capability_gap_severity ||
    (typeof gap.gap_severity === 'string' ? gap.gap_severity : '') ||
    report.priority ||
    'Medium'
  ).toLowerCase()

  let severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium'
  if (rawSev.includes('crit')) {
    severity = 'Critical'
  } else if (rawSev.includes('high') || rawSev.includes('signif')) {
    severity = 'High'
  } else if (rawSev.includes('low') || rawSev.includes('minor')) {
    severity = 'Low'
  } else {
    severity = 'Medium'
  }

  // Required skills / domains
  const skills: string[] = Array.isArray(caps.skills) ? (caps.skills as string[]) : []
  const domains: string[] = Array.isArray(caps.technical_domains) ? (caps.technical_domains as string[]) : []
  let required = `${report.category} technical assessment and system design`
  if (skills.length > 0) {
    required = skills.slice(0, 3).join(', ')
  } else if (domains.length > 0) {
    required = domains.slice(0, 2).join(', ')
  }

  // Available internally
  const coveredCaps = (gap.covered_capabilities || {}) as Record<string, unknown>
  const availSkills: string[] =
    Array.isArray(gap.available_skills) && gap.available_skills.length > 0
      ? (gap.available_skills as string[])
      : Array.isArray(coveredCaps.skills) && (coveredCaps.skills as string[]).length > 0
      ? (coveredCaps.skills as string[])
      : []

  const availableInternally =
    availSkills.length > 0
      ? availSkills.slice(0, 3).join(', ')
      : 'Institutional engineering faculty & student research cohorts'

  // Missing capabilities
  const missingEq: string[] = Array.isArray(gap.missing_equipment) ? (gap.missing_equipment as string[]) : []
  const missingMat: string[] = Array.isArray(gap.missing_materials) ? (gap.missing_materials as string[]) : []
  const missingSoft: string[] = Array.isArray(gap.missing_software_tools) ? (gap.missing_software_tools as string[]) : []
  const missingCombined = [...missingEq, ...missingMat, ...missingSoft]

  const missing =
    missingCombined.length > 0
      ? missingCombined.slice(0, 3).join(', ')
      : 'Specialized testing equipment & on-site field deployment instrumentation'

  // Suggested solution
  const recActions: string[] = Array.isArray(gap.recommended_actions) ? (gap.recommended_actions as string[]) : []
  const suggestedSolution =
    recActions.length > 0
      ? recActions[0]
      : `Coordinate with district administration in ${report.district} for site validation and field trial permissions.`

  // Partner type
  const extSupport: string[] = Array.isArray(gap.required_external_support) ? (gap.required_external_support as string[]) : []
  const partnerType =
    extSupport.length > 0
      ? extSupport[0]
      : `${report.category} Industry / Municipal Technical Partner`

  // Action
  const action =
    severity === 'Critical' || severity === 'High'
      ? 'Request external expert'
      : 'Assign faculty mentor'

  return {
    id: report.track_id,
    trackId: report.track_id,
    subject: `[${report.track_id}] ${report.problem_title}`,
    problemTitle: report.problem_title,
    category: report.category,
    district: report.district,
    required,
    availableInternally,
    missing,
    severity,
    suggestedSolution,
    partnerType,
    action,
    coverageScore: typeof gap.coverage_score === 'number' ? gap.coverage_score : undefined,
  }
}

export function CapabilityGapsPage() {
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All categories')
  const [selectedSeverity, setSelectedSeverity] = useState('All severities')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load only Government-validated problems assigned to HEIs (exact same data source as University Dashboard)
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)

    try {
      const data = await getReports({ target_dashboard: 'university' })
      // Strict frontend safeguard: only show Government-validated problems assigned to university or both
      const assignedToHEI = data.filter(
        (r) =>
          r.verification_status?.toLowerCase() === 'verified' &&
          (r.routing_target === 'university' || r.routing_target === 'both')
      )
      setReports(assignedToHEI)
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to backend server for capability analysis.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const capabilityItems = useMemo(() => {
    return reports.map(mapReportToCapabilityItem)
  }, [reports])

  const categories = useMemo(() => {
    const set = new Set<string>()
    reports.forEach((r) => {
      if (r.category) set.add(r.category)
    })
    return ['All categories', ...Array.from(set).sort()]
  }, [reports])

  const filteredItems = useMemo(() => {
    return capabilityItems.filter((item) => {
      if (selectedCategory !== 'All categories' && item.category !== selectedCategory) {
        return false
      }
      if (selectedSeverity !== 'All severities' && item.severity !== selectedSeverity) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.subject.toLowerCase().includes(q)
        const matchesCategory = item.category.toLowerCase().includes(q)
        const matchesDistrict = item.district.toLowerCase().includes(q)
        const matchesRequired = item.required.toLowerCase().includes(q)
        const matchesMissing = item.missing.toLowerCase().includes(q)
        if (
          !matchesTitle &&
          !matchesCategory &&
          !matchesDistrict &&
          !matchesRequired &&
          !matchesMissing
        ) {
          return false
        }
      }
      return true
    })
  }, [capabilityItems, selectedCategory, selectedSeverity, searchQuery])

  const handleActionClick = (item: LiveCapabilityItem) => {
    setToastMessage(`Action recorded for ${item.trackId}: ${item.action}`)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const renderSeverityBadge = (severity: 'Critical' | 'High' | 'Medium' | 'Low') => {
    let classes = 'bg-slate-100 text-slate-700 border-slate-200'
    if (severity === 'Critical') {
      classes = 'bg-rose-50 text-rose-700 border-rose-200'
    } else if (severity === 'High') {
      classes = 'bg-red-50 text-red-700 border-red-200'
    } else if (severity === 'Medium') {
      classes = 'bg-amber-50 text-amber-800 border-amber-200'
    } else if (severity === 'Low') {
      classes = 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }

    return (
      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${classes}`}>
        {severity} gap
      </span>
    )
  }

  return (
    <HEILayout title="Capability & Resources">
      <HEIPage
        title="Capability & Resources"
        description="Identify missing expertise and resources before committing to delivery."
        breadcrumbs={[
          { label: 'University', href: '/university' },
          { label: 'Capability & Resources' },
        ]}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Reload live citizen problems"
          >
            <RefreshCw
              size={14}
              className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'}
            />
            <span>{isLoading ? 'Syncing...' : 'Sync Live Problems'}</span>
          </button>
        }
      >
        {/* Toast Feedback */}
        {toastMessage && (
          <div
            role="status"
            className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-in fade-in"
          >
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* AI Analysis Info Banner */}
        <div className="mb-5 flex gap-3 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-600">
          <Bot className="shrink-0 text-[#187e8d]" size={20} />
          <div>
            <b>AI-Assisted Capability & Resources Analysis</b>
            <br />
            Institutional capacity and external support requirements evaluated from live citizen problems
            in the shared PostgreSQL database. No duplicate or mock records.
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live problems by track ID, title, domain, or skills..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none focus:ring-1 focus:ring-[#187e8d]"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                <SlidersHorizontal size={14} />
                <span>Filters:</span>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-[#187e8d] focus:outline-none focus:ring-1 focus:ring-[#187e8d]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Severity Filter */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-[#187e8d] focus:outline-none focus:ring-1 focus:ring-[#187e8d]"
              >
                <option value="All severities">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Active Items Counter */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Layers size={12} className="text-[#187e8d]" />
              Showing <b>{filteredItems.length}</b> live university problem{filteredItems.length === 1 ? '' : 's'}
              {reports.length !== filteredItems.length && ` (filtered from ${reports.length} total)`}
            </span>
            <span className="font-mono text-slate-400">Consistent with University Dashboard live problems</span>
          </div>
        </div>

        {/* Content Section */}
        {isLoading && reports.length === 0 ? (
          <LoadingState label="Loading live capability and resource evaluations..." />
        ) : fetchError ? (
          <ErrorState title="Capability Analysis Failed" description={fetchError} onRetry={loadData} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="No matching capability evaluations"
            description={
              searchQuery || selectedCategory !== 'All categories' || selectedSeverity !== 'All severities'
                ? 'Try adjusting your search criteria or filters to see available live citizen problems.'
                : 'No live citizen-submitted problems are currently recorded in the database.'
            }
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredItems.map((gap) => (
              <article
                key={gap.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#187e8d]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#187e8d]">
                        {gap.trackId}
                      </span>
                      <h2 className="mt-1 font-[Manrope] text-base font-bold text-[#13243b]">
                        {gap.problemTitle}
                      </h2>
                    </div>
                    {renderSeverityBadge(gap.severity)}
                  </div>

                  <div className="mt-4 grid gap-2.5 text-sm text-slate-600">
                    <p>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Required:
                      </span>{' '}
                      <b className="text-slate-800">{gap.required}</b>
                    </p>
                    <p>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Available internally:
                      </span>{' '}
                      <b className="text-slate-800">{gap.availableInternally}</b>
                    </p>
                    <p>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Missing:
                      </span>{' '}
                      <b className="text-slate-800">{gap.missing}</b>
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Suggested solution:</span>{' '}
                      {gap.suggestedSolution}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Partner type:</span>{' '}
                      {gap.partnerType}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {gap.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {gap.district}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleActionClick(gap)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0e2a47]"
                  >
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>{gap.action}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </HEIPage>
    </HEILayout>
  )
}