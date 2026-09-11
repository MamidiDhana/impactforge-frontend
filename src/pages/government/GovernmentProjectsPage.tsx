import { useState, useEffect, useMemo, useCallback } from 'react'
import { Building2, Search, RefreshCw, Tag } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage, isCitizenSubmittedReport } from './GovernmentShared'
import { FilterBar } from '../../components/forms/FilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorState } from '../../components/common/ErrorState'
import { ProjectProgress } from '../../components/projects/ProjectProgress'
import { ProjectStatusBadge } from '../../components/projects/ProjectStatusBadge'
import { GovernmentProjectDetailsModal } from '../../components/government/GovernmentProjectDetailsModal'
import {
  getReports,
  getReportByTrackId,
  updateReportStatus,
  type BackendReportResponse,
} from '../../services/reportService'
import type { GovernmentProject } from '../../types'

export interface LiveGovernmentProject extends GovernmentProject {
  district?: string
  locality?: string
  landmark?: string
  latitude?: number | null
  longitude?: number | null
  description?: string | null
  urgency?: string
  rawReport: BackendReportResponse
}

export function mapReportToGovernmentProject(report: BackendReportResponse): LiveGovernmentProject {
  const isResolved = report.status === 'Resolved'
  const isInProgress = report.status === 'In Progress'

  const stage = isResolved ? 'Completed' : isInProgress ? 'Pilot' : 'Prototype'
  const currentMilestone = isResolved
    ? 'Impact review & handoff'
    : isInProgress
    ? 'Field pilot & deployment'
    : 'Engineering prototype design'
  const progress = isResolved ? 100 : isInProgress ? 70 : 35
  const projectStatus: 'Active' | 'Completed' = isResolved ? 'Completed' : 'Active'

  const analyticsReach = report.ai_project_analytics?.beneficiary_reach?.max_reach
  const beneficiaries =
    typeof analyticsReach === 'number' && analyticsReach > 0
      ? analyticsReach
      : report.priority === 'Critical'
      ? 15000
      : report.priority === 'High'
      ? 8500
      : 3200

  const organization =
    report.assigned_to ||
    (report.district ? `${report.district} District Innovation Cell` : 'Jharkhand Innovation Operations')

  const facultyLead =
    report.assigned_role === 'hei' || report.assigned_role === 'faculty'
      ? report.assigned_to || 'Assigned University Faculty Lead'
      : 'State Operations Lead'

  const lastUpdated = (() => {
    try {
      const d = new Date(report.updated_at || report.created_at)
      if (isNaN(d.getTime())) return 'Recently'
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return 'Recently'
    }
  })()

  return {
    id: report.track_id,
    title: `${report.problem_title} Resolution Project`,
    problemTitle: report.problem_title,
    category: report.category,
    organization,
    facultyLead,
    stage,
    currentMilestone,
    progress,
    beneficiaries,
    lastUpdated,
    status: projectStatus,
    district: report.district,
    locality: report.locality,
    landmark: report.address_or_landmark,
    latitude: report.latitude,
    longitude: report.longitude,
    description: report.context_and_desired_outcome,
    urgency: report.priority,
    rawReport: report,
  }
}

export function GovernmentProjectsPage() {
  const { id: paramProjectId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<LiveGovernmentProject[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<LiveGovernmentProject | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [stage, setStage] = useState('All stages')

  // Load live projects directly from the existing database/API: GET /api/reports
  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)

    try {
      const data = await getReports()
      // Filter strictly to live citizen portal submitted problems
      const citizenReports = data.filter(isCitizenSubmittedReport)

      // Group by normalized title so we show representative projects for each community challenge
      const titleGroups = new Map<string, BackendReportResponse[]>()
      for (const rep of citizenReports) {
        const key = (rep.problem_title || '').trim().toLowerCase()
        const existing = titleGroups.get(key)
        if (!existing) {
          titleGroups.set(key, [rep])
        } else {
          existing.push(rep)
        }
      }

      const representatives: BackendReportResponse[] = []
      for (const group of titleGroups.values()) {
        if (group.length === 1) {
          representatives.push(group[0])
        } else {
          // Prefer Resolved/In Progress over Open, and newest first
          const sorted = [...group].sort((a, b) => {
            const score = (s: string) => (s === 'Resolved' ? 3 : s === 'In Progress' ? 2 : 1)
            const diff = score(b.status) - score(a.status)
            if (diff !== 0) return diff
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
          representatives.push(sorted[0])
        }
      }

      const liveProjects = representatives.map(mapReportToGovernmentProject)
      setProjects(liveProjects)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server.'
      setFetchError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // If a project ID is present in the URL (/government/projects/:id), automatically open its complete details
  useEffect(() => {
    if (!paramProjectId) return

    const match = projects.find((p) => p.id === paramProjectId)
    if (match) {
      setSelectedProject(match)
    } else if (!isLoading && projects.length > 0) {
      // Fetch directly from API if not yet in list
      getReportByTrackId(paramProjectId)
        .then((rep) => {
          if (rep) {
            setSelectedProject(mapReportToGovernmentProject(rep))
          }
        })
        .catch(() => {
          // Not found
        })
    }
  }, [paramProjectId, projects, isLoading])

  const handleViewProject = (proj: LiveGovernmentProject) => {
    setSelectedProject(proj)
    navigate(`/government/projects/${proj.id}`)
  }

  const handleCloseModal = () => {
    setSelectedProject(null)
    navigate('/government/projects')
  }

  const handleUpdateStatus = async (
    trackId: string,
    newStatus: 'Open' | 'In Progress' | 'Resolved' | 'Rejected'
  ) => {
    setIsUpdatingStatus(true)
    try {
      const updatedReport = await updateReportStatus(trackId, newStatus)
      const updatedProject = mapReportToGovernmentProject(updatedReport)

      setProjects((prev) =>
        prev.map((p) => (p.id === trackId ? updatedProject : p))
      )

      if (selectedProject && selectedProject.id === trackId) {
        setSelectedProject(updatedProject)
      }
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const results = useMemo(
    () =>
      projects.filter(
        (item) =>
          `${item.title} ${item.problemTitle} ${item.id}`.toLowerCase().includes(search.toLowerCase()) &&
          (status === 'All statuses' || item.status === status) &&
          (stage === 'All stages' || item.stage === stage)
      ),
    [projects, search, stage, status]
  )

  return (
    <GovernmentLayout title="Projects">
      <GovPage
        title="Projects"
        description="Follow live projects created from validated community problems."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Projects' },
        ]}
        action={
          <button
            type="button"
            onClick={loadProjects}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Reload projects from backend"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'} />
            <span>{isLoading ? 'Fetching...' : 'Sync Live Projects'}</span>
          </button>
        }
      >
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: status,
              options: ['All statuses', 'Active', 'Completed'].map((value) => ({ label: value, value })),
              onChange: setStatus,
            },
            {
              id: 'stage',
              label: 'Current stage',
              value: stage,
              options: ['All stages', 'Prototype', 'Pilot', 'Completed'].map((value) => ({ label: value, value })),
              onChange: setStage,
            },
          ]}
        />

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {results.length} {results.length === 1 ? 'project' : 'projects'} · Live Community Initiatives
          </p>
        </div>

        {isLoading ? (
          <div className="mt-5">
            <LoadingState rows={4} />
          </div>
        ) : fetchError ? (
          <div className="mt-5">
            <ErrorState
              title="Unable to load live projects"
              description={fetchError}
              onRetry={loadProjects}
            />
          </div>
        ) : results.length ? (
          <div className="mt-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Active Live Projects</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {results.map((project) => (
                <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="flex items-center gap-1 rounded bg-[#12365a] px-2 py-0.5 font-mono text-xs font-bold text-white">
                          <Tag size={10} /> {project.id}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          {project.category}
                        </span>
                      </div>
                      <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">{project.title}</h3>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">Related problem: {project.problemTitle}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Building2 size={14} className="text-[#187e8d]" />
                    {project.organization} · {project.facultyLead}
                  </p>
                  <div className="mt-5">
                    <ProjectProgress percentage={project.progress} currentStage={project.stage} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                    <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleViewProject(project)}
                    className="mt-5 rounded-lg border border-[#12365a] px-4 py-2 text-sm font-semibold text-[#12365a] hover:bg-[#12365a] hover:text-white transition cursor-pointer"
                  >
                    View project
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={Search} title="No projects found" description="Try a different project filter." />
          </div>
        )}

        {/* Complete Live Project Details Modal */}
        {selectedProject && (
          <GovernmentProjectDetailsModal
            project={selectedProject}
            onClose={handleCloseModal}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={isUpdatingStatus}
          />
        )}
      </GovPage>
    </GovernmentLayout>
  )
}