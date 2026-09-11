import React, { useEffect, useState, useCallback } from 'react'
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  RefreshCw,
  Wrench,
  Package,
  Users,
  Coins,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  CapabilityGapResponse,
  CitizenCapabilityGapResponse,
  CapabilityGapAnalysis,
} from '../../services/reportService'
import {
  getCapabilityGaps,
  triggerCapabilityGapAnalysis,
} from '../../services/reportService'

interface CapabilityGapCardProps {
  report?: BackendReportResponse | null
  gapData?: CapabilityGapResponse | CitizenCapabilityGapResponse | null
  token?: string
  isCitizenView?: boolean
  onAnalysisComplete?: () => void
}

export const CapabilityGapCard: React.FC<CapabilityGapCardProps> = ({
  report,
  gapData,
  token: propToken,
  isCitizenView,
  onAnalysisComplete,
}) => {
  const { currentUser } = useAuth()
  const [data, setData] = useState<CapabilityGapResponse | CitizenCapabilityGapResponse | null>(gapData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'covered' | 'missing' | 'actions'>('missing')

  const trackId = report?.track_id || gapData?.track_id

  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  const isCitizen = isCitizenView || currentUser?.role === 'citizen'
  const isOfficial = currentUser?.role === 'government' || currentUser?.role === 'admin'

  const fetchGaps = useCallback(async () => {
    if (!trackId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getCapabilityGaps(trackId, effectiveToken)
      setData(res)
    } catch (err: any) {
      setError(err.message || 'Failed to load capability gap analysis.')
    } finally {
      setLoading(false)
    }
  }, [trackId, effectiveToken])

  useEffect(() => {
    if (gapData) {
      setData(gapData)
      return
    }

    if (report?.ai_capability_gap_analysis) {
      setData({
        track_id: report.track_id,
        ai_capability_gap_status: report.ai_capability_gap_status || 'completed',
        gap_score: report.ai_capability_gap_score,
        coverage_score: report.ai_capability_gap_score,
        gap_severity: report.ai_capability_gap_severity,
        analysis: report.ai_capability_gap_analysis,
        model: report.ai_capability_gap_model,
        analyzed_at: report.ai_capability_gap_analyzed_at,
        disclaimer:
          'AI capability-gap analysis is advisory only. Collaboration, procurement, and resource commitments require official administrative approval and institutional consent.',
      })
      return
    }

    if (trackId && effectiveToken) {
      fetchGaps()
    }
  }, [trackId, report?.ai_capability_gap_analysis, gapData, effectiveToken, fetchGaps])

  const handleTriggerReanalyze = async () => {
    if (!trackId || !isOfficial) return
    setAnalyzing(true)
    setError(null)
    try {
      const res = await triggerCapabilityGapAnalysis(trackId, effectiveToken)
      setData(res)
      if (onAnalysisComplete) {
        onAnalysisComplete()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to re-run capability gap analysis.')
    } finally {
      setAnalyzing(false)
    }
  }

  // Type guards
  const fullAnalysis = (data && 'analysis' in data && data.analysis) ? (data.analysis as CapabilityGapAnalysis) : null
  const citizenData = (isCitizen && data && 'summary_of_covered_needs' in data) ? (data as CitizenCapabilityGapResponse) : null

  // Fallback / direct scores
  const coverageScore =
    fullAnalysis?.coverage_score ??
    data?.coverage_score ??
    (data && 'gap_score' in data ? (data as CapabilityGapResponse).gap_score : null) ??
    0
  const gapPercentage = fullAnalysis?.gap_percentage ?? Math.max(0, 100 - coverageScore)
  const severity = (fullAnalysis?.gap_severity || data?.gap_severity || 'moderate').toLowerCase()

  // Severity color tokens
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'minimal':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          border: 'border-emerald-500/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          label: 'Minimal Gap (0–15%)',
          desc: 'Academic candidates provide nearly complete technical self-sufficiency.',
        }
      case 'moderate':
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
          border: 'border-indigo-500/30',
          text: 'text-indigo-700 dark:text-indigo-300',
          label: 'Moderate Gap (16–35%)',
          desc: 'Strong core alignment; minor equipment or consumable materials required.',
        }
      case 'significant':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-700 dark:text-amber-300',
          label: 'Significant Gap (36–60%)',
          desc: 'Notable deficits in heavy equipment, certified manpower, or materials.',
        }
      case 'critical':
      default:
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20',
          border: 'border-rose-500/30',
          text: 'text-rose-700 dark:text-rose-300',
          label: 'Critical Gap (>60%)',
          desc: 'Substantial shortfall requiring external CSR sponsors or departmental contractors.',
        }
    }
  }

  const badgeInfo = getSeverityBadge(severity)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md transition-all dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-slate-950/40">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                AI Capability-Gap Analysis
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Sparkles className="h-3 w-3" />
                Phase 1 Part 8
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates civic requirements against matched HEIs, faculty, and student teams
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isOfficial && (
            <button
              onClick={handleTriggerReanalyze}
              disabled={analyzing || loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Re-Analyze
                </>
              )}
            </button>
          )}

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeInfo.bg} ${badgeInfo.border} ${badgeInfo.text}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {badgeInfo.label}
          </div>
        </div>
      </div>

      {/* Advisory Warning Banner */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <span className="font-bold">Mandatory Advisory Notice: </span>
          AI capability-gap analysis is advisory only. Academic collaboration, contractor procurement, and resource commitments require official administrative approval and institutional consent.
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="my-8 flex flex-col items-center justify-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span>Evaluating institutional capability coverage...</span>
        </div>
      )}

      {error && (
        <div className="my-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="mt-5 space-y-6">
          {/* Coverage Meter & Hero */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Meter Card */}
            <div className="relative flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 p-5 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Capability Coverage
              </span>
              <div className="my-3 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                  {coverageScore}%
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, coverageScore))}%` }}
                />
              </div>
              <span className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Uncovered Gap: {gapPercentage}%
              </span>
            </div>

            {/* Severity Description */}
            <div className="flex flex-col justify-center rounded-xl border border-slate-100 bg-slate-50/80 p-5 md:col-span-2 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Severity Assessment
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badgeInfo.bg} ${badgeInfo.text}`}>
                  {severity}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {badgeInfo.desc}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {fullAnalysis?.explanation || citizenData?.explanation || 'Detailed breakdown of academic capability alignment.'}
              </p>
            </div>
          </div>

          {/* Citizen Privacy-Safe Masked View */}
          {isCitizen && citizenData && (
            <div className="space-y-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Summary of Project Feasibility
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Covered Technical Capabilities:
                  </span>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {citizenData.summary_of_covered_needs.length > 0 ? (
                      citizenData.summary_of_covered_needs.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Pending candidate evaluation</li>
                    )}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                    Required External Support:
                  </span>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {citizenData.summary_of_missing_needs.length > 0 ? (
                      citizenData.summary_of_missing_needs.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <ArrowRight className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">No major external deficits detected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Full Official Breakdown (for Government, Super Admin, HEI, Faculty) */}
          {!isCitizen && fullAnalysis && (
            <>
              {/* Factor Scores Grid */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  7-Dimension Coverage Rubric
                </span>
                <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Skills (25%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.skills_coverage} <span className="text-[10px] font-normal text-slate-400">/25</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Domains (20%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.domains_coverage} <span className="text-[10px] font-normal text-slate-400">/20</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Equipment (15%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.equipment_coverage} <span className="text-[10px] font-normal text-slate-400">/15</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Software (10%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.software_coverage} <span className="text-[10px] font-normal text-slate-400">/10</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Manpower (10%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.manpower_coverage} <span className="text-[10px] font-normal text-slate-400">/10</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Safety (10%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.safety_coverage} <span className="text-[10px] font-normal text-slate-400">/10</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 text-center shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Materials (10%)</span>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fullAnalysis.factor_scores.materials_coverage} <span className="text-[10px] font-normal text-slate-400">/10</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 text-xs font-semibold dark:border-slate-800">
                <button
                  onClick={() => setActiveTab('missing')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
                    activeTab === 'missing'
                      ? 'border-rose-500 text-rose-600 dark:border-rose-400 dark:text-rose-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Identified Gaps ({fullAnalysis.missing_skills.length + fullAnalysis.missing_equipment.length + fullAnalysis.missing_materials.length})
                </button>
                <button
                  onClick={() => setActiveTab('covered')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
                    activeTab === 'covered'
                      ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Covered Capabilities ({fullAnalysis.available_skills.length})
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 transition ${
                    activeTab === 'actions'
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Recommended Actions & External Support
                </button>
              </div>

              {/* Tab: Missing Gaps */}
              {activeTab === 'missing' && (
                <div className="space-y-4 pt-1">
                  {/* Missing Skills */}
                  {fullAnalysis.missing_skills.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                        Missing Technical Skills:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {fullAnalysis.missing_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            <XCircle className="h-3 w-3 text-rose-500" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Partially Matched Skills */}
                  {fullAnalysis.partially_available_skills.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Partially Covered Skills (Adjacent Competencies):
                      </span>
                      <div className="mt-1.5 space-y-1.5">
                        {fullAnalysis.partially_available_skills.map((part, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/50 p-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
                          >
                            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                            <div>
                              <span className="font-semibold">{part.required_skill}</span>: {part.relevance_note}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Gaps Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Missing Equipment */}
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Wrench className="h-3.5 w-3.5 text-indigo-500" />
                        Missing Equipment
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {fullAnalysis.missing_equipment.length > 0 ? (
                          fullAnalysis.missing_equipment.map((eq, i) => <li key={i}>• {eq}</li>)
                        ) : (
                          <li className="text-slate-400">No missing equipment</li>
                        )}
                      </ul>
                    </div>

                    {/* Missing Materials */}
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Package className="h-3.5 w-3.5 text-amber-500" />
                        Missing Materials / Consumables
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {fullAnalysis.missing_materials.length > 0 ? (
                          fullAnalysis.missing_materials.map((mat, i) => <li key={i}>• {mat}</li>)
                        ) : (
                          <li className="text-slate-400">No bulk materials required</li>
                        )}
                      </ul>
                    </div>

                    {/* Department Support Required */}
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Building className="h-3.5 w-3.5 text-purple-500" />
                        Departmental Authorization
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {fullAnalysis.missing_department_support.map((dept, i) => (
                          <li key={i}>• {dept}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Budget Gap */}
                  {fullAnalysis.missing_budget && (
                    <div className="flex items-center gap-2 rounded-lg border border-indigo-200/60 bg-indigo-50/40 p-3 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-200">
                      <Coins className="h-4 w-4 shrink-0 text-indigo-500" />
                      <span>{fullAnalysis.missing_budget}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Covered Capabilities */}
              {activeTab === 'covered' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Fully Covered Skills:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {fullAnalysis.available_skills.length > 0 ? (
                        fullAnalysis.available_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">No matching skills identified</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Covered Technical Domains:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(fullAnalysis.covered_capabilities.domains || []).map((dom: string, idx: number) => (
                          <span key={idx} className="rounded bg-white px-2 py-0.5 text-xs text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                            {dom}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Available HEI Equipment & Tools:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {(fullAnalysis.covered_capabilities.equipment || []).map((eq: string, idx: number) => (
                          <span key={idx} className="rounded bg-white px-2 py-0.5 text-xs text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-300">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Actions & Support */}
              {activeTab === 'actions' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      Recommended Strategic Actions:
                    </span>
                    <ul className="mt-2 space-y-2">
                      {fullAnalysis.recommended_actions.map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-lg border border-slate-200/60 bg-white p-2.5 text-xs text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                      Required External Support Partners:
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {fullAnalysis.required_external_support.map((supp, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-purple-200/60 bg-purple-50/40 p-2 text-xs text-purple-900 dark:border-purple-900/40 dark:bg-purple-950/30 dark:text-purple-200"
                        >
                          <Users className="h-3.5 w-3.5 text-purple-500" />
                          <span>{supp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Alert Footer */}
              {fullAnalysis.verification_summary.has_unverified_entities && (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>{fullAnalysis.verification_summary.verification_notes}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
