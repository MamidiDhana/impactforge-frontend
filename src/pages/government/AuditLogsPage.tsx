import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  History,
  RotateCw,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Handshake,
  Tag,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { SearchInput } from '../../components/forms/SearchInput'
import { EmptyState } from '../../components/common/EmptyState'
import { getAuditLogs, type BackendAuditLog } from '../../services/reportService'

export function AuditLogsPage() {
  const [logs, setLogs] = useState<BackendAuditLog[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [selectedLog, setSelectedLog] = useState<BackendAuditLog | null>(null)

  // Fetch live audit logs from backend database
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAuditLogs()
      setLogs(data)
      setLastRefreshed(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch live audit logs.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Helper to parse metadata_json safely
  const parseMetadata = (raw?: string | null): Record<string, unknown> => {
    if (!raw) return {}
    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return { raw }
    }
  }

  // Format date-time
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    } catch {
      return isoString
    }
  }

  // Action badge and human-friendly label
  const getActionInfo = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes('citizen_problem_submitted')) {
      return {
        label: 'Citizen Problem Reported',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: FileText,
      }
    }
    if (act.includes('hei_recommendation') || act.includes('hei_interest')) {
      return {
        label: 'HEI Recommendation Sent',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: GraduationCap,
      }
    }
    if (act.includes('status_updated') || act.includes('status_changed')) {
      return {
        label: 'Status Changed',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      }
    }
    if (act.includes('assigned')) {
      return {
        label: 'Problem Assigned',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        icon: User,
      }
    }
    if (act.includes('remarks')) {
      return {
        label: 'Official Remarks',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Tag,
      }
    }
    if (act.includes('rematch') || act.includes('ai_')) {
      return {
        label: 'AI Rematching Engine',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        icon: Sparkles,
      }
    }
    if (act.includes('partner')) {
      return {
        label: 'Partner Collaboration',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: Handshake,
      }
    }
    return {
      label: action.replace(/_/g, ' '),
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: History,
    }
  }

  // Filtered and searched logs
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const meta = parseMetadata(item.metadata_json)
      const metaStr = JSON.stringify(meta).toLowerCase()
      const searchTarget = `${item.actor_email || ''} ${item.action} ${item.entity_type} ${item.entity_id || ''} ${metaStr}`.toLowerCase()

      const matchesSearch = !search || searchTarget.includes(search.toLowerCase())

      let matchesFilter = true
      const act = item.action.toLowerCase()
      if (actionFilter === 'citizen') {
        matchesFilter = act.includes('citizen_problem_submitted')
      } else if (actionFilter === 'hei') {
        matchesFilter = act.includes('hei')
      } else if (actionFilter === 'governance') {
        matchesFilter = act.includes('status') || act.includes('assign') || act.includes('remarks')
      } else if (actionFilter === 'ai') {
        matchesFilter = act.includes('rematch') || act.includes('ai') || act.includes('duplicate')
      } else if (actionFilter === 'partner') {
        matchesFilter = act.includes('partner')
      }

      return matchesSearch && matchesFilter
    })
  }, [logs, search, actionFilter])

  return (
    <GovernmentLayout title="Audit Logs">
      <GovPage
        title="Audit Logs"
        description="Immutable real-time audit ledger recording citizen problem submissions, government actions, HEI recommendations, and system events."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Audit Logs' },
        ]}
      >
        {/* Live Status & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]">
              <History size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#13243b]">Live System Activity</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Database Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {logs.length} events logged in PostgreSQL ledger · Last fetched at{' '}
                {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RotateCw size={13} className={loading ? 'animate-spin text-[#187e8d]' : ''} />
            Refresh Logs
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-md">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by user, action, Track ID, or keywords..."
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'citizen', label: 'Citizen Submissions' },
              { id: 'hei', label: 'HEI Recommendations' },
              { id: 'governance', label: 'Governance Actions' },
              { id: 'ai', label: 'AI System Events' },
              { id: 'partner', label: 'Partner Actions' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  actionFilter === f.id
                    ? 'bg-[#12365a] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Table */}
        {loading && logs.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16">
            <Loader2 className="animate-spin text-[#187e8d]" size={32} />
            <p className="mt-3 text-sm font-semibold text-slate-700">Loading live audit events...</p>
            <p className="text-xs text-slate-400">Retrieving system ledger from PostgreSQL database</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3.5 pl-4">Timestamp</th>
                    <th className="p-3.5">Actor / User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Entity / Track ID</th>
                    <th className="p-3.5">Event Details</th>
                    <th className="p-3.5 pr-4 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((item) => {
                    const actionInfo = getActionInfo(item.action)
                    const ActionIcon = actionInfo.icon
                    const meta = parseMetadata(item.metadata_json)

                    // Extract readable details
                    const problemTitle = meta.problem_title as string | undefined
                    const actorName = (meta.actor_name as string) || item.actor_email || 'System'
                    const actorRole = (meta.actor_role as string) || (item.actor_email?.includes('gov') ? 'government' : 'citizen')
                    const heiName = (meta.hei_name as string) || undefined
                    const prevStatus = meta.previous_status as string | undefined
                    const newStatus = meta.new_status as string | undefined
                    const remarks = (meta.remarks as string) || (meta.notes as string) || undefined

                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50/70">
                        {/* Timestamp */}
                        <td className="p-3.5 pl-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400 shrink-0" />
                            <span>{formatDateTime(item.created_at)}</span>
                          </div>
                        </td>

                        {/* Actor / User */}
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-[#13243b]">
                              {actorName}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold capitalize text-slate-600">
                                {actorRole}
                              </span>
                              {item.actor_email && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                                  {item.actor_email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${actionInfo.badge}`}
                          >
                            <ActionIcon size={12} />
                            {actionInfo.label}
                          </span>
                        </td>

                        {/* Entity / Track ID */}
                        <td className="p-3.5 whitespace-nowrap">
                          {item.entity_id ? (
                            <span className="font-mono text-xs font-bold text-[#187e8d] bg-[#e8f5f5] px-2 py-0.5 rounded">
                              {item.entity_id}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 capitalize">{item.entity_type}</span>
                          )}
                        </td>

                        {/* Event Details */}
                        <td className="p-3.5 text-xs text-slate-600 max-w-xs">
                          {problemTitle && (
                            <p className="font-medium text-[#13243b] line-clamp-1">
                              {problemTitle}
                            </p>
                          )}
                          {heiName && (
                            <p className="text-purple-800 font-medium">
                              University: {heiName}
                            </p>
                          )}
                          {prevStatus && newStatus && (
                            <p className="flex items-center gap-1 text-slate-600 font-medium">
                              <span>{prevStatus}</span>
                              <ArrowRight size={10} className="text-slate-400" />
                              <span className="text-emerald-700 font-semibold">{newStatus}</span>
                            </p>
                          )}
                          {remarks && (
                            <p className="text-slate-500 italic truncate max-w-[240px]">
                              "{remarks}"
                            </p>
                          )}
                          {!problemTitle && !heiName && !prevStatus && !remarks && (
                            <span className="text-slate-400">Action recorded for {item.entity_type}</span>
                          )}
                        </td>

                        {/* View Payload Modal Button */}
                        <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(item)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#187e8d]"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {filteredLogs.length} of {logs.length} live audit records</span>
              <span className="font-mono">Ledger: PostgreSQL audit_logs table</span>
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Search}
              title="No audit events matched your search"
              description="Try changing the filter or clearing the search query."
            />
          </div>
        )}

        {/* Modal: Complete Audit Event Inspector */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 pr-8">
                <span className="grid size-10 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]">
                  <Shield size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Audit Record #{selectedLog.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded at {formatDateTime(selectedLog.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Action Type</span>
                    <strong className="text-slate-800 text-xs font-mono">{selectedLog.action}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Entity ID</span>
                    <strong className="text-[#187e8d] text-xs font-mono">
                      {selectedLog.entity_id || selectedLog.entity_type}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Actor Email</span>
                    <span className="text-slate-700 text-xs">{selectedLog.actor_email || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold text-[10px]">Actor User ID</span>
                    <span className="text-slate-700 text-xs font-mono">
                      {selectedLog.actor_user_id ?? 'Anonymous / System'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700 mb-1">Parsed Metadata Payload</h4>
                  <pre className="max-h-60 overflow-y-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                    {JSON.stringify(parseMetadata(selectedLog.metadata_json), null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-xl bg-[#12365a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#187e8d]"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}