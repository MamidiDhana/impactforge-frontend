import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FilePlus2,
  Star,
  Handshake,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { DashboardWelcome } from '../../components/dashboard/DashboardWelcome'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import {
  PartnerReportFilters,
  type PartnerViewMode,
} from '../../components/partner/PartnerReportFilters'
import { PartnerReportsTable } from '../../components/partner/PartnerReportsTable'
import { PartnerReportDetailsModal } from '../../components/partner/PartnerReportDetailsModal'
import { PartnerCollabModal } from '../../components/partner/PartnerCollabModal'
import { AnnouncementBanner } from '../../components/notifications/AnnouncementBanner'
import { usePartner } from '../../context/PartnerContext'
import { getReports, type BackendReportResponse } from '../../services/reportService'

export function PartnerDashboardPage() {
  const {
    isInterested,
    toggleInterested,
    isSupported,
    toggleSupported,
    partnerProjects,
    getProject,
  } = usePartner()

  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Selected report for Details modal
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null)

  // Selected report for Partnership modal
  const [collabReport, setCollabReport] = useState<BackendReportResponse | null>(null)

  // Search, filter, and tab view states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('')
  const [selectedGovStatus, setSelectedGovStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<PartnerViewMode>('all')

  // Toast feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Load only Government-validated problems assigned to Partners: GET /api/reports?target_dashboard=partner
  const loadReports = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)

    try {
      const data = await getReports({ target_dashboard: 'partner' })
      // Strict frontend safeguard: only show Government-validated problems assigned to partner or both
      const assignedToPartner = data.filter(
        (r) =>
          r.verification_status?.toLowerCase() === 'verified' &&
          (r.routing_target === 'partner' || r.routing_target === 'both')
      )
      setReports(assignedToPartner)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to connect to backend server.'
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
    const nextState = toggleInterested(trackId)
    notify(
      nextState
        ? `Problem ${trackId} added to your Interested list.`
        : `Problem ${trackId} removed from your Interested list.`
    )
  }

  const handleToggleSupported = (trackId: string) => {
    const nextState = toggleSupported(trackId)
    notify(
      nextState
        ? `Problem ${trackId} added to your Supported Projects.`
        : `Problem ${trackId} removed from your Supported Projects.`
    )
  }

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Tab view mode filter
      if (viewMode === 'interested' && !isInterested(report.track_id)) {
        return false
      }
      if (viewMode === 'supported' && !isSupported(report.track_id)) {
        return false
      }
      if (viewMode === 'active') {
        const projectItem = getProject(report.track_id)
        const status = projectItem?.status
        if (
          status !== 'Discussion Started' &&
          status !== 'Support Confirmed' &&
          status !== 'In Progress'
        ) {
          return false
        }
      }
      if (viewMode === 'completed') {
        const projectItem = getProject(report.track_id)
        if (projectItem?.status !== 'Completed') {
          return false
        }
      }

      // Search filter (Track ID, problem title, district, locality)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchId = report.track_id.toLowerCase().includes(q)
        const matchTitle = report.problem_title.toLowerCase().includes(q)
        const matchDistrict = report.district.toLowerCase().includes(q)
        const matchLocality = report.locality.toLowerCase().includes(q)
        if (!matchId && !matchTitle && !matchDistrict && !matchLocality) {
          return false
        }
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

      // Government Status filter
      if (selectedGovStatus) {
        if (report.status.toLowerCase() !== selectedGovStatus.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }, [
    reports,
    viewMode,
    isInterested,
    isSupported,
    getProject,
    searchQuery,
    selectedDistrict,
    selectedCategory,
    selectedUrgency,
    selectedGovStatus,
  ])

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedDistrict ||
      selectedCategory ||
      selectedUrgency ||
      selectedGovStatus ||
      viewMode !== 'all'
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedDistrict('')
    setSelectedCategory('')
    setSelectedUrgency('')
    setSelectedGovStatus('')
    setViewMode('all')
  }

  // Live summary cards (Requirement 1)
  const stats = useMemo(() => {
    const total = reports.length
    const interestedCount = reports.filter((r) => isInterested(r.track_id)).length
    const supportedCount = reports.filter((r) => isSupported(r.track_id)).length

    const activeCount = Object.values(partnerProjects).filter(
      (p) =>
        p.status === 'Discussion Started' ||
        p.status === 'Support Confirmed' ||
        p.status === 'In Progress'
    ).length

    const completedCount = Object.values(partnerProjects).filter(
      (p) => p.status === 'Completed'
    ).length

    return {
      total,
      interestedCount,
      supportedCount,
      activeCount,
      completedCount,
    }
  }, [reports, isInterested, isSupported, partnerProjects])

  return (
    <PartnerLayout title="Industry Partnerships">
      <PageContainer>
        <PageHeader
          title="Industry Partnerships Collaboration & Social Impact Hub"
          description="Discover verified citizen challenges across Jharkhand. Co-fund infrastructure, provide technical and equipment support, and collaborate with universities and district administrations."
          breadcrumbs={[{ label: 'Industry Partnerships', href: '/partner/dashboard' }]}
          action={
            <button
              type="button"
              onClick={loadReports}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              title="Reload reports from backend"
            >
              <RefreshCw
                size={14}
                className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'}
              />
              <span>{isLoading ? 'Syncing...' : 'Sync Live Problems'}</span>
            </button>
          }
        />

        <div className="space-y-6">
          {/* Role-Filtered Announcement Banner */}
          <AnnouncementBanner />

          {/* Welcome Banner */}
          <DashboardWelcome
            name="CSR, Industry & NGO Industry Partnerships Portal"
            description="Accelerate real-world change in Jharkhand. Align your Corporate Social Responsibility (CSR) investments, technology expertise, and volunteer mentorship with authentic citizen-reported needs."
          />

          {/* Toast Notification */}
          {feedbackMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 shadow-sm animate-in fade-in"
            >
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* 5 Summary Metric Cards (Requirement 1) */}
          <section>
            <SectionHeader
              title="Partnership & Grassroots Impact Overview"
              description="Real-time metrics calculated from live PostgreSQL citizen reports and your organization's support commitments."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                label="Total Available Problems"
                value={String(stats.total)}
                description="Live citizen submissions"
                icon={FilePlus2}
              />
              <StatCard
                label="Interested Problems"
                value={String(stats.interestedCount)}
                description="Shortlisted by partner"
                icon={Star}
              />
              <StatCard
                label="Supported Projects"
                value={String(stats.supportedCount)}
                description="Pledged support"
                icon={Handshake}
              />
              <StatCard
                label="Active Partnerships"
                value={String(stats.activeCount)}
                description="Discussion & implementation"
                icon={Zap}
              />
              <StatCard
                label="Completed Partnerships"
                value={String(stats.completedCount)}
                description="Delivered solutions"
                icon={CheckCircle2}
              />
            </div>
          </section>

          {/* Loading, Error, or Main Content */}
          {isLoading && reports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm">
              <LoadingState rows={4} />
            </div>
          ) : fetchError && reports.length === 0 ? (
            <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
              <ErrorState
                title="Unable to connect to FastAPI backend"
                description={fetchError}
                onRetry={loadReports}
              />
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <EmptyState
                title="No citizen reports registered yet"
                description="No citizen problem submissions currently exist in the database. Real citizen reports will automatically appear here."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search, Filter, and Tabs Toolbar */}
              <PartnerReportFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedDistrict={selectedDistrict}
                onDistrictChange={setSelectedDistrict}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedUrgency={selectedUrgency}
                onUrgencyChange={setSelectedUrgency}
                selectedGovStatus={selectedGovStatus}
                onGovStatusChange={setSelectedGovStatus}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                totalCount={reports.length}
                filteredCount={filteredReports.length}
                interestedCount={stats.interestedCount}
                supportedCount={stats.supportedCount}
                activeCount={stats.activeCount}
                completedCount={stats.completedCount}
              />

              {/* Table, Empty Filtered State, or Empty Tab View */}
              {filteredReports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  {viewMode === 'interested' ? (
                    <EmptyState
                      title="No interested problems yet"
                      description="You haven't marked any problems as interested yet. Star any problem from the list to shortlist it for CSR or technical sponsorship."
                    />
                  ) : viewMode === 'supported' ? (
                    <EmptyState
                      title="No supported projects yet"
                      description="You haven't added any problems to your supported projects portfolio. Click 'Support Project' on any problem to pledge support."
                    />
                  ) : viewMode === 'active' ? (
                    <EmptyState
                      title="No active partnerships yet"
                      description="You have no partnerships in discussion, confirmed, or in progress. Click 'Pledge Support' on any problem to start an active partnership."
                    />
                  ) : viewMode === 'completed' ? (
                    <EmptyState
                      title="No completed partnerships yet"
                      description="No partnerships have been marked as completed yet. Once your organization delivers solutions with academic teams, mark them completed."
                    />
                  ) : (
                    <div className="space-y-3 text-center">
                      <EmptyState
                        title="No matching reports found"
                        description="No reports match your current search query or filter selection. Try adjusting or clearing your filters."
                      />
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <PartnerReportsTable
                  reports={filteredReports}
                  onViewDetails={(report) => setSelectedReport(report)}
                  onOpenCollab={(report) => setCollabReport(report)}
                  onToggleInterested={handleToggleInterested}
                  onToggleSupported={handleToggleSupported}
                />
              )}
            </div>
          )}
        </div>

        {/* View Details Modal */}
        <PartnerReportDetailsModal
          report={selectedReport}
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          onOpenCollabModal={(report) => {
            setSelectedReport(null)
            setCollabReport(report)
          }}
        />

        {/* Partnership Collab Modal */}
        <PartnerCollabModal
          report={collabReport}
          isOpen={Boolean(collabReport)}
          onClose={() => setCollabReport(null)}
          onSaved={(trackId) => {
            notify(`Partnership commitment saved for problem ${trackId}!`)
          }}
        />
      </PageContainer>
    </PartnerLayout>
  )
}