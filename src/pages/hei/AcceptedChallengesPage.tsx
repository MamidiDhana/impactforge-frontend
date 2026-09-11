import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Search,
  RefreshCw,
  MapPin,
  Tag,
  Clock,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { StatusBadge } from '../../components/common/StatusBadge'
import {
  getReports,
  type BackendReportResponse,
} from '../../services/reportService'
import { useFaculty } from '../../context/FacultyContext'

export function AcceptedChallengesPage() {
  const { isInProjects, isInterested } = useFaculty()
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Load only Government-validated problems assigned to HEIs (exact same data source as University Dashboard)
  const loadData = async () => {
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
      setFetchError(err instanceof Error ? err.message : 'Failed to load live problem statements.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const categories = useMemo(() => {
    const set = new Set(reports.map((r) => r.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [reports])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (selectedCategory !== 'All' && r.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = (r.problem_title || '').toLowerCase().includes(q)
        const matchId = (r.track_id || '').toLowerCase().includes(q)
        const matchDistrict = (r.district || '').toLowerCase().includes(q)
        if (!matchTitle && !matchId && !matchDistrict) return false
      }
      return true
    })
  }, [reports, selectedCategory, searchQuery])

  return (
    <HEILayout title="Problems">
      <HEIPage
        title="University Problems & Accepted Challenges"
        description="Explore live citizen problems assigned to higher education institutions and collaborative engineering labs across Jharkhand."
        breadcrumbs={[
          { label: 'University', href: '/university' },
          { label: 'Problems' },
        ]}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'} />
            <span>{isLoading ? 'Syncing...' : 'Sync Problems'}</span>
          </button>
        }
      >
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search live problems by Track ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs outline-none focus:border-[#187e8d] sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Problem Count Header */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing <strong className="font-bold text-slate-700">{filteredReports.length}</strong> of{' '}
              <strong className="font-bold text-slate-700">{reports.length}</strong> {reports.length === 1 ? 'problem' : 'problems'} · Assigned to University
            </p>
          </div>

          {/* Content States */}
          {isLoading && reports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <LoadingState rows={3} />
            </div>
          ) : fetchError && reports.length === 0 ? (
            <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm text-center">
              <p className="text-sm font-semibold text-red-700">{fetchError}</p>
              <button
                type="button"
                onClick={loadData}
                className="mt-3 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white"
              >
                Retry
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <EmptyState
                title="No live problems found"
                description="No matching problem statements found in the database. Try adjusting your search query."
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredReports.map((problem) => {
                const inProjects = isInProjects(problem.track_id)
                const interested = isInterested(problem.track_id)
                const isAssigned =
                  problem.routing_target === 'university' ||
                  problem.routing_target === 'both' ||
                  inProjects

                return (
                  <article
                    key={problem.track_id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#187e8d]/30"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-xs font-bold text-[#187e8d]">
                          {problem.track_id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isAssigned && (
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                              University Assigned
                            </span>
                          )}
                          <StatusBadge status={problem.status as any} />
                        </div>
                      </div>

                      <h2 className="mt-2 font-[Manrope] text-base font-bold text-[#13243b] line-clamp-2">
                        {problem.problem_title}
                      </h2>

                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                        {problem.context_and_desired_outcome || 'No specific background details provided.'}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <Tag size={11} className="text-slate-400" />
                          {problem.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <MapPin size={11} className="text-slate-400" />
                          {problem.district}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <Clock size={11} className="text-slate-400" />
                          Priority: {problem.priority}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        {interested && (
                          <span className="text-[11px] font-semibold text-amber-700">
                            ★ Shortlisted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          to="/university/faculty/reports"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#187e8d]"
                        >
                          <FileText size={12} />
                          <span>Milestones</span>
                        </Link>
                        <Link
                          to="/university/faculty"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#0e2a47]"
                        >
                          <GraduationCap size={13} />
                          <span>Open in Faculty Hub</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </HEIPage>
    </HEILayout>
  )
}