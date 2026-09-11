import React, { useState } from 'react'
import {
  X,
  Building2,
  Handshake,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import {
  submitPartnerInterest,
  updatePartnerInterest,
  type PartnerRecommendationMatch,
  type PartnerInterestRecord,
} from '../../services/reportService'

interface PartnerSupportInterestModalProps {
  isOpen: boolean
  onClose: () => void
  trackId: string
  partner?: PartnerRecommendationMatch | null
  existingInterest?: PartnerInterestRecord | null
  userRole?: string
  token?: string
  onSuccess?: () => void
}

export const PartnerSupportInterestModal: React.FC<PartnerSupportInterestModalProps> = ({
  isOpen,
  onClose,
  trackId,
  partner,
  existingInterest,
  userRole = 'partner',
  token,
  onSuccess,
}) => {
  const isGovOrAdmin = userRole === 'government' || userRole === 'admin'
  const isEditing = Boolean(existingInterest)

  const [supportType, setSupportType] = useState<string>(
    existingInterest?.support_type || partner?.estimated_support_type || 'equipment'
  )
  const [proposedAmount, setProposedAmount] = useState<string>(
    existingInterest?.proposed_amount ? String(existingInterest.proposed_amount) : ''
  )
  const [proposedResources, setProposedResources] = useState<string>(
    existingInterest?.proposed_resources?.join(', ') ||
      partner?.matched_support_areas?.slice(0, 3).join(', ') ||
      ''
  )
  const [notes, setNotes] = useState<string>(existingInterest?.notes || '')
  const [status, setStatus] = useState<string>(existingInterest?.status || 'proposed')

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const resourcesList = proposedResources
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0)

      const numericAmount = proposedAmount ? parseFloat(proposedAmount) : 0.0

      if (isEditing && existingInterest) {
        // Update existing interest
        await updatePartnerInterest(
          trackId,
          existingInterest.id,
          {
            status: isGovOrAdmin ? status : undefined,
            proposed_amount: numericAmount,
            proposed_resources: resourcesList,
            notes,
          },
          token
        )
        setSuccessMessage('Partner support proposal updated successfully.')
      } else {
        // Create new interest / nomination
        const targetPartnerId = partner?.partner_id || existingInterest?.partner_id
        if (!targetPartnerId) {
          throw new Error('Partner identifier is missing.')
        }

        await submitPartnerInterest(
          trackId,
          {
            partner_id: targetPartnerId,
            support_type: supportType,
            proposed_amount: numericAmount,
            proposed_resources: resourcesList,
            notes,
          },
          token
        )
        setSuccessMessage('Partner support proposal recorded successfully.')
      }

      if (onSuccess) {
        onSuccess()
      }
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Failed to submit partner interest.')
    } finally {
      setLoading(false)
    }
  }

  const partnerDisplayName =
    existingInterest?.partner_name ||
    partner?.organization_name ||
    'Selected Industry/CSR Partner'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-raised/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {isEditing
                  ? 'Review Partner Support Proposal'
                  : isGovOrAdmin
                  ? 'Nominate / Recommend Partner'
                  : 'Propose Partner Support'}
              </h3>
              <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-text-muted" />
                <span className="font-medium text-text-secondary truncate max-w-xs">
                  {partnerDisplayName}
                </span>
                <span className="text-text-muted">• {trackId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Support Type */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Support Mode / Type
            </label>
            <select
              value={supportType}
              onChange={(e) => setSupportType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            >
              <option value="equipment">Heavy Machinery & Equipment Rental/Supply</option>
              <option value="materials">Raw Materials & Physical Consumables</option>
              <option value="funding">CSR Financial Grant & Co-Funding</option>
              <option value="manpower">Operational Personnel & Contracted Labor</option>
              <option value="technical_advisory">Technical Advisory & Project Oversight</option>
              <option value="comprehensive">Comprehensive (Equipment + Materials + Funding)</option>
            </select>
          </div>

          {/* Proposed Budget Amount */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Proposed Funding / Co-Grant (₹ INR, Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted">₹</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 150000"
                value={proposedAmount}
                onChange={(e) => setProposedAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Indicative co-funding or grant support. Does not trigger automatic capital transfer.
            </p>
          </div>

          {/* Proposed Resources */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Offered Resources / Machinery / Materials (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Dewatering Pump, Backhoe Loader, Cement PSC"
              value={proposedResources}
              onChange={(e) => setProposedResources(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Government / Admin Status Review */}
          {isGovOrAdmin && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Administrative Proposal Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              >
                <option value="proposed">Proposed (Pending Review)</option>
                <option value="under_review">Under Official Evaluation</option>
                <option value="approved">Approved for Collaboration Coordination</option>
                <option value="rejected">Declined / Incompatible</option>
              </select>
            </div>
          )}

          {/* Remarks / Justification Notes */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Collaboration Notes / Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Specify mobilization timelines, logistics conditions, or coordination remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Advisory Notice */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              <strong>Advisory Governance:</strong> Partner matching proposals and administrative
              endorsements are advisory. They do not alter report resolution status or execute binding
              contracts without official multi-party sign-off.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-raised rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Updates' : isGovOrAdmin ? 'Submit Recommendation' : 'Submit Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
