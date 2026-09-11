import React, { useEffect, useState } from 'react'
import {
  Briefcase,
  Wrench,
  Cpu,
  Package,
  Users,
  ShieldCheck,
  Clock,
  Coins,
  Sparkles,
  Loader2,
  Building2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import type {
  BackendReportResponse,
  CapabilityResponse,
  ExtractedCapabilities,
} from '../../services/reportService'
import { getReportCapabilities } from '../../services/reportService'

interface CapabilityRequirementsCardProps {
  report?: BackendReportResponse | null
  capabilityData?: CapabilityResponse | null
  token?: string
}

export const CapabilityRequirementsCard: React.FC<CapabilityRequirementsCardProps> = ({
  report,
  capabilityData,
  token: propToken,
}) => {
  const [data, setData] = useState<CapabilityResponse | null>(capabilityData || null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const trackId = report?.track_id || capabilityData?.track_id

  // Retrieve token from props or browser storage if available
  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  useEffect(() => {
    if (capabilityData) {
      setData(capabilityData)
      return
    }

    // If report already has capability fields embedded from backend
    if (report?.ai_capabilities && typeof report.ai_capabilities === 'object') {
      const caps = report.ai_capabilities as ExtractedCapabilities
      setData({
        track_id: report.track_id,
        ai_capability_status: report.ai_capability_status || 'completed',
        ai_capabilities: caps,
        ai_capability_confidence: report.ai_capability_confidence ?? 0.85,
        ai_capability_reasons: report.ai_capability_reasons || [],
        ai_capability_model: report.ai_capability_model || null,
        ai_capability_analyzed_at: report.ai_capability_analyzed_at || null,
        disclaimer: 'AI-extracted requirements are suggestions and must be reviewed by authorized officials.',
      })
      return
    }

    if (trackId) {
      let isMounted = true
      setLoading(true)
      setError(null)

      getReportCapabilities(trackId, effectiveToken)
        .then((res) => {
          if (isMounted) {
            setData(res)
            setLoading(false)
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Unable to load capability requirements.')
            setLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    }
  }, [trackId, report?.ai_capabilities, report?.ai_capability_status, report?.ai_capability_confidence, report?.ai_capability_reasons, report?.ai_capability_model, report?.ai_capability_analyzed_at, capabilityData, effectiveToken])

  if (!trackId) {
    return null
  }

  const caps = data?.ai_capabilities

  const getComplexityBadge = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case 'high':
        return (
          <span className="rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">
            High Complexity
          </span>
        )
      case 'low':
        return (
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            Low Complexity
          </span>
        )
      default:
        return (
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
            Medium Complexity
          </span>
        )
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-cyan-50/30 p-5 shadow-sm space-y-4">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-teal-600 p-1.5 text-white shadow-sm">
            <Briefcase size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Technical & Resource Capability Requirements
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                Phase 1 AI Extraction
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Extracted technical domains, tooling, manpower, and safety protocols for institutional matching.
            </p>
          </div>
        </div>

        {data?.ai_capability_model && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <Sparkles size={12} className="text-teal-600" />
            <span className="font-mono text-slate-600">{data.ai_capability_model}</span>
          </div>
        )}
      </div>

      {/* Mandatory Advisory Notice */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 flex items-start gap-2.5 text-xs text-teal-950">
        <AlertCircle size={16} className="text-teal-700 mt-0.5 shrink-0" />
        <div>
          <span className="font-bold">Advisory Notice: </span>
          <span>{data?.disclaimer || 'AI-extracted requirements are suggestions and must be reviewed by authorized officials.'}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
          <Loader2 size={16} className="animate-spin text-teal-600" />
          <span>Analyzing problem statement and extracting technical capabilities...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          <p className="font-semibold">Unable to load capabilities</p>
          <p className="mt-0.5 text-[11px] text-rose-600">{error}</p>
        </div>
      )}

      {/* Content State */}
      {!loading && !error && caps && (
        <div className="space-y-4">
          {/* High-Level Overview Grid: Complexity, Duration, Budget, Department */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400">Project Complexity</span>
              <div className="mt-1.5">{getComplexityBadge(caps.complexity)}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400">Estimated Duration</span>
              <div className="mt-1 flex items-center gap-1.5 font-bold text-slate-800 text-xs sm:text-sm">
                <Clock size={14} className="text-teal-600" />
                <span>{caps.estimated_duration_days ? `${caps.estimated_duration_days} Days` : '14–30 Days'}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400">Budget Range</span>
              <div className="mt-1 flex items-center gap-1 font-bold text-slate-800 text-xs sm:text-sm">
                <Coins size={14} className="text-teal-600" />
                <span>
                  {caps.budget_min && caps.budget_max
                    ? `₹${Math.round(caps.budget_min).toLocaleString()} - ₹${Math.round(caps.budget_max).toLocaleString()}`
                    : caps.budget_min
                    ? `From ₹${Math.round(caps.budget_min).toLocaleString()}`
                    : 'Discretionary'}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400">Responsible Dept</span>
              <div className="mt-1 flex items-center gap-1 font-medium text-slate-800 text-xs leading-tight line-clamp-2">
                <Building2 size={13} className="text-teal-600 shrink-0" />
                <span className="truncate">{caps.department_domain || 'Municipal Authority'}</span>
              </div>
            </div>
          </div>

          {/* Controlled Skills & Technical Domains */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Required Skills */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Briefcase size={14} className="text-teal-600" />
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {caps.skills && caps.skills.length > 0 ? (
                  caps.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No specific skills specified</span>
                )}
              </div>
            </div>

            {/* Technical Domains */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Cpu size={14} className="text-teal-600" />
                Technical Domains
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {caps.technical_domains && caps.technical_domains.length > 0 ? (
                  caps.technical_domains.map((d, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-cyan-50 border border-cyan-200 px-2.5 py-1 text-xs font-semibold text-cyan-800"
                    >
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">General civic maintenance</span>
                )}
              </div>
            </div>
          </div>

          {/* Physical Resources: Equipment & Materials */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Equipment */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Wrench size={14} className="text-teal-600" />
                Equipment & Tools
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {caps.equipment && caps.equipment.length > 0 ? (
                  caps.equipment.map((eq, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{eq}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Standard inspection tools</li>
                )}
              </ul>
            </div>

            {/* Materials */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Package size={14} className="text-teal-600" />
                Physical Materials
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {caps.materials && caps.materials.length > 0 ? (
                  caps.materials.map((mat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span>{mat}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Standard municipal supplies</li>
                )}
              </ul>
            </div>
          </div>

          {/* Digital Tools & Manpower */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Software / Computational Tools */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Cpu size={14} className="text-teal-600" />
                Software &amp; Digital Tools
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {caps.software_tools && caps.software_tools.length > 0 ? (
                  caps.software_tools.map((sw, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{sw}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">ImpactForge Platform &amp; GIS</li>
                )}
              </ul>
            </div>

            {/* Manpower */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users size={14} className="text-teal-600" />
                Manpower &amp; Key Personnel
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {caps.manpower && caps.manpower.length > 0 ? (
                  caps.manpower.map((mp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{mp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Civic Field Supervisor &amp; Technicians</li>
                )}
              </ul>
            </div>
          </div>

          {/* Safety & Precautionary Protocols */}
          {caps.safety_requirements && caps.safety_requirements.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-amber-600" />
                Safety Guidelines &amp; Precautionary Requirements
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {caps.safety_requirements.map((sf, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{sf}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Explainable Rationale */}
          {data.ai_capability_reasons && data.ai_capability_reasons.length > 0 && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
              <p className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                <HelpCircle size={12} /> Extraction Rationale:
              </p>
              <ul className="space-y-1">
                {data.ai_capability_reasons.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
