import React from 'react'
import { Handshake, ShieldAlert } from 'lucide-react'
import type {
  BackendReportResponse,
  PartnerMatchingResponse,
  CitizenPartnerMatchingResponse,
} from '../../services/reportService'

interface PartnerMatchingSummaryProps {
  report?: BackendReportResponse | null
  partnerData?: PartnerMatchingResponse | CitizenPartnerMatchingResponse | null
  isCompact?: boolean
}

export const PartnerMatchingSummary: React.FC<PartnerMatchingSummaryProps> = ({
  report,
  partnerData,
  isCompact = false,
}) => {
  const recommendations =
    partnerData?.recommendations ||
    (report?.ai_partner_matches as any[]) ||
    []

  const topPartner = recommendations.length > 0 ? recommendations[0] : null

  if (!topPartner) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-text-muted bg-surface-raised border border-border">
        <Handshake className="w-3.5 h-3.5 text-text-muted" />
        <span>No partner matched yet</span>
      </div>
    )
  }

  const score = typeof topPartner.score === 'number' ? topPartner.score : 0
  const level = topPartner.match_level || 'moderate'
  const isVerified = topPartner.verification_status === 'verified'

  const getLevelColor = (lvl: string) => {
    switch (lvl.toLowerCase()) {
      case 'excellent':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'strong':
        return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
      case 'moderate':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    }
  }

  if (isCompact) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface border border-border text-xs">
        <Handshake className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-medium text-text-primary truncate max-w-[140px]">
          {topPartner.organization_name}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getLevelColor(level)}`}>
          {score.toFixed(0)}%
        </span>
      </div>
    )
  }

  return (
    <div className="p-3 bg-surface-raised/40 border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <Handshake className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-text-primary">{topPartner.organization_name}</span>
            <span className="text-[10px] text-text-muted">({topPartner.partner_type})</span>
            {!isVerified && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                <ShieldAlert className="w-2.5 h-2.5" />
                Unverified Demo
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-sm">
            {topPartner.estimated_support_type || 'Support Identified'} • {topPartner.location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2 py-0.5 rounded-full font-semibold border ${getLevelColor(level)}`}>
          {score.toFixed(1)} / 100 ({level})
        </span>
      </div>
    </div>
  )
}
