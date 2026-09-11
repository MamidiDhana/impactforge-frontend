import React, { useEffect, useState } from 'react'
import {
  UserCheck,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Send,
  AlertTriangle,
  BookOpen,
  Briefcase,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  FacultyMatchingResponse,
  FacultyRecommendationMatch,
} from '../../services/reportService'
import { getFacultyMatches, submitFacultyInterest } from '../../services/reportService'

interface FacultyMatchingCardProps {
  report?: BackendReportResponse | null
  facultyData?: FacultyMatchingResponse | null
  token?: string
  onInterestSubmitted?: () => void
}

export const FacultyMatchingCard: React.FC<FacultyMatchingCardProps> = ({
  report,
  facultyData,
  token: propToken,
  onInterestSubmitted,
}) => {
  const { currentUser } = useAuth()
  const [data, setData] = useState<FacultyMatchingResponse | null>(facultyData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedFac, setExpandedFac] = useState<Record<string, boolean>>({})

  // Modal / Remarks state
  const [activeModalFac, setActiveModalFac] = useState<FacultyRecommendationMatch | null>(null)
  const [remarksText, setRemarksText] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const trackId = report?.track_id || facultyData?.track_id

  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  const role = currentUser?.role || 'citizen'
  const isGovOrAdmin = role === 'government' || role === 'admin'
  const isHEI = role === 'hei'
  const isFaculty = role === 'faculty'

  useEffect(() => {
    if (facultyData) {
      setData(facultyData)
      return
    }

    if (trackId) {
      let isMounted = true
      setLoading(true)
      setError(null)

      getFacultyMatches(trackId, effectiveToken)
        .then((res) => {
          if (isMounted) {
            setData(res)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            const msg = err instanceof Error ? err.message : 'Unable to load faculty recommendations.'
            setError(msg)
            setLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    }
  }, [trackId, facultyData, effectiveToken])

  if (!trackId || role === 'partner') {
    return null
  }

  const toggleExpand = (facultyId: string) => {
    setExpandedFac((prev) => ({ ...prev, [facultyId]: !prev[facultyId] }))
  }

  const handleOpenActionModal = (fac: FacultyRecommendationMatch) => {
    setActiveModalFac(fac)
    if (isGovOrAdmin) {
      setRemarksText(`Official recommendation: Nominate ${fac.name} for technical advisement on problem ${trackId}.`)
    } else if (isHEI) {
      setRemarksText(`Institutional endorsement: ${fac.name} is endorsed by ${fac.institution_name} for this civic initiative.`)
    } else if (isFaculty) {
      setRemarksText(`Faculty interest: I am available to provide technical mentorship and domain oversight for this challenge.`)
    } else {
      setRemarksText('')
    }
    setActionError(null)
  }

  const handleCloseModal = () => {
    setActiveModalFac(null)
    setRemarksText('')
    setActionError(null)
  }

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalFac || !trackId || !remarksText.trim()) return

    setSubmitting(true)
    setActionError(null)

    try {
      await submitFacultyInterest(
        trackId,
        {
          faculty_id: activeModalFac.faculty_id,
          remarks: remarksText.trim(),
        },
        effectiveToken
      )

      setActionSuccess(`Action successfully recorded for ${activeModalFac.name}.`)
      handleCloseModal()

      // Refresh data
      const refreshed = await getFacultyMatches(trackId, effectiveToken)
      setData(refreshed)
      if (onInterestSubmitted) onInterestSubmitted()

      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record faculty action.'
      setActionError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const getLevelBadge = (level: string) => {
    const l = level.toLowerCase()
    if (l === 'excellent') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20'
    }
    if (l === 'strong') {
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20'
    }
    if (l === 'moderate') {
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20'
    }
    return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10'
  }

  const getAvailabilityBadge = (avail: string) => {
    const a = avail.toLowerCase()
    if (a === 'available') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (a === 'limited') {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }

  const isEligibleToExpressInterest = (fac: FacultyRecommendationMatch): boolean => {
    if (isGovOrAdmin) return true
    if (isHEI) {
      const userOrg = (currentUser?.organization || '').toLowerCase()
      const facInst = fac.institution_id.toLowerCase()
      const facInstName = fac.institution_name.toLowerCase()
      return userOrg.includes(facInst) || facInst.includes(userOrg) || facInstName.includes(userOrg)
    }
    if (isFaculty) {
      const userEmail = (currentUser?.email || '').toLowerCase()
      const userName = (currentUser?.name || '').toLowerCase()
      const facName = fac.name.toLowerCase()
      return userEmail.includes('alok') || userName.includes(facName) || facName.includes(userName)
    }

    return false
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/80 text-blue-700">
              <UserCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  AI Faculty & Mentor Matching
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                  <Sparkles size={11} />
                  Phase 1 Part 7
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent 5-factor academic matching connecting civic challenges with expert faculty mentors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {data.matches.length} Recommended {data.matches.length === 1 ? 'Expert' : 'Experts'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Advisory Disclaimer Banner */}
      <div className="border-b border-amber-200 bg-amber-50/70 px-6 py-2.5">
        <div className="flex items-start gap-2 text-xs text-amber-900">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-700" />
          <p className="leading-snug">
            <strong>Advisory Notice:</strong> AI recommendations are advisory only. Academic collaboration requires
            official administrative approval and institutional consent. No automated team assignment or status changes are applied.
          </p>
        </div>
      </div>

      {/* Action Feedback Alerts */}
      {actionSuccess && (
        <div className="m-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="p-6 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
            <Loader2 size={24} className="animate-spin text-blue-600 mb-2" />
            <p className="text-xs font-medium">Evaluating faculty capability profiles and workload...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Matching status unavailable</p>
            <p className="mt-0.5 text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && data && data.matches.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            <UserCheck size={28} className="mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">No faculty profiles matched</p>
            <p className="mt-1 text-slate-500">
              Capability requirements are currently pending extraction or require manual review.
            </p>
          </div>
        )}

        {/* Faculty Recommendations List */}
        {!loading && data && data.matches.length > 0 && (
          <div className="space-y-4">
            {data.matches.map((fac) => {
              const isExpanded = !!expandedFac[fac.faculty_id]
              const eligible = isEligibleToExpressInterest(fac)

              return (
                <div
                  key={fac.faculty_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300"
                >
                  {/* Top Row: Name, Score, Badges */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{fac.name}</h4>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${getLevelBadge(
                            fac.recommendation_level
                          )}`}
                        >
                          {fac.recommendation_level.toUpperCase()} MATCH
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getAvailabilityBadge(
                            fac.availability
                          )}`}
                        >
                          {fac.availability.charAt(0).toUpperCase() + fac.availability.slice(1)}
                        </span>
                        {fac.verification_status === 'unverified' && (
                          <span className="rounded-md bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600">
                            Demo Profile (Unverified)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building2 size={13} className="text-blue-600" />
                          {fac.institution_name}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <BookOpen size={13} className="text-slate-400" />
                          {fac.department}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} className="text-slate-400" />
                          {fac.district}, {fac.state}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Briefcase size={13} className="text-slate-400" />
                          {fac.current_workload} Active {fac.current_workload === 1 ? 'Project' : 'Projects'}
                        </span>
                      </div>
                    </div>

                    {/* Circular Match Score */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 border-2 border-blue-600 text-xs font-black text-blue-700 shadow-sm">
                          {Math.round(fac.match_score)}%
                        </div>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factor Breakdown Chips (Skills 35%, Domains 25%, Experience 15%, Availability 15%, Location 10%) */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5 text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Skills (35%)</span>
                      <strong className="text-slate-800">{fac.factor_scores.skills.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Domains (25%)</span>
                      <strong className="text-slate-800">{fac.factor_scores.technical_domains.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Experience (15%)</span>
                      <strong className="text-slate-800">{fac.factor_scores.relevant_experience.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Workload (15%)</span>
                      <strong className="text-slate-800">{fac.factor_scores.availability_workload.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Location (10%)</span>
                      <strong className="text-slate-800">{fac.factor_scores.location_hei_relevance.toFixed(1)} pts</strong>
                    </div>
                  </div>

                  {/* Matched vs Missing Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {fac.matched_skills.map((s, idx) => (
                      <span
                        key={`m-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                      >
                        <CheckCircle2 size={11} />
                        {s}
                      </span>
                    ))}
                    {fac.missing_skills.map((s, idx) => (
                      <span
                        key={`mis-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        <AlertCircle size={11} className="text-slate-400" />
                        Missing: {s}
                      </span>
                    ))}
                  </div>

                  {/* Research Expertise Highlights */}
                  {fac.research_expertise && fac.research_expertise.length > 0 && (
                    <div className="mt-2.5 text-xs text-slate-600 bg-blue-50/40 rounded-lg p-2.5 border border-blue-100/60">
                      <strong className="text-blue-900 block text-[11px] font-semibold mb-1">
                        Active Research Specializations:
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {fac.research_expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-white border border-blue-200/70 px-2 py-0.5 text-[10.5px] text-blue-800"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expandable Rationale Bullets */}
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700 animate-in fade-in duration-150">
                      <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                        Matching Rationale & Factor Evidence
                      </h5>
                      <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11.5px]">
                        {fac.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(fac.faculty_id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Hide Details</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>View Factor Rationale</span>
                        </>
                      )}
                    </button>

                    {/* Role-based action button */}
                    {eligible && (
                      <button
                        type="button"
                        onClick={() => handleOpenActionModal(fac)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition active:scale-95"
                      >
                        <MessageSquare size={13} />
                        <span>
                          {isGovOrAdmin
                            ? 'Officially Recommend Faculty'
                            : isHEI
                            ? 'Endorse Faculty Member'
                            : 'Express Availability / Interest'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Prior Recorded Interest History */}
        {!loading && data && data.recorded_interests && data.recorded_interests.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <ShieldCheck size={14} className="text-blue-700" />
              <span>Official Faculty Recommendations & Recorded Endorsements ({data.recorded_interests.length})</span>
            </h4>
            <div className="space-y-2">
              {data.recorded_interests.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xs space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{rec.faculty_name}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rec.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11.5px] italic">"{rec.remarks}"</p>
                  <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
                    <span>Recorded by: <strong>{rec.actor_name}</strong> ({rec.actor_role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {activeModalFac && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal()
          }}
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isGovOrAdmin
                    ? 'Record Official Faculty Recommendation'
                    : isHEI
                    ? 'Endorse Institutional Faculty Member'
                    : 'Express Faculty Interest'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Report: <strong className="font-mono text-slate-700">{trackId}</strong> | Candidate: <strong>{activeModalFac.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitInterest} className="mt-4 space-y-4">
              <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3 text-xs text-blue-900 space-y-1">
                <p className="font-semibold">Candidate: {activeModalFac.name} ({activeModalFac.department})</p>
                <p className="text-[11px] text-blue-700">
                  Institution: {activeModalFac.institution_name} | Match Score: {Math.round(activeModalFac.match_score)}%
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Remarks / Terms of Endorsement
                </label>
                <textarea
                  rows={4}
                  required
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="State the rationale or proposed technical scope for this faculty member..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 shadow-inner focus:border-blue-500 focus:outline-none"
                />
              </div>

              {actionError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !remarksText.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Action</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
