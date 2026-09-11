import React, { useState, useEffect } from 'react'
import {
  RefreshCw,
  History,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { RematchingStatusBadge } from './RematchingStatusBadge'
import { RematchingHistoryTimeline } from './RematchingHistoryTimeline'
import {
  reportService,
  type RematchingStatusResponse,
  type RematchingHistoryResponse,
  type CitizenRematchingHistoryResponse,
} from '../../services/reportService'

interface DynamicRematchingCardProps {
  trackId: string
  rematchingStatus?: string | null
  rematchingVersion?: number | null
  lastRematchedAt?: string | null
  rematchingReason?: string | null
  userRole?: string
  onRematchSuccess?: () => void
  className?: string
}

export const DynamicRematchingCard: React.FC<DynamicRematchingCardProps> = ({
  trackId,
  rematchingStatus: initialStatus,
  rematchingVersion: initialVersion,
  lastRematchedAt: initialLastRematchedAt,
  rematchingReason: initialReason,
  userRole = 'citizen',
  onRematchSuccess,
  className = '',
}) => {
  const [statusData, setStatusData] = useState<RematchingStatusResponse | null>(null)
  const [historyEvents, setHistoryEvents] = useState<any[]>([])
  const [rematchingLoading, setRematchingLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const isOfficial = ['government', 'admin'].includes((userRole || '').toLowerCase())
  const isCitizen = (userRole || '').toLowerCase() === 'citizen'

  const fetchStatusAndHistory = async () => {
    if (!trackId) return
    setErrorMsg(null)
    try {
      const statusRes = await reportService.getRematchingStatus(trackId)
      setStatusData(statusRes)

      const historyRes = await reportService.getRematchingHistory(trackId)
      setHistoryEvents((historyRes as RematchingHistoryResponse | CitizenRematchingHistoryResponse).events || [])
    } catch (err: any) {
      // Don't show critical toast if user doesn't have permission; silent fallback
      console.warn('Note on dynamic rematching status load:', err?.message)
    }
  }

  useEffect(() => {
    fetchStatusAndHistory()
  }, [trackId])

  const handleManualRematch = async () => {
    if (!isOfficial) return
    setRematchingLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await reportService.triggerManualRematch(trackId, {
        reason: 'Administrative recalculation requested from report details',
      })
      if (res.success) {
        setSuccessMsg(`Dynamic re-matching completed successfully (v${res.version}).`)
        await fetchStatusAndHistory()
        if (onRematchSuccess) {
          onRematchSuccess()
        }
      } else {
        setErrorMsg(res.message || 'Failed to complete rematching.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error triggering dynamic rematching.')
    } finally {
      setRematchingLoading(false)
    }
  }

  const currentStatus = statusData?.ai_rematching_status || initialStatus || 'idle'
  const currentVersion = statusData?.ai_rematching_version || initialVersion || 1
  const lastRematched = statusData?.ai_last_rematched_at || initialLastRematchedAt
  const reason = statusData?.ai_rematching_reason || initialReason
  const latestEvent = statusData?.latest_event
  const diff = latestEvent?.diff_summary

  const formatTime = (iso?: string | null) => {
    if (!iso) return 'Not yet re-evaluated'
    try {
      const d = new Date(iso)
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <RefreshCw className={`size-4.5 ${rematchingLoading ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              AI Dynamic Re-Matching
              <span className="rounded bg-indigo-100/70 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                v{currentVersion}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Continuous recommendation synchronization based on project progress & partner activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RematchingStatusBadge status={currentStatus} version={currentVersion} />

          {/* Trigger Rematch Button (Gov & Admin only) */}
          {isOfficial && (
            <button
              type="button"
              disabled={rematchingLoading || currentStatus === 'running'}
              onClick={handleManualRematch}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              <RefreshCw className={`size-3.5 ${rematchingLoading ? 'animate-spin' : ''}`} />
              {rematchingLoading ? 'Re-evaluating...' : 'Trigger Re-Match'}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
          {errorMsg}
        </div>
      )}

      {/* Body: Metadata & Differential Summary */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50/80 p-3 text-xs dark:bg-slate-800/40">
          <div className="font-medium text-slate-500 dark:text-slate-400">Last Evaluated</div>
          <div className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatTime(lastRematched)}</div>
          {reason && (
            <p className="mt-1 text-[11px] text-slate-500 italic dark:text-slate-400">
              "{reason}"
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-50/80 p-3 text-xs dark:bg-slate-800/40">
          <div className="font-medium text-slate-500 dark:text-slate-400">Recommendation Status</div>
          <div className="mt-1 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
            <Sparkles className="size-3.5 text-amber-500" />
            {currentVersion > 1 ? `Synchronized with latest updates (v${currentVersion})` : 'Baseline initial match'}
          </div>
          {diff && !isCitizen && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
              {diff.total_added > 0 && <span className="font-bold text-emerald-600">+{diff.total_added} added</span>}
              {diff.total_changed > 0 && <span className="font-bold text-amber-600">• {diff.total_changed} updated</span>}
              {diff.total_removed > 0 && <span className="font-bold text-slate-500">• {diff.total_removed} removed</span>}
            </div>
          )}
        </div>
      </div>

      {/* Advisory Note */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50/70 p-2.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="leading-relaxed">
          AI dynamic re-matching is strictly advisory and does not alter report resolution status or automatically transfer funds.
        </p>
      </div>

      {/* History Toggle Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <History className="size-3.5" />
          {showHistory ? 'Hide Rematching History' : `View Rematching History (${historyEvents.length})`}
          {showHistory ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        <span className="text-[11px] text-slate-400">
          Audited & version-controlled
        </span>
      </div>

      {/* Collapsible Timeline */}
      {showHistory && (
        <div className="mt-4 pt-2">
          <RematchingHistoryTimeline
            events={historyEvents}
            isCitizenView={isCitizen}
          />
        </div>
      )}
    </div>
  )
}
