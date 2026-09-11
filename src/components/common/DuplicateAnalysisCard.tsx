import React, { useEffect, useState } from 'react'
import {
  CopyCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Loader2,
  ShieldAlert,
  MapPin,
  Tag,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  DuplicateCandidate,
  DuplicateAnalysisResponse,
} from '../../services/reportService'
import {
  getDuplicateAnalysis,
  submitDuplicateReview,
} from '../../services/reportService'

interface DuplicateAnalysisCardProps {
  report: BackendReportResponse
  token?: string
  onReviewSubmitted?: () => void
}

export const DuplicateAnalysisCard: React.FC<DuplicateAnalysisCardProps> = ({
  report,
  token: propToken,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DuplicateAnalysisResponse | null>(null)

  // State for remarks and active submission per candidate track ID
  const [remarks, setRemarks] = useState<Record<string, string>>({})
  const [submittingTrackId, setSubmittingTrackId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Duplicate analysis is strictly for Government and Admin users
  const isAuthorized = currentUser?.role === 'government' || currentUser?.role === 'admin'

  // Retrieve token from props or storage if available
  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  useEffect(() => {
    if (!isAuthorized || !report?.track_id) {
      setLoading(false)
      return
    }

    // If report already has duplicate candidates embedded from backend response
    if (report.ai_duplicate_candidates && report.ai_duplicate_candidates.length > 0) {
      setAnalysis({
        track_id: report.track_id,
        ai_duplicate_status: report.ai_duplicate_status || 'completed',
        ai_duplicate_model: report.ai_duplicate_model || null,
        ai_duplicate_analyzed_at: report.ai_duplicate_analyzed_at || null,
        total_candidates: report.ai_duplicate_candidates.length,
        candidates: report.ai_duplicate_candidates,
      })
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    getDuplicateAnalysis(report.track_id, effectiveToken)
      .then((data) => {
        if (isMounted) {
          setAnalysis(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unable to load duplicate analysis.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [report.track_id, report.ai_duplicate_candidates, report.ai_duplicate_status, report.ai_duplicate_model, report.ai_duplicate_analyzed_at, isAuthorized, effectiveToken])

  if (!isAuthorized) {
    return null
  }

  const handleReview = async (
    candidateTrackId: string,
    decision: 'confirm_duplicate' | 'not_duplicate' | 'needs_review'
  ) => {
    const officialRemark = remarks[candidateTrackId]?.trim()
    if (!officialRemark) {
      alert('Please enter official remarks before submitting your decision.')
      return
    }

    setSubmittingTrackId(candidateTrackId)
    setSuccessMessage(null)

    try {
      const updated = await submitDuplicateReview(
        report.track_id,
        {
          candidate_track_id: candidateTrackId,
          decision,
          official_remarks: officialRemark,
        },
        effectiveToken
      )

      setAnalysis(updated)
      setSuccessMessage(`Review recorded: Candidate marked as "${decision.replace('_', ' ')}".`)
      setRemarks((prev) => ({ ...prev, [candidateTrackId]: '' }))
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to record official review.')
    } finally {
      setSubmittingTrackId(null)
    }
  }

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'confirmed_duplicate_candidate':
        return {
          label: 'Confirmed Duplicate Candidate',
          className: 'bg-rose-500/10 text-rose-600 border border-rose-500/30 dark:text-rose-400',
          icon: <ShieldAlert size={12} className="inline mr-1" />,
        }
      case 'likely_duplicate':
        return {
          label: 'Likely Duplicate',
          className: 'bg-orange-500/10 text-orange-600 border border-orange-500/30 dark:text-orange-400',
          icon: <AlertTriangle size={12} className="inline mr-1" />,
        }
      case 'possible_duplicate':
        return {
          label: 'Possible Duplicate',
          className: 'bg-amber-500/10 text-amber-700 border border-amber-500/30 dark:text-amber-400',
          icon: <HelpCircle size={12} className="inline mr-1" />,
        }
      default:
        return {
          label: 'Not Duplicate',
          className: 'bg-slate-500/10 text-slate-600 border border-slate-500/30 dark:text-slate-400',
          icon: <CheckCircle2 size={12} className="inline mr-1" />,
        }
    }
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'confirm_duplicate':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-200">
            <CheckCircle2 size={12} /> Confirmed Duplicate
          </span>
        )
      case 'not_duplicate':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} /> Not a Duplicate
          </span>
        )
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
            <HelpCircle size={12} /> Needs Further Review
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-blue-50/30 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-sm">
            <CopyCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Official Duplicate Analysis
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                Official Review Only
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Assists Government Officials and Super Admins in detecting and certifying duplicate civic reports.
            </p>
          </div>
        </div>

        {analysis?.ai_duplicate_model && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Sparkles size={12} className="text-indigo-600" />
            <span className="font-mono text-slate-600">{analysis.ai_duplicate_model}</span>
          </div>
        )}
      </div>

      {/* Mandatory Human Decision Warning */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Human Decision Workflow: </span>
          <span>AI identifies possible duplicates. Only an authorized official can make the final decision. Submitting a review never automatically merges, resolves, or deletes reports.</span>
        </div>
      </div>

      {/* Feedback Toast */}
      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
          <Loader2 size={16} className="animate-spin text-indigo-600" />
          <span>Loading official duplicate candidates...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          <p className="font-semibold">Unable to fetch duplicate analysis</p>
          <p className="mt-0.5 text-[11px] text-rose-600">{error}</p>
        </div>
      )}

      {/* Candidates List */}
      {!loading && !error && analysis && (
        <>
          {analysis.candidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="font-semibold text-slate-700">No duplicate candidates detected</p>
              <p className="mt-1 text-slate-500">
                This civic issue has no overlapping reports in this jurisdiction.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Evaluated Candidates ({analysis.candidates.length})</span>
                <span className="text-[11px]">Sorted by similarity</span>
              </div>

              {analysis.candidates.map((cand: DuplicateCandidate) => {
                const badge = getClassificationBadge(cand.duplicate_classification)
                const isSubmitting = submittingTrackId === cand.matching_track_id
                const reviewRemark = remarks[cand.matching_track_id] || ''

                return (
                  <div
                    key={cand.matching_track_id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 transition hover:border-indigo-200"
                  >
                    {/* Candidate Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cand.matching_track_id}
                        </span>
                        <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>

                      {/* Similarity Percentage Pill */}
                      <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                        {Math.round(cand.similarity_score * 100)}% match
                      </span>
                    </div>

                    {/* Candidate Title & Category */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">
                        {cand.title || 'Untitled Report'}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        {cand.category && (
                          <span className="flex items-center gap-1">
                            <Tag size={12} className="text-slate-400" />
                            {cand.category}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {cand.district_location}
                        </span>
                        {cand.created_date && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            Reported {cand.created_date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Candidate Metadata Status/Priority */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-[11px] font-medium text-slate-500">Existing Status:</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                        {cand.current_status}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 ml-2">Priority:</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                        {cand.current_priority}
                      </span>
                    </div>

                    {/* Explainable Reasons */}
                    {cand.reasons.length > 0 && (
                      <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                        <p className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                          Duplicate Rationale:
                        </p>
                        <ul className="space-y-1">
                          {cand.reasons.map((r: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Existing Official Review (if reviewed previously) */}
                    {cand.official_review && (
                      <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-900">Official Decision Recorded:</span>
                          {getDecisionBadge(cand.official_review.decision)}
                        </div>
                        <p className="text-slate-700 text-[11px] italic">
                          "{cand.official_review.official_remarks}"
                        </p>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-indigo-100">
                          <span>Reviewed by: {cand.official_review.reviewed_by_email} ({cand.official_review.reviewed_by_role})</span>
                          <span>{new Date(cand.official_review.reviewed_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}

                    {/* Official Review Controls */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Official Review Decision:
                        </label>
                        {isSubmitting && (
                          <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                            <Loader2 size={12} className="animate-spin" /> Recording decision...
                          </span>
                        )}
                      </div>

                      <textarea
                        value={reviewRemark}
                        onChange={(e) =>
                          setRemarks((prev) => ({
                            ...prev,
                            [cand.matching_track_id]: e.target.value,
                          }))
                        }
                        placeholder="Enter official review remarks (required before submitting decision)..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleReview(cand.matching_track_id, 'confirm_duplicate')}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition"
                        >
                          <CheckCircle2 size={13} /> Confirm Duplicate
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleReview(cand.matching_track_id, 'not_duplicate')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          <CheckCircle2 size={13} /> Not a Duplicate
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleReview(cand.matching_track_id, 'needs_review')}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 transition"
                        >
                          <HelpCircle size={13} /> Needs Review
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
