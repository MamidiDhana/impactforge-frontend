import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Building2,
  User,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react'
import { AppLogo } from '../../components/common/AppLogo'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { useAuth } from '../../context/AuthContext'
import {
  getReports,
  updateReportStatus,
  getImpactSummary,
  getImpactTrends,
  getDistrictImpact,
  getCategoryImpact,
  getResolutionPerformanceAnalytics,
  type BackendReportResponse,
  type ImpactSummaryResponse,
  type ImpactTrendItem,
  type DistrictImpactItem,
  type CategoryImpactItem,
  type ResolutionPerformanceResponse,
} from '../../services/reportService'
import {
  calculateSummaryStats,
  calculateStatusDistribution,
  calculateCategoryDistribution,
  calculateDistrictDistribution,
  calculateUrgencyDistribution,
  calculateDateTrends,
  calculateImpactHighlights,
  normalizeDistrict,
  normalizeCategory,
  normalizeUrgency,
  normalizeStatus,
} from '../../utils/analyticsUtils'

import { AnalyticsSummaryCards } from '../../components/analytics/AnalyticsSummaryCards'
import { AnalyticsFilters } from '../../components/analytics/AnalyticsFilters'
import { ReportStatusChart } from '../../components/analytics/ReportStatusChart'
import { CategoryDistributionChart } from '../../components/analytics/CategoryDistributionChart'
import { DistrictProblemsChart } from '../../components/analytics/DistrictProblemsChart'
import { UrgencyChart } from '../../components/analytics/UrgencyChart'
import { ResolutionPerformance } from '../../components/analytics/ResolutionPerformance'
import { ProblemTrendChart } from '../../components/analytics/ProblemTrendChart'
import { ImpactHighlights } from '../../components/analytics/ImpactHighlights'
import { RecentImpactTable } from '../../components/analytics/RecentImpactTable'
import { GovernmentReportDetailsModal } from '../../components/government/GovernmentReportDetailsModal'
import { NotificationBell } from '../../components/notifications/NotificationBell'
import { AnnouncementBanner } from '../../components/notifications/AnnouncementBanner'
import { AnalyticsExplanationPanel } from '../../components/analytics/AnalyticsExplanationPanel'
import { ImpactSummaryCards } from '../../components/analytics/ImpactSummaryCards'
import { ImpactTrendChart } from '../../components/analytics/ImpactTrendChart'
import { DistrictImpactChart } from '../../components/analytics/DistrictImpactChart'
import { CategoryImpactChart } from '../../components/analytics/CategoryImpactChart'
import { ResolutionPerformanceChart } from '../../components/analytics/ResolutionPerformanceChart'

export function AnalyticsDashboardPage() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  // Global filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('')

  // Phase 1 Part 11: Project & Impact Analytics States
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryResponse | null>(null)
  const [impactTrends, setImpactTrends] = useState<ImpactTrendItem[]>([])
  const [districtImpact, setDistrictImpact] = useState<DistrictImpactItem[]>([])
  const [categoryImpact, setCategoryImpact] = useState<CategoryImpactItem[]>([])
  const [resolutionPerf, setResolutionPerf] = useState<ResolutionPerformanceResponse | null>(null)

  // Load live reports and impact analytics
  const loadReports = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    setFetchError(null)

    try {
      const [data, summaryRes, trendsRes, districtRes, catRes, perfRes] = await Promise.all([
        getReports(),
        getImpactSummary().catch(() => null),
        getImpactTrends().catch(() => null),
        getDistrictImpact().catch(() => null),
        getCategoryImpact().catch(() => null),
        getResolutionPerformanceAnalytics().catch(() => null),
      ])
      setReports(data)
      if (summaryRes) setImpactSummary(summaryRes)
      if (trendsRes && trendsRes.trends) setImpactTrends(trendsRes.trends)
      if (districtRes && districtRes.districts) setDistrictImpact(districtRes.districts)
      if (catRes && catRes.categories) setCategoryImpact(catRes.categories)
      if (perfRes) setResolutionPerf(perfRes)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to backend server.'
      setFetchError(msg)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Status update handler for the details modal
  const handleUpdateStatus = async (
    trackId: string,
    newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
  ) => {
    setIsUpdatingStatus(true)
    try {
      const updated = await updateReportStatus(trackId, newStatus)
      setReports((prev) =>
        prev.map((r) => (r.track_id === trackId ? { ...r, ...updated, status: newStatus } : r))
      )
      if (selectedReport && selectedReport.track_id === trackId) {
        setSelectedReport((prev) => (prev ? { ...prev, ...updated, status: newStatus } : null))
      }
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Extract unique available categories from all reports
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    for (const r of reports) {
      if (r.category && r.category.trim()) {
        set.add(r.category.trim())
      }
    }
    return Array.from(set).sort()
  }, [reports])

  // Filtered dataset
  const filteredReports = useMemo(() => {
    const now = Date.now()
    const msPerDay = 24 * 60 * 60 * 1000

    return reports.filter((r) => {
      // District filter
      if (selectedDistrict) {
        if (normalizeDistrict(r.district).toLowerCase() !== selectedDistrict.toLowerCase()) {
          return false
        }
      }

      // Category filter
      if (selectedCategory) {
        if (normalizeCategory(r.category).toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Urgency filter
      if (selectedUrgency) {
        if (normalizeUrgency(r.priority).toLowerCase() !== selectedUrgency.toLowerCase()) {
          return false
        }
      }

      // Status filter
      if (selectedStatus) {
        if (normalizeStatus(r.status).toLowerCase() !== selectedStatus.toLowerCase()) {
          return false
        }
      }

      // Date range filter
      if (selectedDateRange) {
        if (!r.created_at) return false
        const createdMs = new Date(r.created_at).getTime()
        if (isNaN(createdMs)) return false

        const diffDays = (now - createdMs) / msPerDay
        if (selectedDateRange === '7d' && diffDays > 7) return false
        if (selectedDateRange === '30d' && diffDays > 30) return false
        if (selectedDateRange === '90d' && diffDays > 90) return false
      }

      return true
    })
  }, [reports, selectedDistrict, selectedCategory, selectedUrgency, selectedStatus, selectedDateRange])

  const hasActiveFilters = Boolean(
    selectedDistrict || selectedCategory || selectedUrgency || selectedStatus || selectedDateRange
  )

  const handleResetFilters = () => {
    setSelectedDistrict('')
    setSelectedCategory('')
    setSelectedUrgency('')
    setSelectedStatus('')
    setSelectedDateRange('')
  }

  // Live analytics calculations from filtered data
  const summaryStats = useMemo(() => calculateSummaryStats(filteredReports), [filteredReports])
  const statusData = useMemo(() => calculateStatusDistribution(filteredReports), [filteredReports])
  const categoryData = useMemo(() => calculateCategoryDistribution(filteredReports), [filteredReports])
  const districtData = useMemo(() => calculateDistrictDistribution(filteredReports), [filteredReports])
  const urgencyData = useMemo(() => calculateUrgencyDistribution(filteredReports), [filteredReports])
  const trendData = useMemo(() => calculateDateTrends(filteredReports), [filteredReports])
  const impactHighlights = useMemo(() => calculateImpactHighlights(filteredReports), [filteredReports])

  const hasValidDates = useMemo(() => {
    return filteredReports.some((r) => r.created_at && !isNaN(new Date(r.created_at).getTime()))
  }, [filteredReports])

  const returnDashboardPath =
    currentUser?.role === 'admin'
      ? '/admin/dashboard'
      : currentUser?.role === 'government'
      ? '/government/dashboard'
      : '/'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 sm:px-8 py-3.5 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AppLogo />
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/70 px-3 py-1 text-xs font-bold text-[#12365a]">
              <BarChart3 size={14} className="text-[#187e8d]" />
              <span>State Analytics & Impact Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={returnDashboardPath}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50"
              title="Return to user portal"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>

            <NotificationBell />

            {currentUser && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <span className="hidden md:flex flex-col text-right text-[11px]">
                  <span className="font-bold text-slate-800">{currentUser.name}</span>
                  <span className="capitalize text-slate-400">{currentUser.role}</span>
                </span>
                <span className="grid size-8 place-items-center rounded-full bg-[#12365a] text-xs font-bold text-white shadow-xs">
                  {currentUser.name ? currentUser.name.charAt(0) : <User size={14} />}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  title="Sign out"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* State Announcement Banner */}
        <AnnouncementBanner />

        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-[#12365a] via-[#1a4a7a] to-[#187e8d] p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm border border-white/20">
                <ShieldCheck size={14} className="text-teal-300" />
                <span>Transparent Civic Open Data &middot; Jharkhand</span>
              </div>
              <h1 className="font-[Manrope] text-2xl sm:text-3xl font-extrabold tracking-tight">
                Analytics & Social Impact Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Centralized real-time analytics computed directly from citizen reports registered in PostgreSQL. Evaluates resolution turnaround, geographic density, and sector allocation across all 24 districts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadReports(true)}
                disabled={isLoading || isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#12365a] shadow-md transition hover:bg-slate-100 active:scale-95 disabled:opacity-70"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#187e8d]' : ''} />
                <span>{isRefreshing ? 'Syncing Live Data...' : 'Sync Live Reports'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Global Filter Bar */}
        <section aria-label="Filters">
          <AnalyticsFilters
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedUrgency={selectedUrgency}
            onUrgencyChange={setSelectedUrgency}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            onResetFilters={handleResetFilters}
            onRefresh={() => loadReports(true)}
            isRefreshing={isRefreshing}
            hasActiveFilters={hasActiveFilters}
            totalCount={reports.length}
            filteredCount={filteredReports.length}
            availableCategories={availableCategories}
          />
        </section>

        {/* Dynamic States (Loading, Error, Empty, or Data) */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <LoadingState rows={3} />
            <p className="mt-3 text-xs text-slate-400">
              Querying live citizen problem reports from PostgreSQL backend...
            </p>
          </div>
        ) : fetchError ? (
          <ErrorState
            title="Failed to Retrieve Live Reports"
            description={fetchError}
            onRetry={() => loadReports(false)}
          />
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-3">
            <Building2 size={36} className="mx-auto text-slate-300" />
            <h3 className="font-[Manrope] text-base font-bold text-slate-700">
              No Problem Reports In Database
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No reports have been submitted through the Citizen Portal yet. Once citizen reports are logged in PostgreSQL, all analytics and charts will populate dynamically.
            </p>
            <button
              type="button"
              onClick={() => loadReports(true)}
              className="rounded-xl bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1a4a7a]"
            >
              Re-check Database
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Zero-Match Alert */}
            {filteredReports.length === 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-xs">
                <SlidersHorizontal size={28} className="mx-auto text-amber-600 mb-2" />
                <h4 className="font-[Manrope] text-sm font-bold text-amber-900">
                  No Reports Match Active Filter Combination
                </h4>
                <p className="mt-1 text-xs text-amber-700">
                  Broaden or reset your filters above to display calculated metrics and charts.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#1a4a7a]"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Methodology & Scoring Guide */}
            <AnalyticsExplanationPanel />

            {/* AI Aggregate Impact Summary Cards (Phase 1 Part 11) */}
            <section aria-label="AI Project & Impact Aggregate Metrics">
              <ImpactSummaryCards summary={impactSummary} loading={isLoading} />
            </section>

            {/* 1. Summary Cards (Requirement 1) */}
            <section aria-label="Key Performance Indicators">
              <AnalyticsSummaryCards stats={summaryStats} />
            </section>

            {/* 2. Impact Highlights (Requirement 9) */}
            <section aria-label="Impact Highlights">
              <ImpactHighlights
                highlights={impactHighlights}
                totalReports={filteredReports.length}
              />
            </section>

            {/* 3. Charts Grid Row 1: Status Distribution & Urgency Breakdown */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ReportStatusChart data={statusData} />
              <UrgencyChart data={urgencyData} />
            </section>

            {/* 4. Charts Grid Row 2: Category Distribution & District Density */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CategoryDistributionChart data={categoryData} />
              <DistrictProblemsChart data={districtData} />
            </section>

            {/* 5. Charts Grid Row 3: Submission Activity & Resolution Performance */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProblemTrendChart data={trendData} hasValidDates={hasValidDates} />
              <ResolutionPerformance stats={summaryStats} />
            </section>

            {/* Phase 1 Part 11: AI Project & Impact Analytics Visualizations */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-[Manrope] text-lg font-bold text-[#13243b] flex items-center gap-2">
                  <span>AI Project & Impact Analytics Trajectory</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                    Phase 1 Synthesis
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  State-wide predictive metrics, feasibility scores, and resolution turnaround calculated across all Jharkhand districts
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ImpactTrendChart trends={impactTrends} loading={isLoading} />
                <ResolutionPerformanceChart performance={resolutionPerf} loading={isLoading} />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DistrictImpactChart districts={districtImpact} loading={isLoading} />
                <CategoryImpactChart categories={categoryImpact} loading={isLoading} />
              </div>
            </section>

            {/* 6. Recent Impact Table (Requirement 8) */}
            <section className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Recent Impact Submissions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Latest reports reflecting current filter criteria
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Showing {filteredReports.length} records
                </span>
              </div>

              <RecentImpactTable
                reports={filteredReports}
                onViewDetails={(report) => setSelectedReport(report)}
              />
            </section>
          </div>
        )}

        {/* Selected Report Details Modal */}
        {selectedReport && (
          <GovernmentReportDetailsModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={isUpdatingStatus}
          />
        )}
      </main>
    </div>
  )
}
