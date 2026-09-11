import { useState, useEffect } from 'react'
import {
  CopyCheck,
  AlertCircle,
  MapPin,
  Tag,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import type {
  BackendReportResponse,
  SimilarProblemsResponse,
  SimilarProblemMatch,
} from '../../services/reportService'
import { getSimilarProblems } from '../../services/reportService'

interface SimilarProblemsCardProps {
  report?: BackendReportResponse | null
  similarityData?: SimilarProblemsResponse | null
  token?: string
  onSelectReport?: (trackId: string) => void
}

export function SimilarProblemsCard({
  report,
  similarityData,
  token,
  onSelectReport,
}: SimilarProblemsCardProps) {
  const [data, setData] = useState<SimilarProblemsResponse | null>(similarityData || null)
  const [loading, setLoading] = useState(false)

  const trackId = report?.track_id || similarityData?.track_id

  useEffect(() => {
    if (similarityData) {
      setData(similarityData)
      return
    }

    // If matches already embedded in report object
    if (report?.ai_similarity_matches && report.ai_similarity_matches.length > 0) {
      setData({
        track_id: report.track_id,
        status: report.ai_similarity_status || 'completed',
        matches: report.ai_similarity_matches,
        model: report.ai_similarity_model,
        analyzed_at: report.ai_similarity_analyzed_at,
        disclaimer: 'Possible similar reports found. Please review before taking action.',
      })
      return
    }

    // Otherwise fetch if trackId available
    if (trackId) {
      let isMounted = true
      setLoading(true)
      getSimilarProblems(trackId, token)
        .then((res) => {
          if (isMounted) setData(res)
        })
        .catch(() => {
          if (isMounted) {
            setData({
              track_id: trackId,
              status: 'no_matches',
              matches: [],
              disclaimer: 'Possible similar reports found. Please review before taking action.',
            })
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false)
        })
      return () => {
        isMounted = false
      }
    }
  }, [report, similarityData, trackId, token])

  const matches = data?.matches || []
  const hasMatches = matches.length > 0
  const status = (data?.status || report?.ai_similarity_status || 'no_matches').toLowerCase()

  const getLevelBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case 'probable duplicate':
        return {
          pill: 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-200',
          dot: 'bg-rose-500',
          label: 'Probable Duplicate',
        }
      case 'strong similarity':
        return {
          pill: 'bg-orange-100 text-orange-800 border-orange-300 ring-orange-200',
          dot: 'bg-orange-500',
          label: 'Strong Similarity',
        }
      case 'possible similarity':
      default:
        return {
          pill: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-200',
          dot: 'bg-amber-500',
          label: 'Possible Similarity',
        }
    }
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 ring-blue-200'
      case 'Rejected':
        return 'bg-slate-100 text-slate-600 ring-slate-200'
      case 'Open':
      default:
        return 'bg-amber-50 text-amber-700 ring-amber-200'
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50/50 p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <CopyCheck size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Similar Problems & Duplicate Detection
              </h3>
              {hasMatches && (
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-800 ring-1 ring-inset ring-indigo-300/60">
                  {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              AI vector similarity scan across civic problem registry in Jharkhand
            </p>
          </div>
        </div>

        {/* Advisory Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
          <AlertCircle size={13} className="text-amber-600" />
          <span>Possible similar reports found. Please review before taking action.</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Scanning database for similar reports...
        </div>
      ) : hasMatches ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-medium text-slate-600">
            The following reports in Jharkhand describe closely related or co-located civic grievances.
            Reviewing existing efforts avoids duplicated field assessments:
          </p>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white/90 shadow-xs">
            {matches.map((m: SimilarProblemMatch, idx: number) => {
              const style = getLevelBadgeStyle(m.similarity_level)
              const percent = Math.round(m.similarity_score * 100)

              return (
                <div
                  key={m.matching_track_id || idx}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50/60"
                >
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* Top line: Level badge + Percentage + Track ID */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
                        {percent}% Match
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#187e8d]">
                        {m.matching_track_id}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${getStatusBadge(m.status)}`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {/* Problem Title */}
                    <h4 className="font-semibold text-sm text-[#13243b] line-clamp-1">
                      {m.title}
                    </h4>

                    {/* Meta: Category and Location */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Tag size={12} className="text-slate-400" />
                        <span>{m.category}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{m.location || m.district}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {onSelectReport && (
                    <div className="shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => onSelectReport(m.matching_track_id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
                      >
                        <span>Inspect</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Advisory similarity detection — reports remain independent until verified by authorities.</span>
            </span>
            <span>Status: <strong className="capitalize text-slate-600">{status}</strong></span>
          </div>
        </div>
      ) : (
        /* Empty / No Matches State */
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white/70 p-5 text-center">
          <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
          <h4 className="mt-2 text-sm font-semibold text-slate-700">
            No Duplicate or Highly Similar Problems Detected
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            This appears to be a distinct civic issue in {report?.district || 'Jharkhand'}. No prior complaints reached the 55% similarity threshold.
          </p>
        </div>
      )}
    </div>
  )
}
