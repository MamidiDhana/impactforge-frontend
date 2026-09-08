import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  Clock3,
  Circle,
  AlertCircle,
  Building2,
  GraduationCap,
  Users,
  Handshake,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Star,
  Sparkles,
  Send,
  Boxes,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { CitizenStatusBadge } from '../../components/citizen/CitizenStatusBadge'
import { JharkhandMapPreview } from '../../components/citizen/JharkhandMapPreview'
import { useProblems } from '../../context/ProblemContext'
import { getReportByTrackId, getReports, mapBackendReportToCitizenProblem } from '../../services/reportService'
import type { CitizenFeedback, CitizenProblem, TrackingStage } from '../../types'

export function CitizenTrackProblemPage() {
  const { trackId: paramTrackId } = useParams()
  const navigate = useNavigate()
  const { submitCitizenFeedback, addBackendProblem } = useProblems()

  // Active problem loaded from backend
  const [activeProblem, setActiveProblem] = useState<CitizenProblem | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [backendReportsList, setBackendReportsList] = useState<{ trackId: string; title: string }[]>([])

  // Track ID search input
  const [searchInput, setSearchInput] = useState(paramTrackId || '')

  // Feedback form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [problemSolved, setProblemSolved] = useState<'yes' | 'partially' | 'no'>('yes')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Fetch report by track_id from backend (GET /api/reports/{track_id})
  const loadReport = async (trackIdToLoad?: string, isStatusRefresh = false) => {
    if (isStatusRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setFetchError(null)

    try {
      // Fetch available backend reports list for selector
      try {
        const all = await getReports()
        setBackendReportsList(
          all.map((r) => ({
            trackId: r.track_id,
            title: r.problem_title,
          }))
        )

        if (!trackIdToLoad && all.length > 0) {
          trackIdToLoad = all[0].track_id
        }
      } catch (listErr) {
        console.warn('Failed to load backend reports list:', listErr)
      }

      if (trackIdToLoad && trackIdToLoad.trim()) {
        const cleanId = trackIdToLoad.trim().toUpperCase()
        setSearchInput(cleanId)
        const backendReport = await getReportByTrackId(cleanId)
        const mappedProblem = mapBackendReportToCitizenProblem(backendReport)
        setActiveProblem(mappedProblem)
        addBackendProblem(mappedProblem)

        if (isStatusRefresh) {
          setRefreshSuccess(true)
          setTimeout(() => setRefreshSuccess(false), 2500)
        }
      } else {
        setActiveProblem(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report not found or server error.'
      setFetchError(msg)
      setActiveProblem(null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Load report when paramTrackId changes
  useEffect(() => {
    loadReport(paramTrackId)
  }, [paramTrackId])

  const handleRefreshStatus = () => {
    const idToRefresh = activeProblem?.trackId || paramTrackId || searchInput
    if (idToRefresh) {
      loadReport(idToRefresh, true)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/citizen/track/${searchInput.trim().toUpperCase()}`)
    }
  }

  // Calculate timeline progress
  const stages: TrackingStage[] = activeProblem?.timelineStages || []
  const completedCount = stages.filter((s) => s.status === 'Completed').length
  const progressPercent = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  const currentStage = stages.find((s) => s.status === 'In Progress') || stages[stages.length - 1]

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProblem) return
    const now = new Date()
    const dateStr = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`

    const feedback: CitizenFeedback = {
      rating,
      comment: comment.trim() || 'Solution implemented and functioning well.',
      problemSolved,
      submittedAt: dateStr,
    }
    if (!activeProblem?.trackId) return
    submitCitizenFeedback(activeProblem.trackId, feedback)
    setFeedbackSubmitted(true)
  }

  const roleIcon = (role: TrackingStage['responsibleRole']) => {
    switch (role) {
      case 'Government':
        return <ShieldCheck size={14} className="text-indigo-600" />
      case 'HEI/University':
        return <GraduationCap size={14} className="text-[#187e8d]" />
      case 'Faculty':
        return <Building2 size={14} className="text-amber-600" />
      case 'Student Project Team':
        return <Users size={14} className="text-teal-600" />
      case 'Partner':
        return <Handshake size={14} className="text-purple-600" />
      default:
        return <Users size={14} className="text-slate-600" />
    }
  }

  const isResolvedOrHigher =
    activeProblem &&
    ((activeProblem.currentStageIndex ?? 0) >= 13 ||
      activeProblem.status === 'Converted to Project' ||
      activeProblem.status === 'Resolved' ||
      activeProblem.timelineStages?.[13]?.status === 'Completed')

  return (
    <CitizenLayout title="Track Problem">
      <PageContainer className="space-y-6">
        <PageHeader
          title="Track Problem"
          description="Follow the comprehensive 15-stage resolution lifecycle of your reported community problem."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Track Problem' },
          ]}
        />

        {/* Track ID Search and Real Backend Report Selector */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input Form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Track ID (e.g. IF-JH-2026-0001)..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium uppercase text-slate-800 transition focus:border-[#187e8d] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-[#12365a] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#1a4a7a]"
              >
                Search
              </button>
            </form>

            {/* Quick selector of live reports from backend */}
            {backendReportsList.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Live Reports:</span>
                <select
                  value={activeProblem?.trackId || ''}
                  onChange={(e) => {
                    setSearchInput(e.target.value)
                    navigate(`/citizen/track/${e.target.value}`)
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {backendReportsList.map((p) => (
                    <option key={p.trackId} value={p.trackId}>
                      {p.trackId} - {p.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-[#187e8d]" />
            <h3 className="mt-4 font-[Manrope] text-base font-bold text-[#13243b]">
              Loading Problem Report...
            </h3>
            <p className="mt-1 text-xs text-slate-500">Fetching live status from ImpactForge backend</p>
          </div>
        ) : !activeProblem ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <AlertCircle size={36} className="mx-auto text-amber-500" />
            <h2 className="mt-3 font-[Manrope] text-lg font-bold text-[#13243b]">
              {fetchError || `No Problem Found for Track ID "${searchInput || paramTrackId || ''}"`}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Please verify the Track ID format (e.g. IF-JH-2026-0001) or report a new community problem.
            </p>
            <div className="mt-5">
              <Link
                to="/citizen/submit-problem"
                className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white shadow hover:bg-[#1a4a7a]"
              >
                Report a Problem
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status & Progress Summary Hero Banner */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wider">
                        {activeProblem.trackId}
                      </span>
                      <CitizenStatusBadge status={activeProblem.status} />
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} className="text-[#187e8d]" />
                        {activeProblem.district}, Jharkhand
                      </span>
                    </div>

                    <h1 className="mt-3 font-[Manrope] text-xl font-bold text-[#13243b] sm:text-2xl">
                      {activeProblem.title}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{activeProblem.description}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {/* Status Refresh Action */}
                    <button
                      type="button"
                      onClick={handleRefreshStatus}
                      disabled={isRefreshing}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#187e8d] hover:bg-slate-50 disabled:opacity-60 active:scale-95"
                      title="Refresh current report status from backend"
                    >
                      <RefreshCw
                        size={14}
                        className={isRefreshing ? 'animate-spin text-[#187e8d]' : refreshSuccess ? 'text-emerald-600' : 'text-slate-600'}
                      />
                      <span>
                        {isRefreshing
                          ? 'Refreshing...'
                          : refreshSuccess
                          ? 'Status Up to Date!'
                          : 'Refresh Status'}
                      </span>
                    </button>

                    <Link
                      to={`/citizen/problems/${activeProblem.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-[#187e8d] hover:bg-slate-50"
                    >
                      <ExternalLink size={14} />
                      <span>View Problem Details</span>
                    </Link>
                  </div>
                </div>

                {/* Progress Bar & Stage Indicator */}
                <div className="mt-6 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-500">Current Status: </span>
                      <strong className="font-bold text-[#187e8d]">
                        {currentStage ? currentStage.name : 'In Progress'}
                      </strong>
                    </div>
                    <div className="font-semibold text-slate-700">
                      Overall Progress:{' '}
                      <span className="font-mono text-sm font-bold text-[#12365a]">{progressPercent}%</span>{' '}
                      ({completedCount} of {stages.length} stages)
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#187e8d] via-[#2ab3c6] to-emerald-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>1. Problem Reported</span>
                    <span className="hidden sm:inline">8. Analysis Started</span>
                    <span className="hidden md:inline">11. Prototype Pilot</span>
                    <span>15. Feedback & Resolved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout: 15-Stage Timeline on left, Location & Resources on right */}
            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              {/* Left Column: Complete 15-Stage Visual Stepper */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                      15-Stage Solution Lifecycle Timeline
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Track the real-time progress from citizen report through university research, partner collaboration, and deployed resolution.
                    </p>
                  </div>

                  {/* Stepper list */}
                  <div className="mt-6 flow-root">
                    <ol className="-mb-8">
                      {stages.map((stage, idx) => {
                        const isLast = idx === stages.length - 1
                        const isCompleted = stage.status === 'Completed'
                        const isInProgress = stage.status === 'In Progress'

                        return (
                          <li key={stage.id} className="relative pb-8">
                            {!isLast && (
                              <span
                                className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${
                                  isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                                }`}
                                aria-hidden="true"
                              />
                            )}

                            <div className="relative flex items-start space-x-3.5">
                              {/* Step Icon */}
                              <div>
                                {isCompleted ? (
                                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 ring-4 ring-emerald-50 text-emerald-700">
                                    <CheckCircle2 size={16} />
                                  </span>
                                ) : isInProgress ? (
                                  <span className="flex size-8 items-center justify-center rounded-full bg-sky-100 ring-4 ring-sky-50 text-[#187e8d] animate-pulse">
                                    <Clock3 size={16} />
                                  </span>
                                ) : (
                                  <span className="flex size-8 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-50 text-slate-400">
                                    <Circle size={12} />
                                  </span>
                                )}
                              </div>

                              {/* Stage Information */}
                              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-slate-50">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-400">
                                      #{stage.id}
                                    </span>
                                    <h3
                                      className={`text-sm font-bold ${
                                        isInProgress
                                          ? 'text-[#187e8d]'
                                          : isCompleted
                                          ? 'text-slate-900'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      {stage.name}
                                    </h3>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                        isCompleted
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isInProgress
                                          ? 'bg-sky-100 text-sky-800'
                                          : 'bg-slate-200/70 text-slate-600'
                                      }`}
                                    >
                                      {stage.status}
                                    </span>
                                    {stage.date && (
                                      <span className="text-[11px] text-slate-400">{stage.date}</span>
                                    )}
                                  </div>
                                </div>

                                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                                  {stage.description}
                                </p>

                                {/* Responsible Entity & Role Tag */}
                                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                                    {roleIcon(stage.responsibleRole)}
                                    <span>{stage.responsibleRole}</span>
                                  </div>
                                  {stage.responsibleOrg && (
                                    <span className="text-slate-400">
                                      · {stage.responsibleOrg}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                </div>

                {/* Citizen Resolution Feedback Form (Enabled on Problem Resolved / Stage 14/15) */}
                {isResolvedOrHigher && (
                  <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-sm sm:p-7">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Sparkles size={20} />
                      <h2 className="font-[Manrope] text-lg font-bold">
                        Stage 15: Citizen Resolution Feedback
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      As the reporting citizen, your feedback validates whether this deployed solution genuinely solved your community challenge.
                    </p>

                    {activeProblem.citizenFeedback || feedbackSubmitted ? (
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <CheckCircle2 size={16} className="text-emerald-700" />
                          <span>Thank you! Your feedback has been recorded for the Jharkhand governance audit.</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={
                                s <= (activeProblem.citizenFeedback?.rating || rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }
                            />
                          ))}
                        </div>
                        <p className="mt-2 font-medium">
                          "{activeProblem.citizenFeedback?.comment || comment}"
                        </p>
                        <p className="mt-1 text-[11px] text-emerald-700">
                          Problem Solved:{' '}
                          <strong>
                            {(activeProblem.citizenFeedback?.problemSolved || problemSolved) === 'yes'
                              ? 'Yes, fully resolved'
                              : 'Partially resolved'}
                          </strong>
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="mt-5 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Rate the implemented solution
                          </label>
                          <div className="mt-1.5 flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="p-1 text-amber-400 transition hover:scale-110"
                              >
                                <Star
                                  size={22}
                                  className={star <= rating ? 'fill-amber-400' : 'text-slate-300'}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-600">{rating} of 5 Stars</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Did this solution resolve the reported problem?
                          </label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {[
                              { id: 'yes', label: 'Yes, fully resolved' },
                              { id: 'partially', label: 'Partially resolved' },
                              { id: 'no', label: 'No, problem remains' },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setProblemSolved(opt.id as 'yes' | 'partially' | 'no')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  problemSolved === opt.id
                                    ? 'bg-[#12365a] text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Citizen Review Comment
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="Share how the water filter / equipment / facility is functioning in your community..."
                            className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
                          />
                        </div>

                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-800"
                        >
                          <Send size={14} />
                          <span>Submit Citizen Feedback</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Location Map Preview & Required Resources */}
              <div className="space-y-6">
                {/* Location Preview Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Reported Location
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Verified Jharkhand geographic site for this problem.
                  </p>

                  <div className="mt-3.5">
                    <JharkhandMapPreview
                      district={activeProblem.district}
                      locality={activeProblem.locality}
                      landmark={activeProblem.landmark}
                      latitude={activeProblem.latitude}
                      longitude={activeProblem.longitude}
                    />
                  </div>
                </div>

                {/* Section 3: Required Resources Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Boxes size={18} className="text-[#187e8d]" />
                      <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                        Required Resources
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                      {activeProblem.requiredResources?.length || 0} Items
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Resources identified by universities and faculties required to research, pilot, and deploy the solution.
                  </p>

                  <div className="mt-4 space-y-3">
                    {activeProblem.requiredResources && activeProblem.requiredResources.length > 0 ? (
                      activeProblem.requiredResources.map((res) => {
                        const isIdentified = res.status === 'Partner Identified'

                        return (
                          <div
                            key={res.id}
                            className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {res.category}
                                </span>
                                <h4 className="font-bold text-[#13243b]">{res.name}</h4>
                              </div>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  res.status === 'Available'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : res.status === 'Partially Available'
                                    ? 'bg-amber-100 text-amber-800'
                                    : isIdentified
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {res.status}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600 border-t border-slate-200/50 pt-1.5">
                              <span>
                                Quantity/Desc: <strong>{res.requiredQuantity}</strong>
                              </span>
                              {res.provider && (
                                <span className="text-slate-500">
                                  Provider: <strong className="text-[#187e8d]">{res.provider}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-400">No resources currently requested.</p>
                    )}
                  </div>
                </div>

                {/* Government & HEI Contacts Info Card */}
                <div className="rounded-2xl border border-[#b8dfe0] bg-[#e8f5f5]/60 p-4 text-xs text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-[#12365a]">
                    <ShieldCheck size={16} className="text-[#187e8d]" />
                    <span>Jharkhand State Innovation Desk</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-600">
                    Reports are overseen by the Jharkhand District Innovation Cell. Academic collaboration is facilitated with accredited state HEIs (BIT Mesra, NIT Jamshedpur, Central University of Jharkhand).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </CitizenLayout>
  )
}
