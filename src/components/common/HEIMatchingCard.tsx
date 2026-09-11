import React, { useEffect, useState } from 'react'
import {
  GraduationCap,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Layers,
  Wrench,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Send,
  AlertTriangle,
  Award,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  HEIMatchingResponse,
  HEIRecommendationMatch,
} from '../../services/reportService'
import { getHEIMatches, submitHEIInterest } from '../../services/reportService'

interface HEIMatchingCardProps {
  report?: BackendReportResponse | null
  heiData?: HEIMatchingResponse | null
  token?: string
  onInterestSubmitted?: () => void
}

export const HEIMatchingCard: React.FC<HEIMatchingCardProps> = ({
  report,
  heiData,
  token: propToken,
  onInterestSubmitted,
}) => {
  const { currentUser } = useAuth()
  const [data, setData] = useState<HEIMatchingResponse | null>(heiData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedHEI, setExpandedHEI] = useState<Record<string, boolean>>({})

  // Modal / Inline Remarks state
  const [activeModalHEI, setActiveModalHEI] = useState<HEIRecommendationMatch | null>(null)
  const [remarksText, setRemarksText] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const trackId = report?.track_id || heiData?.track_id

  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  const role = currentUser?.role || 'citizen'
  const isGovOrAdmin = role === 'government' || role === 'admin'
  const isHEI = role === 'hei'

  useEffect(() => {
    if (heiData) {
      setData(heiData)
      return
    }

    if (trackId) {
      let isMounted = true
      setLoading(true)
      setError(null)

      getHEIMatches(trackId, effectiveToken)
        .then((res) => {
          if (isMounted) {
            setData(res)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            // For HEI, Faculty, Partner roles, backend returns 403 by design
            const msg = err instanceof Error ? err.message : 'Unable to load HEI recommendations.'
            setError(msg)
            setLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    }
  }, [trackId, heiData, effectiveToken])

  if (!trackId) {
    return null
  }

  // If user role is faculty or partner, HEI matches are strictly restricted (403)
  if (role === 'faculty' || role === 'partner') {
    return null
  }

  const toggleExpand = (heiId: string) => {
    setExpandedHEI((prev) => ({ ...prev, [heiId]: !prev[heiId] }))
  }

  const handleOpenActionModal = (hei: HEIRecommendationMatch) => {
    setActiveModalHEI(hei)
    setRemarksText(
      isGovOrAdmin
        ? `Official recommendation: Allocate problem ${trackId} for R&D pilot evaluation.`
        : `Institutional expression of interest: Our faculty and laboratory facilities can support this challenge.`
    )
    setActionError(null)
  }

  const handleCloseActionModal = () => {
    setActiveModalHEI(null)
    setRemarksText('')
    setActionError(null)
  }

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalHEI || !remarksText.trim()) return

    setSubmitting(true)
    setActionError(null)

    try {
      const res = await submitHEIInterest(
        trackId,
        {
          hei_id: activeModalHEI.hei_id,
          remarks: remarksText.trim(),
        },
        effectiveToken
      )

      setActionSuccess(
        res.action_type === 'official_recommendation'
          ? `Official recommendation recorded for ${res.hei_name}.`
          : `Expression of interest recorded for ${res.hei_name}.`
      )

      // Refresh matches to show updated recorded interests
      if (trackId) {
        const updated = await getHEIMatches(trackId, effectiveToken)
        setData(updated)
      }

      handleCloseActionModal()
      if (onInterestSubmitted) {
        onInterestSubmitted()
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to record action.')
    } finally {
      setSubmitting(false)
    }
  }

  const getRecommendationBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/30'
      case 'strong':
        return 'bg-blue-500/10 text-blue-700 border-blue-300 ring-1 ring-blue-400/30'
      case 'moderate':
        return 'bg-amber-500/10 text-amber-700 border-amber-300 ring-1 ring-amber-400/30'
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300 ring-1 ring-slate-400/30'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 stroke-emerald-500'
    if (score >= 65) return 'text-blue-600 stroke-blue-500'
    if (score >= 40) return 'text-amber-600 stroke-amber-500'
    return 'text-slate-600 stroke-slate-500'
  }

  // Check whether this HEI belongs to the current HEI user
  const isOwnHEI = (hei: HEIRecommendationMatch) => {
    if (!currentUser || currentUser.role !== 'hei') return false
    const userEmail = (currentUser.email || '').toLowerCase()
    const userOrg = (currentUser.organization || '').toLowerCase()
    const heiName = hei.hei_name.toLowerCase()

    if (userEmail === 'dean.rnd@bitmesra.ac.in' && hei.hei_id === 'bit-mesra') return true
    if (userOrg && (userOrg.includes(heiName) || heiName.includes(userOrg))) return true
    return false
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#b8dfe0] bg-gradient-to-br from-white via-[#f4fafb] to-white p-6 shadow-sm sm:p-7">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#187e8d]/5 blur-3xl" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#12365a] to-[#187e8d] text-white shadow-md shadow-[#12365a]/20">
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-[Manrope] text-lg font-bold tracking-tight text-[#13243b]">
                Higher Education Institution (HEI) Matching
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f5] px-2.5 py-0.5 text-xs font-semibold text-[#187e8d]">
                <Sparkles size={12} />
                Phase 1 Part 6
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Institutional laboratory, engineering skill, and departmental capability recommendations.
            </p>
          </div>
        </div>

        {data?.model && (
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono font-medium text-slate-500 shadow-2xs">
            Model: {data.model}
          </span>
        )}
      </div>

      {/* Mandatory Advisory Disclaimer Banner */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 text-xs text-amber-900 shadow-2xs">
        <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Institutional Notice:</strong>{' '}
          AI recommendations are advisory. Authorized officials must review and approve any institutional collaboration.
        </p>
      </div>

      {/* Action feedback notifications */}
      {actionSuccess && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <Loader2 size={32} className="animate-spin text-[#187e8d]" />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            Calculating institutional capability fit...
          </p>
          <p className="text-xs text-slate-500">
            Evaluating skills, technical domains, laboratories, equipment, and geographical proximity.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-600">
          <AlertTriangle size={24} className="mx-auto text-slate-400" />
          <p className="mt-2 font-semibold text-slate-700">{error}</p>
          <p className="mt-1 text-slate-500">
            Institutional matching requires completed capability extraction and authorized access.
          </p>
        </div>
      )}

      {/* No matches / Pending State */}
      {!loading && !error && (!data?.matches || data.matches.length === 0) && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white/70 p-8 text-center">
          <Building2 size={28} className="mx-auto text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {data?.ai_hei_matching_status === 'pending'
              ? 'Institutional matching pending capability extraction.'
              : 'No matching institutions found.'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {data?.ai_hei_matching_status === 'pending'
              ? 'HEI matching triggers once problem technical requirements are fully analyzed.'
              : 'Institutional capability database will be expanded in upcoming state onboarding cycles.'}
          </p>
        </div>
      )}

      {/* Top 5 Recommended HEIs List */}
      {!loading && !error && data?.matches && data.matches.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Ranked Recommendations (Top {data.matches.length})</span>
            <span>Evaluation: Explainable Multi-Factor (100 pts)</span>
          </div>

          {data.matches.map((hei, index) => {
            const isExpanded = !!expandedHEI[hei.hei_id]
            const relatedInterests = (data.recorded_interests || []).filter(
              (i) => i.hei_id === hei.hei_id
            )
            const isUserOwn = isOwnHEI(hei)

            return (
              <div
                key={hei.hei_id}
                className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-[#a9d9d9] hover:shadow-md"
              >
                {/* Main Card Row */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left Column: Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#12365a] text-xs font-bold text-white">
                        #{index + 1}
                      </span>
                      <h4 className="font-[Manrope] text-base font-bold text-[#13243b]">
                        {hei.hei_name}
                      </h4>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${getRecommendationBadge(
                          hei.recommendation_level
                        )}`}
                      >
                        {hei.recommendation_level} Fit
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        {hei.verification_status === 'verified' ? 'Verified' : 'Demo Profile · Unverified'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-[#187e8d]" />
                        {hei.district}, {hei.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 size={13} className="text-[#187e8d]" />
                        {hei.institution_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-[#187e8d]" />
                        Confidence: {Math.round(hei.confidence * 100)}%
                      </span>
                    </div>

                    {/* Matched & Missing Capabilities Chips Preview */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hei.matched_capabilities.matched_skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200"
                        >
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                      {hei.matched_capabilities.matched_domains.slice(0, 2).map((dom) => (
                        <span
                          key={dom}
                          className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200"
                        >
                          <Layers size={11} className="text-teal-600" />
                          {dom}
                        </span>
                      ))}
                      {hei.missing_capabilities.missing_skills.length > 0 && (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          +{hei.missing_capabilities.missing_skills.length} missing skill(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Match Score Circular & Action */}
                  <div className="flex shrink-0 items-center justify-between gap-4 md:flex-col md:items-end">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 md:justify-end">
                        <span className={`text-2xl font-black ${getScoreColor(hei.match_score)}`}>
                          {Math.round(hei.match_score)}%
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">Match Score</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Weighted Rubric (0–100)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Government & Admin Recommendation Action */}
                      {isGovOrAdmin && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(hei)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#187e8d]"
                        >
                          <Award size={13} />
                          Recommend
                        </button>
                      )}

                      {/* HEI Representative Self-Interest Action */}
                      {isHEI && isUserOwn && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(hei)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-emerald-800"
                        >
                          <Send size={13} />
                          Express Interest
                        </button>
                      )}

                      {/* Expand / Collapse Details Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(hei.hei_id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? (
                          <>
                            Less <ChevronUp size={13} />
                          </>
                        ) : (
                          <>
                            Details <ChevronDown size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recorded Recommendations / Expressions of Interest Banner */}
                {relatedInterests.length > 0 && (
                  <div className="mt-3 space-y-1.5 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
                    <div className="flex items-center gap-1.5 font-semibold text-[#12365a]">
                      <MessageSquare size={13} />
                      <span>Official Activity ({relatedInterests.length}):</span>
                    </div>
                    {relatedInterests.map((act) => (
                      <div key={act.id || act.created_at} className="pl-4 text-[11px] text-slate-700">
                        • <strong className="font-semibold">{act.actor_name}</strong> ({act.actor_role}):{' '}
                        <em>"{act.remarks}"</em>{' '}
                        <span className="text-slate-400">
                          ({new Date(act.created_at).toLocaleDateString('en-IN')})
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Expanded Capability & Factor Breakdown Section */}
                {isExpanded && (
                  <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-700 animate-fadeIn">
                    {/* 6-Factor Score Breakdown */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <h5 className="font-[Manrope] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Weighted Factor Breakdown (Total: {hei.match_score}/100)
                      </h5>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Skills (30%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.skills} / 30</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Domains (25%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.technical_domains} / 25</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Equipment (15%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.equipment} / 15</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Software (10%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.software} / 10</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Proximity (10%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.location} / 10</p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-200/70 text-center">
                          <p className="text-[10px] text-slate-400">Complexity (10%)</p>
                          <p className="font-bold text-slate-800">{hei.factor_scores.complexity} / 10</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Matched & Missing Chips */}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                        <h6 className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Matched Capabilities
                        </h6>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {hei.matched_capabilities.matched_skills.map((s) => (
                            <span key={s} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                              {s}
                            </span>
                          ))}
                          {hei.matched_capabilities.matched_domains.map((d) => (
                            <span key={d} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-teal-800 border border-teal-200">
                              {d}
                            </span>
                          ))}
                          {hei.matched_capabilities.matched_equipment.map((e) => (
                            <span key={e} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                              {e}
                            </span>
                          ))}
                          {hei.matched_capabilities.matched_software.map((s) => (
                            <span key={s} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                        <h6 className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Wrench size={13} className="text-slate-500" />
                          Gaps / Missing Capabilities
                        </h6>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {hei.missing_capabilities.missing_skills.length === 0 &&
                          hei.missing_capabilities.missing_domains.length === 0 &&
                          hei.missing_capabilities.missing_equipment.length === 0 ? (
                            <span className="text-[11px] text-emerald-700">All required capabilities covered!</span>
                          ) : (
                            <>
                              {hei.missing_capabilities.missing_skills.map((s) => (
                                <span key={s} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-amber-800 border border-amber-200">
                                  {s}
                                </span>
                              ))}
                              {hei.missing_capabilities.missing_domains.map((d) => (
                                <span key={d} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                                  {d}
                                </span>
                              ))}
                              {hei.missing_capabilities.missing_equipment.map((e) => (
                                <span key={e} className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                                  {e}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rationale & Explainability */}
                    <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3">
                      <h6 className="font-bold text-slate-800">Explainable Recommendation Rationale:</h6>
                      <ul className="mt-1.5 space-y-1 text-[11px] text-slate-600">
                        {hei.reasons.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#187e8d]">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action Dialog / Modal */}
      {activeModalHEI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#12365a] text-white">
                  {isGovOrAdmin ? <Award size={18} /> : <Send size={18} />}
                </div>
                <div>
                  <h3 className="font-[Manrope] font-bold text-[#13243b]">
                    {isGovOrAdmin ? 'Record Official Recommendation' : 'Express Institutional Interest'}
                  </h3>
                  <p className="text-xs text-slate-500">{activeModalHEI.hei_name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseActionModal}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitInterest} className="mt-4 space-y-4">
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  {isGovOrAdmin ? 'Official Recommendation Remarks *' : 'Institutional Proposal / Remarks *'}
                </label>
                <textarea
                  rows={4}
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="Enter remarks explaining rationale, funding, or laboratory readiness..."
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
                Notice: This action registers an advisory recommendation in the state audit logs.
                It does not create a binding contractual assignment or project approval.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  disabled={submitting}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !remarksText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#187e8d] disabled:opacity-50"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  {isGovOrAdmin ? 'Save Recommendation' : 'Submit Interest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
