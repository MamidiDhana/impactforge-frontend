import React, { useState } from 'react'
import {
  Sparkles,
  TrendingUp,
  Target,
  ShieldAlert,
  Clock,
  Coins,
  Users,
  CheckCircle2,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Building2,
  Handshake,
} from 'lucide-react'
import type {
  ProjectAnalyticsDetail,
  CitizenProjectAnalyticsResponse,
  ScoreDetail,
} from '../../services/reportService'

interface ProjectImpactAnalyticsCardProps {
  analytics?: ProjectAnalyticsDetail | null
  citizenAnalytics?: CitizenProjectAnalyticsResponse | null
  isCitizenView?: boolean
  trackId?: string
  status?: string
}

type ScoreTabKey = 'feasibility' | 'impact' | 'readiness' | 'risk' | 'confidence'

export const ProjectImpactAnalyticsCard: React.FC<ProjectImpactAnalyticsCardProps> = ({
  analytics,
  citizenAnalytics,
  isCitizenView = false,
  trackId,
  status: _status = 'completed',
}) => {
  const [showTransparency, setShowTransparency] = useState(false)
  const [activeScoreTab, setActiveScoreTab] = useState<ScoreTabKey>('feasibility')

  // Citizen Privacy-Safe View
  if (isCitizenView || citizenAnalytics) {
    const data = citizenAnalytics || {
      track_id: trackId || '',
      problem_title: 'Civic Problem',
      feasibility_summary: analytics?.feasibility_summary || 'Community civic solution under technical assessment.',
      impact_level: analytics?.impact_score.level || 'moderate',
      estimated_duration_weeks: analytics?.estimated_duration_weeks || {
        min_weeks: 2,
        max_weeks: 6,
        is_estimate: true,
        basis: 'Standard classification',
      },
      beneficiary_reach: analytics?.beneficiary_reach || {
        min_reach: 100,
        max_reach: 500,
        is_estimate: true,
        basis: 'Demographic density',
      },
      social_impact_summary: analytics?.social_impact_summary || 'Expected resolution will benefit local residents.',
      recommended_next_steps: analytics?.recommended_next_steps || ['Administrative review in progress.'],
      disclaimer: 'Advisory community impact projection for public awareness.',
    }

    const impactBadgeColor =
      data.impact_level === 'excellent' || data.impact_level === 'high'
        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        : data.impact_level === 'strong'
        ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'

    return (
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md mb-6 transition-all">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                Civic Impact & Solution Projection
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-normal">
                  Community Advisory
                </span>
              </h3>
              <p className="text-xs text-slate-400">Public transparency on expected community improvements</p>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium uppercase tracking-wider ${impactBadgeColor}`}>
            Impact: {data.impact_level}
          </span>
        </div>

        {/* Citizen Key Projections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Estimated Resolution Timeline</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">Estimate</span>
            </div>
            <div className="text-base font-semibold text-white">
              {data.estimated_duration_weeks.min_weeks} – {data.estimated_duration_weeks.max_weeks} Weeks
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{data.estimated_duration_weeks.basis}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Projected Beneficiaries</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">Estimate</span>
            </div>
            <div className="text-base font-semibold text-white">
              {data.beneficiary_reach.min_reach?.toLocaleString()} – {data.beneficiary_reach.max_reach?.toLocaleString()} Citizens
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{data.beneficiary_reach.basis}</p>
          </div>
        </div>

        {/* Social Impact Narrative */}
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50 mb-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Social & Community Value
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{data.social_impact_summary}</p>
        </div>

        {/* Next Steps for Public Awareness */}
        {data.recommended_next_steps && data.recommended_next_steps.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Progress & Next Steps
            </h4>
            <div className="space-y-1.5">
              {data.recommended_next_steps.slice(0, 3).map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Civic Disclaimer */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{data.disclaimer}</span>
        </div>
      </div>
    )
  }

  // Administrative / Institutional Full Advisory View
  if (!analytics) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center text-slate-400 my-4">
        <Sparkles className="w-6 h-6 text-slate-500 mx-auto mb-2 animate-pulse" />
        <p className="text-sm">Project and impact analytics calculation is pending or generating...</p>
      </div>
    )
  }

  const {
    feasibility_score,
    impact_score,
    readiness_score,
    risk_score,
    confidence_score,
    feasibility_summary,
    implementation_complexity,
    estimated_duration_weeks,
    estimated_budget_inr,
    beneficiary_reach,
    social_impact_summary,
    risk_factors,
    dependency_factors,
    required_institutional_support,
    required_partner_support,
    capability_coverage,
    recommended_next_steps,
    transparency,
  } = analytics

  const getScoreColor = (score: number, _level: string, isRisk = false) => {
    if (isRisk) {
      if (score >= 70) return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', bar: 'bg-rose-500' }
      if (score >= 45) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' }
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' }
    }
    if (score >= 85) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', bar: 'bg-emerald-500' }
    if (score >= 70) return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', bar: 'bg-cyan-500' }
    if (score >= 45) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' }
    return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30', bar: 'bg-rose-500' }
  }

  const complexityColor = {
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    moderate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    extreme: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  }[implementation_complexity] || 'bg-slate-800 text-slate-300 border-slate-700'

  const scoreMap: Record<ScoreTabKey, { label: string; data: ScoreDetail; isRisk?: boolean }> = {
    feasibility: { label: 'Feasibility', data: feasibility_score },
    impact: { label: 'Civic Impact', data: impact_score },
    readiness: { label: 'Readiness', data: readiness_score },
    risk: { label: 'Risk Factor', data: risk_score, isRisk: true },
    confidence: { label: 'Confidence', data: confidence_score },
  }

  const activeScoreData = scoreMap[activeScoreTab].data
  const activeColor = getScoreColor(activeScoreData.score, activeScoreData.level, scoreMap[activeScoreTab].isRisk)

  return (
    <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md mb-6 transition-all">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/30 via-indigo-600/30 to-purple-600/30 border border-cyan-500/30 text-cyan-300 shadow-inner">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white tracking-wide">
                Project & Impact Analytics
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-medium">
                Phase 1 Synthesis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Explainable advisory intelligence synthesized from all 10 preceding AI modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${complexityColor}`}>
            Complexity: {implementation_complexity}
          </span>
          <button
            type="button"
            onClick={() => setShowTransparency(!showTransparency)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Transparency</span>
            {showTransparency ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Score Tab Navigation & Meters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
        {(Object.keys(scoreMap) as ScoreTabKey[]).map((key) => {
          const item = scoreMap[key]
          const isSelected = activeScoreTab === key
          const colors = getScoreColor(item.data.score, item.data.level, item.isRisk)

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveScoreTab(key)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-slate-950/50 border-slate-800/70 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400 truncate mb-1">{item.label}</div>
              <div className="flex items-baseline justify-between">
                <span className={`text-lg font-bold ${colors.text}`}>{item.data.score}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {item.data.level}
                </span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${item.data.score}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Score Explainability Detail */}
      <div className={`p-3.5 rounded-xl border mb-5 transition-all ${activeColor.bg} ${activeColor.border}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              {scoreMap[activeScoreTab].label} Breakdown & Rationale
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{activeScoreData.explanation}</p>
          </div>
        </div>

        {activeScoreData.breakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/50">
            {Object.entries(activeScoreData.breakdown)
              .filter(([k]) => k !== 'max_possible')
              .map(([key, val]) => (
                <div key={key} className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 truncate capitalize">
                    {key.replace(/_/g, ' ').replace('component', '')}
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    {typeof val === 'number' ? `${val} pts` : String(val)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Quantitative Projections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {/* Estimated Duration */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Estimated Duration
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">Estimate</span>
          </div>
          <div className="text-base font-bold text-white">
            {estimated_duration_weeks.min_weeks} – {estimated_duration_weeks.max_weeks} Weeks
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{estimated_duration_weeks.basis}</p>
        </div>

        {/* Estimated Budget Range */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              Budget Estimation
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">Estimate</span>
          </div>
          <div className="text-base font-bold text-white">
            ₹{estimated_budget_inr.min_budget?.toLocaleString()} – ₹{estimated_budget_inr.max_budget?.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{estimated_budget_inr.basis}</p>
        </div>

        {/* Beneficiary Reach */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Beneficiary Reach
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">Estimate</span>
          </div>
          <div className="text-base font-bold text-white">
            {beneficiary_reach.min_reach?.toLocaleString()} – {beneficiary_reach.max_reach?.toLocaleString()} Citizens
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{beneficiary_reach.basis}</p>
        </div>
      </div>

      {/* Social & Feasibility Narratives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            Feasibility Summary
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{feasibility_summary}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Social & Civic Impact
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{social_impact_summary}</p>
        </div>
      </div>

      {/* Multi-Stakeholder Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {/* Institutional Support */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Required Institutional Support (HEI)
          </h4>
          <ul className="space-y-1.5">
            {required_institutional_support.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Partner Support */}
        <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Handshake className="w-3.5 h-3.5 text-purple-400" />
            Required Partner & CSR Support
          </h4>
          <ul className="space-y-1.5">
            {required_partner_support.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Project Dependencies & Capability Coverage Overview */}
      {(dependency_factors.length > 0 || capability_coverage.overall_coverage_percentage !== undefined) && (
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
            <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Dependencies & Capability Alignment
            </h4>
            {capability_coverage.overall_coverage_percentage !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <span>Coverage:</span>
                <span className="text-white font-bold">{capability_coverage.overall_coverage_percentage}%</span>
                <span className="text-[10px] uppercase font-semibold text-amber-400">({capability_coverage.gap_severity})</span>
              </div>
            )}
          </div>
          {dependency_factors.length > 0 && (
            <ul className="space-y-1.5">
              {dependency_factors.map((dep, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{dep}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Risk Factors & Mitigations */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Implementation Risk Factors & Mitigation Strategies
          </h4>
          <div className="space-y-2">
            {risk_factors.map((rf, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-medium text-white">{rf.risk}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rf.mitigation}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase shrink-0 ${
                  rf.severity === 'high' || rf.severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : rf.severity === 'moderate'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {rf.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next Steps */}
      {recommended_next_steps && recommended_next_steps.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Recommended Advisory Next Steps
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recommended_next_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/40 text-xs text-slate-300">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Transparency Panel */}
      {showTransparency && (
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 mb-4 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            AI Analytical Assumptions & Rubric Calculation
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">{transparency.calculation_explanation}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Underlying Assumptions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {transparency.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Data Limitations:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {transparency.data_limitations.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Advisory Disclaimer */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong>Zero-Mutation Advisory Notice:</strong> {transparency.advisory_disclaimer}
        </span>
      </div>
    </div>
  )
}
