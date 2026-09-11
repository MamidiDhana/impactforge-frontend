import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FilePlus2,
  Star,
  FolderKanban,
  Tags,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { StatCard } from '../../components/common/StatCard'
import { DashboardWelcome } from '../../components/dashboard/DashboardWelcome'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { HEIReportFilters, type HEIViewMode } from '../../components/hei/HEIReportFilters'
import { HEIReportsTable } from '../../components/hei/HEIReportsTable'
import { HEIReportDetailsModal } from '../../components/hei/HEIReportDetailsModal'
import { AnnouncementBanner } from '../../components/notifications/AnnouncementBanner'
import { useHEI } from '../../context/HEIContext'
import { getReports, type BackendReportResponse } from '../../services/reportService'

export function HEIDashboardPage() {
  const { isInterested, isInProjects } = useHEI()

  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null)

  // Search, filter, and tab view states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<HEIViewMode>('all')

  // Toast / notification feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Load only Government-validated problems assigned to HEIs: GET /api/reports?target_dashboard=university
  const loadReports = useCallback(async () => {
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
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server.'
      setFetchError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const notify = (msg: string) => {
    setFeedbackMessage(msg)
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  const handleToggleInterested = (trackId: string) => {
    const nextState = !isInterested(trackId)
    notify(
      nextState
        ? `Problem ${trackId} added to your Interested list.`
        : `Problem ${trackId} removed from your Interested list.`
    )
  }

  const handleToggleProject = (trackId: string) => {
    const nextState = !isInProjects(trackId)
    notify(
      nextState
        ? `Problem ${trackId} added to your HEI Project List.`
        : `Problem ${trackId} removed from your HEI Project List.`
    )
  }

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Tab view mode filter
      if (viewMode === 'interested' && !isInterested(report.track_id)) {
        return false
      }
      if (viewMode === 'projects' && !isInProjects(report.track_id)) {
        return false
      }

      // Search filter (Track ID or problem title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchId = report.track_id.toLowerCase().includes(q)
        const matchTitle = report.problem_title.toLowerCase().includes(q)
        if (!matchId && !matchTitle) return false
      }

      // District filter
      if (selectedDistrict) {
        if (report.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
          return false
        }
      }

      // Category filter
      if (selectedCategory) {
        if (report.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false
        }
      }

      // Urgency filter
      if (selectedUrgency) {
        if (report.priority.toLowerCase() !== selectedUrgency.toLowerCase()) {
          return false
        }
      }

      // Status filter
      if (selectedStatus) {
        if (report.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }, [
    reports,
    viewMode,
    isInterested,
    isInProjects,
    searchQuery,
    selectedDistrict,
    selectedCategory,
    selectedUrgency,
    selectedStatus,
  ])

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedDistrict ||
      selectedCategory ||
      selectedUrgency ||
      selectedStatus ||
      viewMode !== 'all'
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedCategory('')
    setSelectedUrgency('')
    setSelectedStatus('')
    setViewMode('all')
  }

  // Live summary statistics directly derived from backend data
  const stats = useMemo(() => {
    const total = reports.length
    const interestedCount = reports.filter((r) => isInterested(r.track_id)).length
    const projectCount = reports.filter((r) => isInProjects(r.track_id)).length
    const categoriesCount = new Set(reports.map((r) => r.category.trim())).size
    const districtsCount = new Set(reports.map((r) => r.district.trim())).size

    return {
      total,
      interestedCount,
      projectCount,
      categoriesCount,
      districtsCount,
    }
  }, [reports, isInterested, isInProjects])

  return (
    <HEILayout title="University Dashboard">
      <HEIPage
        title="University Academic Innovation Hub"
        description="Collaborate on verified community problems reported across Jharkhand. Form multidisciplinary research projects and deploy academic solutions."
        breadcrumbs={[{ label: 'University', href: '/hei/dashboard' }]}
        action={
          <button
            type="button"
            onClick={loadReports}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Reload reports from backend"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'} />
            <span>{isLoading ? 'Syncing...' : 'Sync Live Problems'}</span>
          </button>
        }
      >
        <div className="space-y-6">
          {/* Role-Filtered Announcement Banner */}
          <AnnouncementBanner />

          {/* Welcome Banner */}
          <DashboardWelcome
            name="Higher Education Institution Portal"
            description="Empowering state universities and engineering institutions (BIT Mesra, NIT Jamshedpur, Central University of Jharkhand) to discover live community challenges, mobilize student-faculty research teams, and create high-impact field pilots."
          />

          {/* Feedback Toast Notification */}
          {feedbackMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 shadow-sm animate-in fade-in"
            >
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Live Dynamic Statistics Grid (Requirement 10) */}
          <section>
            <SectionHeader
              title="Jharkhand Community Challenges Overview"
              description="Live institutional metrics calculated from real citizen problems in PostgreSQL."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Available Problems"
                value={String(stats.total)}
                description="Live citizen submissions"
                icon={FilePlus2}
              />
              <StatCard
                label="Interested Problems"
                value={String(stats.interestedCount)}
                description="Shortlisted by university"
                icon={Star}
              />
              <StatCard
                label="Active Problem Categories"
                value={String(stats.categoriesCount)}
                description="Distinct domains"
                icon={Tags}
              />
              <StatCard
                label="Districts Covered"
                value={String(stats.districtsCount)}
                description="Across Jharkhand"
                icon={MapPin}
              />
            </div>
          </section>

          {/* Problems Table & Collaboration Section */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                  {viewMode === 'interested'
                    ? 'Shortlisted Interested Problems'
                    : viewMode === 'projects'
                    ? 'University Project Worklist'
                    : 'All Available Community Challenges'}
                </h2>
                <p className="text-xs text-slate-500">
                  Review real civic and infrastructure challenges to engage students, faculty mentors, and institutional labs.
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <HEIReportFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedUrgency={selectedUrgency}
              onUrgencyChange={setSelectedUrgency}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              totalCount={reports.length}
              filteredCount={filteredReports.length}
              interestedCount={stats.interestedCount}
              projectCount={stats.projectCount}
            />

            {/* Main Content States */}
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <LoadingState rows={3} />
                <p className="mt-3 text-xs text-slate-400">Loading citizen problems from PostgreSQL backend...</p>
              </div>
            ) : fetchError ? (
              <ErrorState
                title="Failed to Load Community Challenges"
                description={fetchError}
                onRetry={loadReports}
              />
            ) : reports.length === 0 ? (
              <EmptyState
                icon={FilePlus2}
                title="No Community Challenges Available"
                description="No citizen reports are registered in the system yet. When citizens report community problems, they will appear here for university collaboration."
              />
            ) : filteredReports.length === 0 ? (
              viewMode === 'interested' ? (
                <EmptyState
                  icon={Star}
                  title="No Interested Problems Shortlisted"
                  description="You have not marked any problems as interested yet. Click the star icon on any challenge in the 'All Problems' tab to shortlist it."
                  action={
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#1a4a7a]"
                    >
                      Browse All Problems
                    </button>
                  }
                />
              ) : viewMode === 'projects' ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No Problems Added to HEI Projects"
                  description="You haven't formed project worklists for any community problems yet. Use the project icon to add challenges to this list."
                  action={
                    <button
                      type="button"
                      onClick={() => setViewMode('all')}
                      className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#1a4a7a]"
                    >
                      Explore Problems
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  icon={AlertTriangle}
                  title="No Problems Match Selected Filters"
                  description="No registered challenges matched the search query and selected filter options."
                  action={
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#1a4a7a]"
                    >
                      Reset All Filters
                    </button>
                  }
                />
              )
            ) : (
              <HEIReportsTable
                reports={filteredReports}
                onViewDetails={(report) => setSelectedReport(report)}
                onToggleInterested={handleToggleInterested}
                onToggleProject={handleToggleProject}
              />
            )}
          </section>
        </div>

        {/* View Details Modal */}
        {selectedReport && (
          <HEIReportDetailsModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onToggleInterested={handleToggleInterested}
            onToggleProject={handleToggleProject}
          />
        )}
      </HEIPage>
    </HEILayout>
  )
}