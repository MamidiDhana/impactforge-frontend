import React, { useEffect, useState, useCallback } from 'react'
import {
  Handshake,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Send,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import type {
  BackendReportResponse,
  PartnerMatchingResponse,
  CitizenPartnerMatchingResponse,
  PartnerRecommendationMatch,
  CitizenPartnerRecommendation,
  PartnerInterestRecord,
} from '../../services/reportService'
import { getPartnerMatches } from '../../services/reportService'
import { PartnerSupportInterestModal } from '../partner/PartnerSupportInterestModal'

interface PartnerMatchingCardProps {
  report?: BackendReportResponse | null
  partnerData?: PartnerMatchingResponse | CitizenPartnerMatchingResponse | null
  token?: string
  isCitizenView?: boolean
  onInterestSubmitted?: () => void
}

export const PartnerMatchingCard: React.FC<PartnerMatchingCardProps> = ({
  report,
  partnerData,
  token: propToken,
  isCitizenView,
  onInterestSubmitted,
}) => {
  const { currentUser } = useAuth()
  const [data, setData] = useState<PartnerMatchingResponse | CitizenPartnerMatchingResponse | null>(
    partnerData || null
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedPartner, setExpandedPartner] = useState<Record<string, boolean>>({})

  // Modal states for expressing interest or admin review
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecommendationMatch | null>(null)
  const [selectedInterest, setSelectedInterest] = useState<PartnerInterestRecord | null>(null)

  const trackId = report?.track_id || partnerData?.track_id

  const effectiveToken =
    propToken ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    undefined

  const role = currentUser?.role || 'citizen'
  const isCitizen = isCitizenView || role === 'citizen'
  const isGovOrAdmin = role === 'government' || role === 'admin'
  const isPartner = role === 'partner'

  const fetchMatches = useCallback(async () => {
    if (!trackId) return
    setLoading(true)
    setError(null)
    try {
      const res = await getPartnerMatches(trackId, effectiveToken)
      setData(res)
    } catch (err: any) {
      setError(err.message || 'Unable to load partner recommendations.')
    } finally {
      setLoading(false)
    }
  }, [trackId, effectiveToken])

  useEffect(() => {
    if (partnerData) {
      setData(partnerData)
      return
    }

    if (report?.ai_partner_matches && Array.isArray(report.ai_partner_matches) && report.ai_partner_matches.length > 0) {
      if (isCitizen) {
        setData({
          track_id: report.track_id,
          status: report.ai_partner_matching_status || 'completed',
          recommendations: report.ai_partner_matches.map((m: any) => ({
            partner_id: m.partner_id,
            organization_name: m.organization_name,
            partner_type: m.partner_type,
            location: m.location,
            score: m.score,
            match_level: m.match_level,
            matched_support_areas: m.matched_support_areas || [],
            estimated_support_type: m.estimated_support_type || 'Technical Support',
            explanation: m.explanation || '',
            verification_status: m.verification_status || 'unverified',
          })),
          advisory_warning:
            'AI partner recommendations are strictly advisory and do not constitute financial commitments, formal contracts, or administrative project approvals.',
        })
      } else {
        setData({
          track_id: report.track_id,
          status: report.ai_partner_matching_status || 'completed',
          model: report.ai_partner_matching_model,
          analyzed_at: report.ai_partner_matching_analyzed_at,
          total_evaluated_partners: report.ai_partner_matches.length,
          recommendations: report.ai_partner_matches,
          registered_interests: [],
          advisory_warning:
            'AI partner recommendations are strictly advisory and do not constitute financial commitments, formal contracts, or administrative project approvals.',
        })
      }
      return
    }

    if (trackId && effectiveToken) {
      fetchMatches()
    }
  }, [trackId, report, partnerData, effectiveToken, isCitizen, fetchMatches])

  if (!trackId) return null

  const toggleExpand = (partnerId: string) => {
    setExpandedPartner((prev) => ({
      ...prev,
      [partnerId]: !prev[partnerId],
    }))
  }

  const getMatchLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Excellent Match
          </span>
        )
      case 'strong':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Strong Match
          </span>
        )
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Info className="w-3.5 h-3.5" />
            Moderate Match
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Low Match
          </span>
        )
    }
  }

  const getPartnerTypeBadge = (type: string) => {
    const t = type.toUpperCase()
    let color = 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    if (t === 'CSR') color = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    if (t === 'INDUSTRY') color = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    if (t === 'SUPPLIER') color = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    if (t === 'NGO') color = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'

    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${color}`}>
        {type}
      </span>
    )
  }

  const recommendations = data?.recommendations || []
  const registeredInterests =
    'registered_interests' in (data || {})
      ? ((data as PartnerMatchingResponse).registered_interests as PartnerInterestRecord[])
      : []

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              Industry & CSR Partner Recommendations
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Phase 1 Part 9
              </span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Explainable matching against report capability gaps (Equipment, Funding, Technical Domains, Manpower, Location)
            </p>
          </div>
        </div>

        {/* Registered proposals badge / trigger */}
        {registeredInterests.length > 0 && !isCitizen && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs text-text-secondary">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{registeredInterests.length} Support Proposal{registeredInterests.length > 1 ? 's' : ''} Active</span>
          </div>
        )}
      </div>

      {/* Advisory Warning Banner */}
      <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <div className="leading-relaxed">
          <strong>Advisory Governance:</strong> AI recommendations are strictly advisory and do not
          automatically allocate funds, transfer capital, approve contracts, or alter civic report resolution
          status. Multi-party coordination requires official governmental and stakeholder review.
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Evaluating partner profiles against capability gaps...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-xs text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Unable to load partner matching</p>
            <p className="text-text-muted">{error}</p>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="py-8 text-center text-text-muted text-sm border border-dashed border-border rounded-xl">
          No suitable partner matches found for the extracted capability gaps.
        </div>
      )}

      {!loading && !error && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((p: PartnerRecommendationMatch | CitizenPartnerRecommendation) => {
            const isFullMatch = 'factor_scores' in p
            const fullMatch = isFullMatch ? (p as PartnerRecommendationMatch) : null
            const isExpanded = expandedPartner[p.partner_id] || false

            return (
              <div
                key={p.partner_id}
                className="bg-surface-raised/40 border border-border hover:border-border-hover rounded-xl p-4 transition-all space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-primary">
                          {p.organization_name}
                        </h4>
                        {getPartnerTypeBadge(p.partner_type)}
                        {/* Verification Status Flag */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                            p.verification_status === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {p.verification_status === 'verified' ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-amber-500" />
                          )}
                          {p.verification_status === 'verified' ? 'Verified Partner' : 'Demo Profile (Unverified)'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {p.location}
                        </span>
                        <span>•</span>
                        <span className="text-text-secondary font-medium">
                          {p.estimated_support_type}
                        </span>
                        {fullMatch && (
                          <>
                            <span>•</span>
                            <span>Funding: {fullMatch.funding_capacity} (Up to ₹{fullMatch.maximum_project_budget.toLocaleString('en-IN')})</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score & Badge */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-lg font-bold text-text-primary">
                        {p.score.toFixed(1)}
                        <span className="text-xs font-normal text-text-muted">/100</span>
                      </div>
                      <div className="mt-0.5">{getMatchLevelBadge(p.match_level)}</div>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-text-secondary leading-relaxed bg-surface/70 p-2.5 rounded-lg border border-border/60">
                  {p.explanation}
                </p>

                {/* Matched Resources Chips */}
                {p.matched_support_areas && p.matched_support_areas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-medium text-text-muted mr-1">Aligned Assets:</span>
                    {p.matched_support_areas.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        ✓ {area}
                      </span>
                    ))}
                  </div>
                )}

                {/* Missing Support Chips (for non-citizens) */}
                {fullMatch && fullMatch.missing_support_areas && fullMatch.missing_support_areas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-text-muted mr-1">Uncovered Needs:</span>
                    {fullMatch.missing_support_areas.slice(0, 3).map((area, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-text-muted border border-border"
                      >
                        ✗ {area}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable 6-Factor Score Breakdown */}
                {fullMatch && (
                  <div>
                    <button
                      onClick={() => toggleExpand(p.partner_id)}
                      className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline pt-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide scoring breakdown & rationale</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View 6-factor scoring breakdown & rationale</span>
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-3 bg-surface rounded-xl border border-border space-y-3 animate-fade-in text-xs">
                        {/* 6-Factor Chips */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Equipment & Materials (25%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.equipment_and_materials_score}/25.0 pts
                            </span>
                          </div>
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Funding & Budget (20%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.funding_and_budget_score}/20.0 pts
                            </span>
                          </div>
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Domains & Skills (20%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.domain_and_skills_score}/20.0 pts
                            </span>
                          </div>
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Manpower & Operations (15%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.manpower_and_operations_score}/15.0 pts
                            </span>
                          </div>
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Location Relevance (10%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.location_relevance_score}/10.0 pts
                            </span>
                          </div>
                          <div className="p-2 bg-surface-raised/60 rounded-lg border border-border">
                            <span className="text-[10px] text-text-muted block">Experience & Availability (10%)</span>
                            <span className="font-semibold text-text-primary">
                              {fullMatch.factor_scores.experience_and_reliability_score}/10.0 pts
                            </span>
                          </div>
                        </div>

                        {/* Rationale bullet points */}
                        {fullMatch.rationale && fullMatch.rationale.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="font-semibold text-text-secondary block">Explainable Rationale:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-text-muted">
                              {fullMatch.rationale.map((r, rIdx) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Role-based action trigger */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                  {isGovOrAdmin && (
                    <button
                      onClick={() => {
                        setSelectedPartner(fullMatch)
                        setSelectedInterest(null)
                        setModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Nominate Partner</span>
                    </button>
                  )}

                  {isPartner && fullMatch && (
                    <button
                      onClick={() => {
                        setSelectedPartner(fullMatch)
                        setSelectedInterest(null)
                        setModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>Propose Support</span>
                    </button>
                  )}

                  {isCitizen && (
                    <span className="text-[11px] text-text-muted italic">
                      Official collaboration subject to administrative verification.
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Registered Partner Interests Section (Government, Admin, Partner view) */}
      {registeredInterests.length > 0 && !isCitizen && (
        <div className="border-t border-border pt-5 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Submitted Partner Support Proposals ({registeredInterests.length})
          </h4>
          <div className="space-y-2">
            {registeredInterests.map((interest) => (
              <div
                key={interest.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-raised/60 border border-border rounded-xl text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{interest.partner_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface border border-border text-text-secondary">
                      {interest.support_type}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        interest.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : interest.status === 'under_review'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : interest.status === 'rejected'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {interest.status}
                    </span>
                  </div>
                  <p className="text-text-muted mt-1">
                    {interest.notes || 'No remarks specified.'}
                    {interest.proposed_amount ? ` • Proposed: ₹${interest.proposed_amount.toLocaleString('en-IN')}` : ''}
                  </p>
                </div>

                {isGovOrAdmin && (
                  <button
                    onClick={() => {
                      setSelectedPartner(null)
                      setSelectedInterest(interest)
                      setModalOpen(true)
                    }}
                    className="px-3 py-1 bg-surface hover:bg-surface-raised border border-border rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary transition-all shrink-0"
                  >
                    Review / Update Status
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Proposal Modal */}
      {modalOpen && (
        <PartnerSupportInterestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          trackId={trackId}
          partner={selectedPartner}
          existingInterest={selectedInterest}
          userRole={role}
          token={effectiveToken}
          onSuccess={() => {
            fetchMatches()
            if (onInterestSubmitted) {
              onInterestSubmitted()
            }
          }}
        />
      )}
    </div>
  )
}
