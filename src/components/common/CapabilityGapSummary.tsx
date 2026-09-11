import React from 'react'
import { Layers, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import type {
  BackendReportResponse,
  CapabilityGapResponse,
  CitizenCapabilityGapResponse,
  CapabilityGapAnalysis,
} from '../../services/reportService'

interface CapabilityGapSummaryProps {
  report?: BackendReportResponse | null
  gapData?: CapabilityGapResponse | CitizenCapabilityGapResponse | null
  isCompact?: boolean
}

export const CapabilityGapSummary: React.FC<CapabilityGapSummaryProps> = ({
  report,
  gapData,
  isCompact = false,
}) => {
  const fullAnalysis = (gapData && 'analysis' in gapData && gapData.analysis)
    ? (gapData.analysis as CapabilityGapAnalysis)
    : (report?.ai_capability_gap_analysis as CapabilityGapAnalysis | undefined)

  const coverageScore =
    fullAnalysis?.coverage_score ??
    report?.ai_capability_gap_score ??
    (gapData && 'coverage_score' in gapData ? gapData.coverage_score : null) ??
    (gapData && 'gap_score' in gapData ? (gapData as CapabilityGapResponse).gap_score : null) ??
    0

  const severity = (
    fullAnalysis?.gap_severity ||
    report?.ai_capability_gap_severity ||
    gapData?.gap_severity ||
    'moderate'
  ).toLowerCase()

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'minimal':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
          border: 'border-emerald-500/30',
          label: 'Minimal Gap',
        }
      case 'moderate':
        return {
          bg: 'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
          border: 'border-indigo-500/30',
          label: 'Moderate Gap',
        }
      case 'significant':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
          border: 'border-amber-500/30',
          label: 'Significant Gap',
        }
      case 'critical':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
          border: 'border-rose-500/30',
          label: 'Critical Gap',
        }
    }
  }

  const badge = getSeverityBadge(severity)

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
        <Layers className="h-3.5 w-3.5 text-indigo-500" />
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Coverage: {coverageScore}%
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badge.bg}`}>
          {badge.label}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Capability Coverage Overview
          </h4>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.bg} ${badge.border}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 dark:text-slate-50">{coverageScore}%</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">estimated resource match</span>
      </div>

      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
          style={{ width: `${Math.min(100, Math.max(5, coverageScore))}%` }}
        />
      </div>

      {fullAnalysis && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{fullAnalysis.available_skills.length} skills available</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{fullAnalysis.missing_equipment.length + fullAnalysis.missing_materials.length} resource gaps</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>Advisory only. Official administrative consent required.</span>
      </div>
    </div>
  )
}
