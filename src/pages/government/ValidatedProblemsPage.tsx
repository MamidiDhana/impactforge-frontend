import { useMemo, useState, useEffect } from 'react'
import { Search, GraduationCap, Building2, CheckCircle2, ShieldCheck, Clock, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { FilterBar } from '../../components/forms/FilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { getReports, type BackendReportResponse } from '../../services/reportService'

export function ValidatedProblemsPage() {
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState('')
  const [routeFilter, setRouteFilter] = useState('All destinations')

  const fetchValidatedReports = () => {
    setLoading(true)
    getReports()
      .then((data) => {
        // Only include problems validated by Government
        const validated = data.filter(
          (r) =>
            r.verification_status?.toLowerCase() === 'verified' ||
            r.status === 'Resolved' ||
            r.status === 'Validated'
        )
        setReports(validated)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchValidatedReports()
  }, [])

  const results = useMemo(() => {
    return reports.filter((item) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.problem_title.toLowerCase().includes(q) ||
        item.track_id.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q)

      let matchesRoute = true
      if (routeFilter === 'University') {
        matchesRoute = item.routing_target === 'university'
      } else if (routeFilter === 'Partner') {
        matchesRoute = item.routing_target === 'partner'
      } else if (routeFilter === 'Both (Univ + Partner)') {
        matchesRoute = item.routing_target === 'both'
      } else if (routeFilter === 'Neither (Gov Internal)') {
        matchesRoute = item.routing_target === 'neither'
      }

      return matchesSearch && matchesRoute
    })
  }, [reports, search, routeFilter])

  return (
    <GovernmentLayout title="Validated Problems">
      <GovPage
        title="Validated Problems & AI Distribution"
        description="Monitor Government-accepted civic problems routed by the AI engine to Universities and Partners."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Validated' },
        ]}
        action={
          <button
            type="button"
            onClick={fetchValidatedReports}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#187e8d]' : ''} />
            <span>Refresh</span>
          </button>
        }
      >
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: 'route',
              label: 'AI Destination',
              value: routeFilter,
              options: [
                'All destinations',
                'University',
                'Partner',
                'Both (Univ + Partner)',
                'Neither (Gov Internal)',
              ].map((value) => ({ label: value, value })),
              onChange: setRouteFilter,
            },
          ]}
        />

        {loading ? (
          <div className="mt-6">
            <LoadingState rows={3} />
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {results.length ? (
              results.map((problem) => (
                <article key={problem.track_id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#187e8d]">
                          {problem.track_id}
                        </span>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          {problem.verification_status || 'Verified'}
                        </span>
                      </div>
                      <h2 className="mt-1 font-[Manrope] text-lg font-bold text-[#13243b]">
                        {problem.problem_title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {problem.category} · {problem.district}, Jharkhand
                      </p>
                    </div>

                    {/* AI Assignment Badge */}
                    <div className="shrink-0">
                      {problem.routing_target === 'university' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                          <GraduationCap size={14} />
                          Assigned: University Only
                        </span>
                      )}
                      {problem.routing_target === 'partner' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800">
                          <Building2 size={14} />
                          Assigned: Partner Only
                        </span>
                      )}
                      {problem.routing_target === 'both' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 size={14} />
                          Assigned: Both (Univ + Partner)
                        </span>
                      )}
                      {problem.routing_target === 'neither' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          <ShieldCheck size={14} />
                          Neither (Gov Internal)
                        </span>
                      )}
                      {!problem.routing_target && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                          <Clock size={14} />
                          Pending AI Routing
                        </span>
                      )}
                    </div>
                  </div>

                  {problem.ai_routing_reason && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">AI Routing Rationale: </span>
                      {problem.ai_routing_reason}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-3">
                      <span>
                        Funding Needed:{' '}
                        <b>{problem.requires_funding ? 'Yes' : 'No'}</b>
                      </span>
                      <span>·</span>
                      <span>
                        University Solvable:{' '}
                        <b>{problem.university_can_solve ? 'Yes' : 'No'}</b>
                      </span>
                    </span>
                    <Link
                      to={`/government/problems/${problem.track_id}/review`}
                      className="font-bold text-[#187e8d] hover:underline"
                    >
                      Review & Actions →
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                icon={Search}
                title="No validated problems found"
                description="No validated problems match the selected search or destination filter."
              />
            )}
          </div>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}