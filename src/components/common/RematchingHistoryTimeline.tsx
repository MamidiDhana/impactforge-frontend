import React, { useState } from 'react'
import {
  Clock,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import type {
  RematchingEventRecord,
  CitizenRematchingEventRecord,
} from '../../services/reportService'

interface RematchingHistoryTimelineProps {
  events: (RematchingEventRecord | CitizenRematchingEventRecord)[]
  isCitizenView?: boolean
  advisoryWarning?: string
  className?: string
}

export const RematchingHistoryTimeline: React.FC<RematchingHistoryTimelineProps> = ({
  events,
  isCitizenView = false,
  advisoryWarning,
  className = '',
}) => {
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedEventId(prev => (prev === id ? null : id))
  }

  const formatTimestamp = (iso?: string | null) => {
    if (!iso) return 'Recent'
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

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'manual_trigger':
        return 'Administrative Manual Review'
      case 'report_update_trigger':
        return 'Report Parameters Updated'
      case 'urgency_update_trigger':
        return 'Urgency / Priority Shift'
      case 'partner_support_update_trigger':
        return 'Partner Support Proposal'
      case 'hei_profile_trigger':
        return 'HEI Profile / Capacity Update'
      case 'faculty_profile_trigger':
        return 'Faculty / Student Availability Change'
      default:
        return trigger.replace(/_/g, ' ')
    }
  }

  if (!events || events.length === 0) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400 ${className}`}>
        <Clock className="mx-auto mb-2 size-8 text-slate-400" />
        <p className="text-sm font-medium">No re-matching events recorded yet.</p>
        <p className="mt-1 text-xs text-slate-400">
          When report parameters, academic profiles, or partner proposals change, historical matching updates will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Advisory Banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="leading-relaxed">
          {advisoryWarning ||
            'AI dynamic re-matching is strictly advisory and does not automatically allocate funds, transfer capital, or alter civic report resolution status.'}
        </p>
      </div>

      {/* Chronological Timeline */}
      <div className="relative border-l-2 border-indigo-100 pl-4 space-y-6 dark:border-indigo-900/60">
        {events.map((evt, idx) => {
          const isCitizenRecord = isCitizenView || 'summary_notes' in evt
          const fullEvt = !isCitizenRecord ? (evt as RematchingEventRecord) : null
          const diff = fullEvt?.diff_summary
          const isExpanded = expandedEventId === evt.id

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[25px] top-1.5 size-4 rounded-full border-2 border-indigo-600 bg-white ring-4 ring-indigo-50 transition group-hover:scale-110 dark:border-indigo-400 dark:bg-slate-900 dark:ring-indigo-950/60" />

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      Cycle #{events.length - idx}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {getTriggerLabel(evt.trigger_type)}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="size-3.5" />
                    {formatTimestamp(evt.completed_at || evt.created_at)}
                  </span>
                </div>

                {/* Changed Fields Tags */}
                {evt.changed_fields && evt.changed_fields.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-medium text-slate-500">Triggered by updates to:</span>
                    {evt.changed_fields.map((f, fi) => (
                      <span
                        key={fi}
                        className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {/* Citizen View Summary */}
                {isCitizenRecord && 'summary_notes' in evt && (
                  <p className="mt-2.5 rounded-lg bg-emerald-50/60 p-2.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <ShieldCheck className="mr-1 inline size-3.5" />
                    {evt.summary_notes}
                  </p>
                )}

                {/* Admin/Official Differential Badges */}
                {!isCitizenRecord && diff && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {diff.total_added > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800">
                        <PlusCircle className="size-3 text-emerald-600" />
                        +{diff.total_added} Newly Added
                      </span>
                    )}
                    {diff.total_changed > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800">
                        <TrendingUp className="size-3 text-amber-600" />
                        {diff.total_changed} Score Adjusted
                      </span>
                    )}
                    {diff.total_removed > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                        <MinusCircle className="size-3 text-slate-500" />
                        {diff.total_removed} Removed
                      </span>
                    )}

                    {diff.capability_gap_diff && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-800">
                        <Sparkles className="size-3 text-blue-600" />
                        Coverage: {diff.capability_gap_diff.old_coverage}% → {diff.capability_gap_diff.new_coverage}%
                        {typeof diff.capability_gap_diff.coverage_delta === 'number' && diff.capability_gap_diff.coverage_delta !== 0 && (
                          <span className={diff.capability_gap_diff.coverage_delta > 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            ({diff.capability_gap_diff.coverage_delta > 0 ? '+' : ''}{diff.capability_gap_diff.coverage_delta}%)
                          </span>
                        )}
                      </span>
                    )}

                    {/* Toggle Detailed Breakdown Button */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(evt.id)}
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      {isExpanded ? (
                        <>Hide Details <ChevronUp className="size-3.5" /></>
                      ) : (
                        <>View Diff Details <ChevronDown className="size-3.5" /></>
                      )}
                    </button>
                  </div>
                )}

                {/* Expanded Itemized Diff List */}
                {!isCitizenRecord && isExpanded && diff && (
                  <div className="mt-3.5 space-y-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Layers className="size-3.5 text-indigo-500" />
                      Itemized Recommendation Diffs
                    </div>

                    {/* HEI Diffs */}
                    {diff.hei_diffs && diff.hei_diffs.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Higher Education Institutions
                        </div>
                        {diff.hei_diffs.map((d, di) => (
                          <div key={di} className="flex items-center justify-between rounded bg-white px-2.5 py-1 shadow-xs dark:bg-slate-900">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{d.entity_name}</span>
                            <span className={`font-semibold ${d.change_type === 'added' ? 'text-emerald-600' : d.change_type === 'removed' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>
                              {d.notes || d.change_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Faculty Diffs */}
                    {diff.faculty_diffs && diff.faculty_diffs.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Faculty Experts
                        </div>
                        {diff.faculty_diffs.map((d, di) => (
                          <div key={di} className="flex items-center justify-between rounded bg-white px-2.5 py-1 shadow-xs dark:bg-slate-900">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{d.entity_name}</span>
                            <span className={`font-semibold ${d.change_type === 'added' ? 'text-emerald-600' : d.change_type === 'removed' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>
                              {d.notes || d.change_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Student Diffs */}
                    {diff.student_diffs && diff.student_diffs.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Student Collaborators
                        </div>
                        {diff.student_diffs.map((d, di) => (
                          <div key={di} className="flex items-center justify-between rounded bg-white px-2.5 py-1 shadow-xs dark:bg-slate-900">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{d.entity_name}</span>
                            <span className={`font-semibold ${d.change_type === 'added' ? 'text-emerald-600' : d.change_type === 'removed' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>
                              {d.notes || d.change_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Partner Diffs */}
                    {diff.partner_diffs && diff.partner_diffs.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Industry & CSR Partners
                        </div>
                        {diff.partner_diffs.map((d, di) => (
                          <div key={di} className="flex items-center justify-between rounded bg-white px-2.5 py-1 shadow-xs dark:bg-slate-900">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{d.entity_name}</span>
                            <span className={`font-semibold ${d.change_type === 'added' ? 'text-emerald-600' : d.change_type === 'removed' ? 'text-slate-400 line-through' : 'text-amber-600'}`}>
                              {d.notes || d.change_type}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
