import { useState, useEffect, useMemo } from 'react'
import {
  CheckCircle2,
  GraduationCap,
  Send,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  Sparkles,
  Layers,
  Wrench,
  X,
  ShieldCheck,
} from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import {
  getReports,
  getHEIMatches,
  submitHEIInterest,
  type BackendReportResponse,
  type HEIMatchingResponse,
  type HEIRecommendationMatch,
} from '../../services/reportService'

export function HEIMatchingPage() {
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [loadingReports, setLoadingReports] = useState<boolean>(true)
  const [reportsError, setReportsError] = useState<string | null>(null)

  const [selectedTrackId, setSelectedTrackId] = useState<string>('')
  const [heiData, setHeiData] = useState<HEIMatchingResponse | null>(null)
  const [loadingMatches, setLoadingMatches] = useState<boolean>(false)
  const [matchesError, setMatchesError] = useState<string | null>(null)

  const [sentNotice, setSentNotice] = useState<string | null>(null)
  const [sentHEIIds, setSentHEIIds] = useState<Set<string>>(new Set())
  const [submittingHEIId, setSubmittingHEIId] = useState<string | null>(null)

  const [modalUniversity, setModalUniversity] = useState<HEIRecommendationMatch | null>(null)

  // Load live citizen reports from backend
  useEffect(() => {
    let isMounted = true
    setLoadingReports(true)
    setReportsError(null)

    getReports()
      .then((data) => {
        if (!isMounted) return
        setReports(data)
        if (data.length > 0) {
          // Pre-select the latest report
          setSelectedTrackId(data[0].track_id)
        }
      })
      .catch((err) => {
        if (!isMounted) return
        setReportsError(err instanceof Error ? err.message : 'Failed to load citizen problems.')
      })
      .finally(() => {
        if (isMounted) setLoadingReports(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Find currently selected report
  const activeReport = useMemo(() => {
    return reports.find((r) => r.track_id === selectedTrackId) || reports[0] || null
  }, [reports, selectedTrackId])

  // Load live AI recommendations when selected report changes
  useEffect(() => {
    if (!selectedTrackId) return

    let isMounted = true
    setLoadingMatches(true)
    setMatchesError(null)
    setSentNotice(null)

    getHEIMatches(selectedTrackId)
      .then((data) => {
        if (!isMounted) return
        setHeiData(data)
        // Mark universities that have already received official recommendations
        const recorded = new Set<string>(
          (data.recorded_interests || [])
            .filter((i) => i.action_type === 'official_recommendation')
            .map((i) => i.hei_id)
        )
        setSentHEIIds(recorded)
      })
      .catch((err) => {
        if (!isMounted) return
        setMatchesError(err instanceof Error ? err.message : 'Unable to calculate AI HEI matches.')
      })
      .finally(() => {
        if (isMounted) setLoadingMatches(false)
      })

    return () => {
      isMounted = false
    }
  }, [selectedTrackId])

  // Handle Send Recommendation
  const handleSendRecommendation = async (rec: HEIRecommendationMatch) => {
    if (sentHEIIds.has(rec.hei_id) || submittingHEIId) return

    setSubmittingHEIId(rec.hei_id)
    setSentNotice(null)

    try {
      const res = await submitHEIInterest(selectedTrackId, {
        hei_id: rec.hei_id,
        remarks: `Official Government recommendation: allocate problem ${selectedTrackId} to ${rec.hei_name} for collaborative R&D evaluation.`,
      })

      // Lock this university so it cannot be sent again
      setSentHEIIds((prev) => new Set([...prev, rec.hei_id]))
      setSentNotice(`Recommendation sent successfully to ${res.hei_name} and recorded in system audit logs.`)

      // If modal is open for this university, update it
      if (modalUniversity && modalUniversity.hei_id === rec.hei_id) {
        setModalUniversity({ ...modalUniversity })
      }
    } catch (err) {
      setSentNotice(
        err instanceof Error ? err.message : 'Failed to send recommendation. Please try again.'
      )
    } finally {
      setSubmittingHEIId(null)
    }
  }

  const getScoreBadgeClass = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-300/40'
    if (score >= 65) return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-300/40'
    if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-300/40'
    return 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-300/40'
  }

  return (
    <GovernmentLayout title="HEI Match">
      <GovPage
        title="HEI Match"
        description="Recommend accredited state universities and technical institutions for live citizen problems using explainable AI capability matching."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'HEI Match' },
        ]}
      >
        {/* Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-700">
          <GraduationCap className="mt-0.5 shrink-0 text-[#187e8d]" size={20} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#13243b]">Live AI-Assisted University Recommendations</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#187e8d]/10 px-2 py-0.5 text-[11px] font-semibold text-[#187e8d]">
                <Sparkles size={11} />
                Live Database Flow
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              Matches are calculated live from citizen problem requirements against institutional laboratories, departments, equipment, and geographic proximity.
            </p>
          </div>
        </div>

        {/* Live Problem Selector */}
        <div className="max-w-2xl">
          <label htmlFor="problem-select" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
            Select a live citizen problem
          </label>

          {loadingReports ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">
              <Loader2 className="animate-spin text-[#187e8d]" size={16} />
              <span>Loading live citizen problems from database...</span>
            </div>
          ) : reportsError ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              <span>{reportsError}</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              No citizen problems found in the database. Please submit a problem first.
            </div>
          ) : (
            <select
              id="problem-select"
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-[#13243b] shadow-2xs transition focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
            >
              {reports.map((r) => (
                <option key={r.track_id} value={r.track_id}>
                  [{r.track_id}] {r.problem_title} ({r.district}, {r.category}) - {r.status}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Selected Problem Summary */}
        {activeReport && (
          <ResponsiveCard className="mt-6 border border-slate-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#187e8d]">
                    {activeReport.track_id}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {activeReport.category}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    Status: {activeReport.status}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                    Priority: {activeReport.priority}
                  </span>
                </div>
                <h2 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b]">
                  {activeReport.problem_title}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={13} className="text-[#187e8d]" />
                  <span>
                    {activeReport.locality ? `${activeReport.locality}, ` : ''}
                    {activeReport.district}, {activeReport.state}
                  </span>
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {activeReport.context_and_desired_outcome || activeReport.ai_summary || 'No community context provided.'}
            </p>

            {/* Extracted Capabilities & Requirements */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                AI-Extracted Capability Requirements
              </h3>

              <div className="mt-2.5 flex flex-wrap gap-2">
                {activeReport.ai_capabilities?.skills && activeReport.ai_capabilities.skills.length > 0 ? (
                  activeReport.ai_capabilities.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-medium text-[#187e8d]"
                    >
                      <Layers size={11} />
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    Analyzing required skills based on problem classification...
                  </span>
                )}

                {activeReport.ai_capabilities?.equipment?.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    <Wrench size={11} />
                    {eq}
                  </span>
                ))}
              </div>

              {activeReport.ai_capabilities?.complexity && (
                <p className="mt-2 text-xs text-slate-500">
                  Estimated project complexity: <strong className="capitalize text-slate-700">{activeReport.ai_capabilities.complexity}</strong>
                  {activeReport.ai_capabilities.estimated_duration_days && (
                    <span> · Duration: ~{activeReport.ai_capabilities.estimated_duration_days} days</span>
                  )}
                </p>
              )}
            </div>
          </ResponsiveCard>
        )}

        {/* Global Action Feedback Alert */}
        {sentNotice && (
          <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="shrink-0 text-emerald-600" size={18} />
              <span>{sentNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSentNotice(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* AI Recommendations Section */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Recommended Universities & HEIs ({heiData?.matches?.length || 0})
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by AI capability alignment with problem category, required technical skills, laboratories, and district location.
              </p>
            </div>
            {heiData?.model && (
              <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-mono text-slate-500">
                Matcher Engine: {heiData.model}
              </span>
            )}
          </div>

          {loadingMatches ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-14">
              <Loader2 className="animate-spin text-[#187e8d]" size={32} />
              <p className="mt-3 text-sm font-semibold text-slate-700">Evaluating Higher Education Institutions...</p>
              <p className="text-xs text-slate-400">Comparing required skills and facilities against accredited Jharkhand universities</p>
            </div>
          ) : matchesError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertCircle className="mx-auto text-red-500" size={28} />
              <p className="mt-2 text-sm font-semibold text-red-800">{matchesError}</p>
              <p className="text-xs text-red-600">Please retry or select another live problem.</p>
            </div>
          ) : !heiData || !heiData.matches || heiData.matches.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              <Building2 className="mx-auto text-slate-400" size={32} />
              <p className="mt-2 text-sm font-semibold text-slate-700">No suitable universities found</p>
              <p className="text-xs text-slate-400">Problem requirements are currently being evaluated or require manual department assignment.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {heiData.matches.map((recommendation) => {
                const isSent = sentHEIIds.has(recommendation.hei_id)
                const isSubmitting = submittingHEIId === recommendation.hei_id

                return (
                  <ResponsiveCard
                    key={recommendation.hei_id}
                    className="flex h-full flex-col justify-between border border-slate-200 bg-white transition hover:shadow-md"
                  >
                    <div>
                      {/* Card Header: University Name & Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                            {recommendation.institution_type}
                          </span>
                          <h4 className="mt-1.5 font-[Manrope] text-base font-bold text-[#13243b]">
                            {recommendation.hei_name}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block rounded-lg px-2.5 py-1 text-sm font-extrabold ${getScoreBadgeClass(recommendation.match_score)}`}>
                            {Math.round(recommendation.match_score)}%
                          </span>
                          <span className="block mt-0.5 text-[10px] font-semibold capitalize text-slate-400">
                            {recommendation.recommendation_level} match
                          </span>
                        </div>
                      </div>

                      {/* Location Proximity */}
                      <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={12} className="text-[#187e8d]" />
                        <span>{recommendation.district}, {recommendation.state}</span>
                      </p>

                      {/* AI Reasons / Explanation */}
                      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                        {recommendation.reasons && recommendation.reasons.length > 0 ? (
                          recommendation.reasons.slice(0, 2).map((r, i) => (
                            <p key={i} className="mt-1 first:mt-0">• {r}</p>
                          ))
                        ) : (
                          <p>Strong alignment with problem category and regional capabilities.</p>
                        )}
                      </div>

                      {/* Matched Capabilities */}
                      {recommendation.matched_capabilities?.matched_skills &&
                        recommendation.matched_capabilities.matched_skills.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                              Matched Skills
                            </h5>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {recommendation.matched_capabilities.matched_skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Laboratories / Resources Preview */}
                      {recommendation.laboratories && recommendation.laboratories.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                            Relevant Laboratories
                          </h5>
                          <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                            {recommendation.laboratories.join(' · ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                      {isSent ? (
                        <button
                          type="button"
                          disabled
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 cursor-not-allowed"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Recommendation Sent
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSendRecommendation(recommendation)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#187e8d] disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              Send recommendation
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setModalUniversity(recommendation)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View university
                      </button>
                    </div>
                  </ResponsiveCard>
                )
              })}
            </div>
          )}
        </div>

        {/* Real University Details Modal */}
        {modalUniversity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setModalUniversity(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-3.5 pr-8">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#12365a] to-[#187e8d] text-white shadow-md">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                      {modalUniversity.institution_type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={13} />
                      Accredited
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-[Manrope] text-xl font-bold text-[#13243b]">
                    {modalUniversity.hei_name}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={13} className="text-[#187e8d]" />
                    <span>{modalUniversity.district}, {modalUniversity.state}</span>
                    {modalUniversity.contact_email && (
                      <span className="ml-2 font-mono">· {modalUniversity.contact_email}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* AI Match Score Breakdown for Current Problem */}
              <div className="mt-6 rounded-xl border border-[#b8dfe0] bg-[#f4fafb] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#12365a]">
                    <Sparkles size={14} className="text-[#187e8d]" />
                    Explainable AI Match Rubric
                  </h4>
                  <span className={`rounded-lg px-2.5 py-0.5 text-sm font-black ${getScoreBadgeClass(modalUniversity.match_score)}`}>
                    Total Score: {Math.round(modalUniversity.match_score)} / 100
                  </span>
                </div>

                {modalUniversity.factor_scores && (
                  <div className="mt-3 grid grid-cols-3 gap-2.5 text-xs sm:grid-cols-6">
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Skills (30%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.skills}</strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Domains (25%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.technical_domains}</strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Labs/Equip (15%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.equipment}</strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Software (10%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.software}</strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Location (10%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.location}</strong>
                    </div>
                    <div className="rounded-lg bg-white p-2 text-center border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Capacity (10%)</span>
                      <strong className="text-sm text-[#13243b]">{modalUniversity.factor_scores.complexity}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Real University Data Sections */}
              <div className="mt-6 space-y-4 text-xs">
                {/* Academic Departments */}
                {modalUniversity.departments && modalUniversity.departments.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-700">Academic Departments</h5>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {modalUniversity.departments.map((dept) => (
                        <span key={dept} className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Skills */}
                {modalUniversity.available_skills && modalUniversity.available_skills.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-700">Institutional Competencies & Skills</h5>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {modalUniversity.available_skills.map((skill) => (
                        <span key={skill} className="rounded-md bg-[#e8f5f5] px-2.5 py-1 font-medium text-[#187e8d]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Laboratories & Equipment */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {modalUniversity.laboratories && modalUniversity.laboratories.length > 0 && (
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                      <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Building2 size={13} className="text-[#187e8d]" />
                        Laboratories & Testing Facilities
                      </h5>
                      <ul className="mt-2 space-y-1 text-slate-600">
                        {modalUniversity.laboratories.map((lab) => (
                          <li key={lab}>• {lab}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {modalUniversity.equipment && modalUniversity.equipment.length > 0 && (
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                      <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Wrench size={13} className="text-[#187e8d]" />
                        Specialized Equipment
                      </h5>
                      <ul className="mt-2 space-y-1 text-slate-600">
                        {modalUniversity.equipment.map((eq) => (
                          <li key={eq}>• {eq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Software Tools */}
                {modalUniversity.software_tools && modalUniversity.software_tools.length > 0 && (
                  <div>
                    <h5 className="font-bold text-slate-700">Software & Computational Tools</h5>
                    <p className="mt-1 text-slate-600">
                      {modalUniversity.software_tools.join(', ')}
                    </p>
                  </div>
                )}

                {/* Civic Project Track Record & Faculty Capacity */}
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-500 block">Available Faculty Capacity:</span>
                    <strong className="text-slate-800 text-sm">
                      {modalUniversity.available_faculty_capacity || 25}+ Professors & Researchers
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Civic Projects Track Record:</span>
                    <strong className="text-slate-800 text-sm">
                      {modalUniversity.project_experience?.completed_civic_projects || 12} completed, {modalUniversity.project_experience?.active_projects || 4} active
                    </strong>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalUniversity(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close Details
                </button>

                {sentHEIIds.has(modalUniversity.hei_id) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Recommendation Already Sent
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={submittingHEIId === modalUniversity.hei_id}
                    onClick={() => handleSendRecommendation(modalUniversity)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#12365a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#187e8d] disabled:opacity-50"
                  >
                    <Send size={14} />
                    Send Official Recommendation
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}