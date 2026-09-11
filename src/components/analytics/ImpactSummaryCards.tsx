import React from 'react'
import { Target, TrendingUp, CheckCircle2, Users, AlertTriangle } from 'lucide-react'
import type { ImpactSummaryResponse } from '../../services/reportService'

interface ImpactSummaryCardsProps {
  summary: ImpactSummaryResponse | null
  loading?: boolean
}

export const ImpactSummaryCards: React.FC<ImpactSummaryCardsProps> = ({ summary, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!summary || summary.insufficient_data) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 mb-6">
        <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-white">Insufficient Analytics Data</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          No civic reports have completed AI project analytics yet. As community reports are processed, aggregate feasibility and impact metrics will be computed in real time.
        </p>
      </div>
    )
  }

  const cards = [
    {
      label: 'Avg Feasibility Score',
      value: summary.avg_feasibility_score !== null ? `${summary.avg_feasibility_score}` : 'N/A',
      subtext: `${summary.analyzed_reports} of ${summary.total_reports} reports analyzed`,
      icon: Target,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/10 to-blue-500/5',
      border: 'border-cyan-500/20',
    },
    {
      label: 'Avg Impact Potential',
      value: summary.avg_impact_score !== null ? `${summary.avg_impact_score}` : 'N/A',
      subtext: `${summary.high_impact_count} high-impact initiatives`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Avg Readiness Score',
      value: summary.avg_readiness_score !== null ? `${summary.avg_readiness_score}` : 'N/A',
      subtext: 'Institutional & partner alignment',
      icon: CheckCircle2,
      color: 'text-indigo-400',
      bg: 'from-indigo-500/10 to-purple-500/5',
      border: 'border-indigo-500/20',
    },
    {
      label: 'Total Beneficiary Reach',
      value: summary.total_estimated_beneficiaries
        ? summary.total_estimated_beneficiaries.toLocaleString()
        : '0',
      subtext: `Across Jharkhand districts`,
      icon: Users,
      color: 'text-amber-400',
      bg: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-br ${card.bg} bg-slate-900/80 border ${card.border} shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-xl bg-slate-950/60 border border-slate-800 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">{card.subtext}</div>
          </div>
        )
      })}
    </div>
  )
}
