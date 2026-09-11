import React, { useEffect, useState } from 'react'
import {
  GraduationCap,
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
  Compass,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  StudentMatchingResponse,
  StudentRecommendationMatch,
} from '../../services/reportService'
import { getStudentMatches, submitStudentInterest } from '../../services/reportService'

interface StudentMatchingCardProps {
  report?: BackendReportResponse | null
  studentData?: StudentMatchingResponse | null
  token?: string
  onInterestSubmitted?: () => void
}

export const StudentMatchingCard: React.FC<StudentMatchingCardProps> = ({
  report,
  studentData,
  token: propToken,
  onInterestSubmitted,
}) => {
  const { currentUser } = useAuth()
  const [data, setData] = useState<StudentMatchingResponse | null>(studentData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedStu, setExpandedStu] = useState<Record<string, boolean>>({})

  // Modal / Remarks state
  const [activeModalStu, setActiveModalStu] = useState<StudentRecommendationMatch | null>(null)
  const [remarksText, setRemarksText] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const trackId = report?.track_id || studentData?.track_id

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
    if (studentData) {
      setData(studentData)
      return
    }

    if (trackId) {
      let isMounted = true
      setLoading(true)
      setError(null)

      getStudentMatches(trackId, effectiveToken)
        .then((res) => {
          if (isMounted) {
            setData(res)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            const msg = err instanceof Error ? err.message : 'Unable to load student recommendations.'
            setError(msg)
            setLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    }
  }, [trackId, studentData, effectiveToken])

  if (!trackId || role === 'partner') {
    return null
  }

  const toggleExpand = (studentId: string) => {
    setExpandedStu((prev) => ({ ...prev, [studentId]: !prev[studentId] }))
  }

  const handleOpenActionModal = (stu: StudentRecommendationMatch) => {
    setActiveModalStu(stu)
    if (isGovOrAdmin) {
      setRemarksText(`Official recommendation: Nominate student capstone team led by ${stu.name} for problem ${trackId}.`)
    } else if (isHEI) {
      setRemarksText(`Institutional endorsement: ${stu.name} is endorsed by ${stu.institution_name} for this student project.`)
    } else if (isFaculty) {
      setRemarksText(`Faculty mentorship endorsement: I agree to guide ${stu.name} on this civic innovation project.`)
    } else {
      setRemarksText('')
    }
    setActionError(null)
  }

  const handleCloseModal = () => {
    setActiveModalStu(null)
    setRemarksText('')
    setActionError(null)
  }

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalStu || !trackId || !remarksText.trim()) return

    setSubmitting(true)
    setActionError(null)

    try {
      await submitStudentInterest(
        trackId,
        {
          student_id: activeModalStu.student_id,
          remarks: remarksText.trim(),
        },
        effectiveToken
      )

      setActionSuccess(`Action successfully recorded for ${activeModalStu.name}.`)
      handleCloseModal()

      // Refresh data
      const refreshed = await getStudentMatches(trackId, effectiveToken)
      setData(refreshed)
      if (onInterestSubmitted) onInterestSubmitted()

      setTimeout(() => setActionSuccess(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record student action.'
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
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20'
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

  const isEligibleToExpressInterest = (stu: StudentRecommendationMatch): boolean => {
    if (isGovOrAdmin) return true
    if (isHEI) {
      const userOrg = (currentUser?.organization || '').toLowerCase()
      const stuInst = stu.institution_id.toLowerCase()
      const stuInstName = stu.institution_name.toLowerCase()
      return userOrg.includes(stuInst) || stuInst.includes(userOrg) || stuInstName.includes(userOrg)
    }
    if (isFaculty) {
      const userOrg = (currentUser?.organization || '').toLowerCase()
      const stuInst = stu.institution_id.toLowerCase()
      const stuInstName = stu.institution_name.toLowerCase()
      return userOrg.includes(stuInst) || stuInst.includes(userOrg) || stuInstName.includes(userOrg) || (currentUser?.email || '').includes('bitmesra')
    }
    return false
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100/80 text-indigo-700">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">
                  AI Student Project & Capstone Matching
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800">
                  <Sparkles size={11} />
                  Phase 1 Part 7
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent rubric prioritizing student competencies, academic interests, and course availability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {data && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {data.matches.length} Recommended {data.matches.length === 1 ? 'Student' : 'Students'}
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
            <strong>Advisory Notice:</strong> AI recommendations are advisory only. Student engagement requires
            faculty mentorship approval and institutional verification. No automated project teams or status modifications are performed.
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
            <Loader2 size={24} className="animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-medium">Evaluating student capability profiles and course workload...</p>
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
            <GraduationCap size={28} className="mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-700">No student candidates matched</p>
            <p className="mt-1 text-slate-500">
              Capability requirements are currently pending extraction or require manual review.
            </p>
          </div>
        )}

        {/* Student Recommendations List */}
        {!loading && data && data.matches.length > 0 && (
          <div className="space-y-4">
            {data.matches.map((stu) => {
              const isExpanded = !!expandedStu[stu.student_id]
              const eligible = isEligibleToExpressInterest(stu)

              return (
                <div
                  key={stu.student_id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300"
                >
                  {/* Top Row: Name, Score, Badges */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{stu.name}</h4>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${getLevelBadge(
                            stu.recommendation_level
                          )}`}
                        >
                          {stu.recommendation_level.toUpperCase()} MATCH
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getAvailabilityBadge(
                            stu.availability
                          )}`}
                        >
                          {stu.availability.charAt(0).toUpperCase() + stu.availability.slice(1)}
                        </span>
                        {stu.verification_status === 'unverified' && (
                          <span className="rounded-md bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-600">
                            Demo Profile (Unverified)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building2 size={13} className="text-indigo-600" />
                          {stu.institution_name}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <BookOpen size={13} className="text-slate-400" />
                          {stu.department}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} className="text-slate-400" />
                          {stu.district}, {stu.state}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Briefcase size={13} className="text-slate-400" />
                          {stu.current_workload} Active {stu.current_workload === 1 ? 'Project' : 'Projects'}
                        </span>
                      </div>
                    </div>

                    {/* Circular Match Score */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-600 text-xs font-black text-indigo-700 shadow-sm">
                          {Math.round(stu.match_score)}%
                        </div>
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Factor Breakdown Chips (Skills 30%, Domains 20%, Interests 20%, Workload 15%, Location 15%) */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5 text-[11px]">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Skills (30%)</span>
                      <strong className="text-slate-800">{stu.factor_scores.skills.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Domains (20%)</span>
                      <strong className="text-slate-800">{stu.factor_scores.technical_domains.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Interests (20%)</span>
                      <strong className="text-slate-800">{stu.factor_scores.student_interests.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Workload (15%)</span>
                      <strong className="text-slate-800">{stu.factor_scores.availability_workload.toFixed(1)} pts</strong>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Location (15%)</span>
                      <strong className="text-slate-800">{stu.factor_scores.location_hei_relevance.toFixed(1)} pts</strong>
                    </div>
                  </div>

                  {/* Matched vs Missing Skills */}
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    {stu.matched_skills.map((s, idx) => (
                      <span
                        key={`m-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                      >
                        <CheckCircle2 size={11} />
                        {s}
                      </span>
                    ))}
                    {stu.missing_skills.map((s, idx) => (
                      <span
                        key={`mis-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        <AlertCircle size={11} className="text-slate-400" />
                        Missing: {s}
                      </span>
                    ))}
                  </div>

                  {/* Student Academic Project Interests */}
                  {stu.interests && stu.interests.length > 0 && (
                    <div className="mt-2.5 text-xs text-slate-600 bg-indigo-50/40 rounded-lg p-2.5 border border-indigo-100/60">
                      <strong className="text-indigo-900 block text-[11px] font-semibold mb-1 flex items-center gap-1">
                        <Compass size={12} className="text-indigo-600" />
                        <span>Academic Interests & Project Focus Areas:</span>
                      </strong>
                      <div className="flex flex-wrap gap-1.5">
                        {stu.interests.map((it, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-white border border-indigo-200/70 px-2 py-0.5 text-[10.5px] text-indigo-800"
                          >
                            {it}
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
                        {stu.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div className="mt-3.5 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(stu.student_id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-800"
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
                        onClick={() => handleOpenActionModal(stu)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-800 transition active:scale-95"
                      >
                        <MessageSquare size={13} />
                        <span>
                          {isGovOrAdmin
                            ? 'Officially Recommend Student'
                            : isHEI
                            ? 'Endorse Student Project Team'
                            : 'Endorse Mentored Student'}
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
              <ShieldCheck size={14} className="text-indigo-700" />
              <span>Official Student Recommendations & Mentorship Endorsements ({data.recorded_interests.length})</span>
            </h4>
            <div className="space-y-2">
              {data.recorded_interests.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-xs space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{rec.student_name}</span>
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
      {activeModalStu && (
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
                    ? 'Record Official Student Recommendation'
                    : isHEI
                    ? 'Endorse Student Project Team'
                    : 'Endorse Mentored Student'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Report: <strong className="font-mono text-slate-700">{trackId}</strong> | Candidate: <strong>{activeModalStu.name}</strong>
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
              <div className="rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 text-xs text-indigo-900 space-y-1">
                <p className="font-semibold">Candidate: {activeModalStu.name} ({activeModalStu.department})</p>
                <p className="text-[11px] text-indigo-700">
                  Institution: {activeModalStu.institution_name} | Match Score: {Math.round(activeModalStu.match_score)}%
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Remarks / Mentorship Scope
                </label>
                <textarea
                  rows={4}
                  required
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  placeholder="State the proposed project or mentorship scope for this student team..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 shadow-inner focus:border-indigo-500 focus:outline-none"
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-800 disabled:opacity-60"
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
