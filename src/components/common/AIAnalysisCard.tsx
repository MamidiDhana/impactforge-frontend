import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  Flame,
  AlertTriangle,
  ShieldAlert,
  Users,
  Building2,
  Clock,
} from 'lucide-react'
import type {
  BackendReportResponse,
  ReportAIAnalysis,
  ReportAIPriority,
} from '../../services/reportService'

interface AIAnalysisCardProps {
  report?: BackendReportResponse | null
  aiData?: ReportAIAnalysis | null
  priorityData?: ReportAIPriority | null
}

export function AIAnalysisCard({ report, aiData, priorityData }: AIAnalysisCardProps) {
  // Aggregate Part 1 categorization fields
  const category = aiData?.category || report?.ai_category || null
  const subcategory = aiData?.subcategory || report?.ai_subcategory || null
  const problemType = aiData?.problem_type || report?.ai_problem_type || null
  const summary = aiData?.short_summary || report?.ai_summary || null
  const confidence = aiData?.confidence_score ?? report?.ai_confidence_score ?? null
  const catStatus = (aiData?.analysis_status || report?.ai_analysis_status || 'pending').toLowerCase()

  // Aggregate Part 2 priority fields
  const priority = priorityData?.priority || report?.ai_priority || null
  const priorityScore = priorityData?.score ?? report?.ai_priority_score ?? null
  const factors = priorityData?.factors || report?.ai_priority_factors || null
  const reasons = priorityData?.reasons || report?.ai_priority_reasons || []
  const priorityStatus = (priorityData?.status || report?.ai_priority_status || 'pending').toLowerCase()
  const priorityModel = priorityData?.model || report?.ai_priority_model || null

  const isCategorizationAvailable = Boolean(category && catStatus !== 'unavailable' && catStatus !== 'failed')
  const isPriorityAvailable = Boolean(priority && priorityScore !== null && priorityStatus !== 'unavailable' && priorityStatus !== 'failed')

  const confidencePercent = confidence !== null ? Math.round(confidence * 100) : null

  // Priority color styling helper
  const getPriorityStyle = (level: string | null) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-800 border-red-300 ring-red-200',
          text: 'text-red-700',
          bar: 'bg-red-500',
          bg: 'from-red-50 to-orange-50/30',
          border: 'border-red-200',
          icon: <Flame size={16} className="text-red-600" />,
        }
      case 'high':
        return {
          badge: 'bg-orange-100 text-orange-800 border-orange-300 ring-orange-200',
          text: 'text-orange-700',
          bar: 'bg-orange-500',
          bg: 'from-orange-50 to-amber-50/30',
          border: 'border-orange-200',
          icon: <AlertTriangle size={16} className="text-orange-600" />,
        }
      case 'medium':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-200',
          text: 'text-amber-700',
          bar: 'bg-amber-500',
          bg: 'from-amber-50 to-yellow-50/30',
          border: 'border-amber-200',
          icon: <AlertCircle size={16} className="text-amber-600" />,
        }
      case 'low':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-200',
          text: 'text-emerald-700',
          bar: 'bg-emerald-500',
          bg: 'from-emerald-50 to-teal-50/30',
          border: 'border-emerald-200',
          icon: <ShieldAlert size={16} className="text-emerald-600" />,
        }
    }
  }

  const priorityStyle = getPriorityStyle(priority)

  return (
    <div className="space-y-4">
      {/* ================= Part 2: AI Priority & Urgency Card ================= */}
      {isPriorityAvailable ? (
        <div className={`overflow-hidden rounded-2xl border ${priorityStyle.border} bg-gradient-to-br ${priorityStyle.bg} p-5 shadow-sm sm:p-6`}>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs">
                {priorityStyle.icon}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    AI Urgency & Priority Score
                  </h3>
                  {/* Required prominent badge */}
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-blue-900 ring-1 ring-inset ring-blue-300">
                    AI suggestion — Government decision required
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Explainable weighted scoring algorithm (0–100) based on public safety, population, and infrastructure
                </p>
              </div>
            </div>

            {/* Suggested Priority Badge */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${priorityStyle.badge}`}>
                {priority} Priority
              </span>
              <div className="flex items-baseline rounded-xl bg-white px-3 py-1 text-sm font-extrabold text-[#13243b] shadow-xs">
                <span>{priorityScore}</span>
                <span className="text-xs font-normal text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Factor Breakdown Grid */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Factor Weight Breakdown
              </span>
              <span className="text-[11px] text-slate-400">
                Deterministic calculation
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Public Safety Risk */}
              <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>Public Safety</span>
                  </div>
                  <span className="font-bold text-[#13243b]">
                    {factors?.safety_risk ?? '--'}<span className="text-[10px] font-normal text-slate-400">/40</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((factors?.safety_risk ?? 0) / 40) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 2. Number of People Affected */}
              <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-blue-500" />
                    <span>People Affected</span>
                  </div>
                  <span className="font-bold text-[#13243b]">
                    {factors?.affected_people ?? '--'}<span className="text-[10px] font-normal text-slate-400">/25</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((factors?.affected_people ?? 0) / 25) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 3. Urgency Indicators */}
              <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-amber-500" />
                    <span>Urgency Indicators</span>
                  </div>
                  <span className="font-bold text-[#13243b]">
                    {factors?.urgency_indicators ?? '--'}<span className="text-[10px] font-normal text-slate-400">/20</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((factors?.urgency_indicators ?? 0) / 20) * 100)}%` }}
                  />
                </div>
              </div>

              {/* 4. Infrastructure or Service Impact */}
              <div className="rounded-xl border border-slate-200/80 bg-white/90 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Building2 size={14} className="text-purple-500" />
                    <span>Infrastructure</span>
                  </div>
                  <span className="font-bold text-[#13243b]">
                    {factors?.infrastructure_impact ?? '--'}<span className="text-[10px] font-normal text-slate-400">/15</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, ((factors?.infrastructure_impact ?? 0) / 15) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Reasons */}
          {reasons && reasons.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/90 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Info size={14} className="text-teal-600" />
                <span>Explainable Assessment Rationale</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Status and Advisory Note */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>Status: <strong className="capitalize text-slate-700">{priorityStatus}</strong></span>
              {priorityModel && (
                <>
                  <span>•</span>
                  <span>Model: <strong className="text-slate-700">{priorityModel}</strong></span>
                </>
              )}
            </div>
            <p className="italic text-slate-400">
              * Advisory scoring recommendation only. Does not alter official report priority without government review.
            </p>
          </div>
        </div>
      ) : null}

      {/* ================= Part 1: AI Categorization Card ================= */}
      <div className="overflow-hidden rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50/40 via-white to-blue-50/30 p-5 shadow-sm sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100/70 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-700/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  AI Classification & Summary
                </h3>
                <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-teal-800 ring-1 ring-inset ring-teal-300/60">
                  AI suggestion
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Automated taxonomy classification powered by ImpactForge NLP
              </p>
            </div>
          </div>

          {/* Status indicator */}
          {isCategorizationAvailable && (
            <div className="flex items-center gap-2">
              {catStatus === 'completed' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <CheckCircle2 size={13} />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                  <AlertCircle size={13} />
                  Needs Review
                </span>
              )}
              {confidencePercent !== null && (
                <span className="rounded-full bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  {confidencePercent}% Confidence
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isCategorizationAvailable ? (
          <div className="mt-5 space-y-4">
            {/* Metadata Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  <span>Category</span>
                  <span className="text-[10px] font-medium text-teal-600">AI suggestion</span>
                </div>
                <p className="mt-1 font-semibold text-[#13243b]">{category}</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  <span>Subcategory</span>
                  <span className="text-[10px] font-medium text-teal-600">AI suggestion</span>
                </div>
                <p className="mt-1 font-semibold text-[#13243b]">{subcategory || 'General'}</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  <span>Problem Type</span>
                  <span className="text-[10px] font-medium text-teal-600">AI suggestion</span>
                </div>
                <p className="mt-1 font-semibold text-[#13243b]">{problemType || 'Civic Grievance'}</p>
              </div>
            </div>

            {/* AI Summary */}
            {summary && (
              <div className="rounded-xl border border-teal-100 bg-white/90 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Info size={14} className="text-teal-600" />
                  <span>Executive Summary</span>
                  <span className="text-[10px] font-normal text-slate-400">(AI generated)</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {summary}
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic">
              * All classifications and summaries are AI-assisted suggestions and do not replace official government or university validation.
            </p>
          </div>
        ) : (
          /* Friendly Fallback State */
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-white/60 p-5 text-center">
            <Info size={24} className="mx-auto text-slate-400" />
            <h4 className="mt-2 text-sm font-semibold text-slate-700">
              AI Categorization Unavailable
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              AI categorization is currently unavailable or pending review for this report.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
