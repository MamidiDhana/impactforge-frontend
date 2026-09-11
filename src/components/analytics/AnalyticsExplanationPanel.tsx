import React, { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, ShieldAlert, Target, TrendingUp, Info } from 'lucide-react'

export const AnalyticsExplanationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm mb-6 transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Explainable AI Methodology & Scoring Guide
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                Phase 1 Guide
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Understanding how Feasibility, Civic Impact, Readiness, and Risk are calculated
            </p>
          </div>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200 text-xs text-slate-300">
          {/* Score Thresholds */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
              <div className="font-bold text-sm">85 – 100</div>
              <div className="font-medium text-xs uppercase tracking-wider">Excellent</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Optimal institutional alignment and minimal risk.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300">
              <div className="font-bold text-sm">70 – 84</div>
              <div className="font-medium text-xs uppercase tracking-wider">Strong</div>
              <p className="text-[10px] text-slate-400 mt-0.5">High viability with clear partner support pathways.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300">
              <div className="font-bold text-sm">45 – 69</div>
              <div className="font-medium text-xs uppercase tracking-wider">Moderate</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Requires inter-departmental mobilization or funding.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
              <div className="font-bold text-sm">0 – 44</div>
              <div className="font-medium text-xs uppercase tracking-wider">Low</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Significant missing capabilities or remote logistics.</p>
            </div>
          </div>

          {/* 4 Core Dimensions Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1 text-xs">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Feasibility Scoring Formula (100 pts)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Capability Coverage (40%) + Best HEI Match Quality (25%) + Partner Support Readiness (20%) + Complexity & Execution Sanity (15%).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1 text-xs">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Civic Impact Scoring Formula (100 pts)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Official Priority Tier (30%) + Beneficiary Reach Footprint (30%) + Category Criticality (20%) + Duplicate/Cluster Frequency (20%).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                Readiness Score (100 pts)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Confirmed Available Skills & Tools (35%) + Institutional/Partner Alignment (35%) + Context Detail & Site Completeness (30%).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="font-semibold text-white flex items-center gap-1.5 mb-1 text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                Implementation Risk Score (100 pts)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Capability-Gap Severity (35%) + Resource & Budget Deficit (25%) + Technical Complexity (25%) + Geographic Logistics (15%).
              </p>
            </div>
          </div>

          {/* Zero Mutation & Data Integrity Notice */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Integrity Guarantee:</strong> All analytics and aggregates are computed from verified database records without fabricated statistics. Analytical evaluations are strictly advisory and never modify official report statuses, priorities, or departmental assignments.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
