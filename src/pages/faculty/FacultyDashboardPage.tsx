import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FilePlus2,
  Star,
  FolderKanban,
  GraduationCap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { DashboardWelcome } from '../../components/dashboard/DashboardWelcome'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ErrorState } from '../../components/common/ErrorState'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import {
  FacultyReportFilters,
  type FacultyViewMode,
} from '../../components/faculty/FacultyReportFilters'
import { FacultyReportsTable } from '../../components/faculty/FacultyReportsTable'
import { FacultyReportDetailsModal } from '../../components/faculty/FacultyReportDetailsModal'
import { FacultyAssignStudentModal } from '../../components/faculty/FacultyAssignStudentModal'
import { AnnouncementBanner } from '../../components/notifications/AnnouncementBanner'
import { useFaculty } from '../../context/FacultyContext'
import {
  getReports,
  type BackendReportResponse,
} from '../../services/reportService'

export function FacultyDashboardPage() {
  const {
    isInterested,
    toggleInterested,
    isInProjects,
    toggleProject,
    getProject,
    facultyProjects,
  } = useFaculty()

  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Selected report for Details modal
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null)

  // Selected report for Student Assignment modal
  const [assigningReport, setAssigningReport] = useState<BackendReportResponse | null>(null)

  // Search, filter, and tab view states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedUrgency, setSelectedUrgency] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [viewMode, setViewMode] = useState<FacultyViewMode>('all')

  // Toast / notification feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Load only Government-validated problems assigned to HEIs (exact same data source as University Dashboard)
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

  const handleToggleProject = (trackId: string) => {
    const nextState = toggleProject(trackId)
    notify(
      nextState
        ? `Problem ${trackId} added to your Faculty Project List.`
        : `Problem ${trackId} removed from your Faculty Project List.`
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
      if (viewMode === 'assigned') {
        const projectItem = getProject(report.track_id)
        if (!projectItem?.assignedStudent) return false
      }
      if (viewMode === 'completed') {
        const projectItem = getProject(report.track_id)
        if (projectItem?.progress !== 'Completed') return false
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
    getProject,
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

  // Dashboard Summary Cards calculation (Requirement 12)
  const stats = useMemo(() => {
    const total = reports.length
    const interestedCount = reports.filter((r) => isInterested(r.track_id)).length
    const projectsCount = reports.filter((r) => isInProjects(r.track_id)).length

    // Assigned projects: in project list and has student
    const assignedCount = Object.values(facultyProjects).filter(
      (p) => Boolean(p.assignedStudent)
    ).length

    // Completed projects: progress is Completed
    const completedCount = Object.values(facultyProjects).filter(
      (p) => p.progress === 'Completed'
    ).length

    return {
      total,
      interestedCount,
      projectsCount,
      assignedCount,
      completedCount,
    }
  }, [reports, isInterested, isInProjects, facultyProjects])

  return (
    <HEILayout
      title="Faculty Dashboard"
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'Faculty Dashboard' },
      ]}
    >
      <PageContainer>
        <PageHeader
          title="Faculty Academic Research & Student Project Hub"
          description="Discover authentic citizen problems across Jharkhand, guide multidisciplinary student engineering cohorts, and track research outcomes."
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'Faculty Dashboard' },
          ]}
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
            name="Faculty Mentorship & Project Portal"
            description="Empowering university professors and academic mentors on verified grassroots challenges reported in Jharkhand. Supervise engineering milestones, and track deployment."
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

          {/* 5 Summary Metric Cards (Requirement 12) */}
          <section>
            <SectionHeader
              title="Academic Research & Mentorship Overview"
              description="Real-time institutional metrics calculated from live citizen problem submissions and your faculty portfolio."
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
                description="Shortlisted by faculty"
                icon={Star}
              />
              <StatCard
                label="Faculty Project List"
                value={String(stats.projectsCount)}
                description="Active faculty portfolio"
                icon={FolderKanban}
              />
              <StatCard
                label="Assigned Projects"
                value={String(stats.assignedCount)}
                description="Delegated to student researchers"
                icon={GraduationCap}
              />
              <StatCard
                label="Completed Projects"
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
                description="No citizen problem submissions currently exist in the database. New submissions from citizens will automatically show up here."
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search, Filter, and Tabs Toolbar */}
              <FacultyReportFilters
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
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                totalCount={reports.length}
                filteredCount={filteredReports.length}
                interestedCount={stats.interestedCount}
                projectsCount={stats.projectsCount}
                assignedCount={stats.assignedCount}
                completedCount={stats.completedCount}
              />

              {/* Table, Empty Filtered State, or Empty Tab View */}
              {filteredReports.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  {viewMode === 'interested' ? (
                    <EmptyState
                      title="No interested problems yet"
                      description="You haven't marked any problems as interested yet. Star any problem from the list to shortlist it for academic exploration."
                    />
                  ) : viewMode === 'projects' ? (
                    <EmptyState
                      title="Your Faculty Project List is empty"
                      description="You haven't added any problems to your project list yet. Click the folder icon on any problem to initiate an academic project."
                    />
                  ) : viewMode === 'assigned' ? (
                    <EmptyState
                      title="No problems assigned to students yet"
                      description="You haven't assigned any problems to student researchers. Click '+ Assign student' on any project in your list to delegate research tasks."
                    />
                  ) : viewMode === 'completed' ? (
                    <EmptyState
                      title="No completed projects yet"
                      description="No projects have been marked as completed. Once project solutions are developed and delivered, update their status to Completed."
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
                <FacultyReportsTable
                  reports={filteredReports}
                  onViewDetails={(report) => setSelectedReport(report)}
                  onAssignStudent={(report) => setAssigningReport(report)}
                  onToggleInterested={handleToggleInterested}
                  onToggleProject={handleToggleProject}
                />
              )}
            </div>
          )}
        </div>

        {/* View Details Modal */}
        <FacultyReportDetailsModal
          report={selectedReport}
          isOpen={Boolean(selectedReport)}
          onClose={() => setSelectedReport(null)}
          onOpenAssignModal={(report) => {
            setSelectedReport(null)
            setAssigningReport(report)
          }}
        />

        {/* Assign Student Modal */}
        <FacultyAssignStudentModal
          report={assigningReport}
          isOpen={Boolean(assigningReport)}
          onClose={() => setAssigningReport(null)}
          onAssigned={(trackId, studentName) => {
            notify(`Assigned problem ${trackId} to student ${studentName}.`)
          }}
        />
      </PageContainer>
    </HEILayout>
  )
}