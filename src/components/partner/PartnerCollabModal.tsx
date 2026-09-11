import { useState, useEffect } from 'react'
import { Handshake, AlertCircle, X, Info } from 'lucide-react'
import { Modal } from '../common/Modal'
import { usePartner, type PartnerSupportType, type PartnershipStatus } from '../../context/PartnerContext'
import { useAuth } from '../../context/AuthContext'
import type { BackendReportResponse } from '../../services/reportService'

interface PartnerCollabModalProps {
  report: BackendReportResponse | null
  isOpen: boolean
  onClose: () => void
  onSaved?: (trackId: string) => void
}

const SUPPORT_TYPES: PartnerSupportType[] = [
  'Funding',
  'Technical Support',
  'Equipment',
  'Mentorship',
  'Volunteers',
  'Research Support',
  'Awareness Campaign',
  'Other',
]

const PARTNERSHIP_STATUSES: PartnershipStatus[] = [
  'Discussion Started',
  'Support Confirmed',
  'In Progress',
  'Completed',
]

export function PartnerCollabModal({
  report,
  isOpen,
  onClose,
  onSaved,
}: PartnerCollabModalProps) {
  const { currentUser } = useAuth()
  const { getProject, savePartnership, addToSupported } = usePartner()

  const [organizationName, setOrganizationName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [supportType, setSupportType] = useState<PartnerSupportType>('Funding')
  const [supportCommitment, setSupportCommitment] = useState('')
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus>('Support Confirmed')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const existingProject = report ? getProject(report.track_id) : undefined
  const existingCollab = existingProject?.partnership

  useEffect(() => {
    if (existingCollab) {
      setOrganizationName(existingCollab.organizationName || '')
      setContactPerson(existingCollab.contactPerson || '')
      setContactEmail(existingCollab.contactEmail || '')
      setSupportType(existingCollab.supportType || 'Funding')
      setSupportCommitment(existingCollab.supportCommitment || '')
      setPartnershipStatus(existingProject?.status || 'Support Confirmed')
      setNotes(existingCollab.notes || '')
    } else {
      setOrganizationName(currentUser?.organization || 'Tata Steel CSR Foundation')
      setContactPerson(currentUser?.name || 'Karan Patel')
      setContactEmail(currentUser?.email || 'partner@impactforge.org')
      setSupportType('Funding')
      setSupportCommitment('₹5,00,000 Grant for implementation pilot')
      setPartnershipStatus('Support Confirmed')
      setNotes('')
    }
    setError(null)
  }, [existingCollab, existingProject, currentUser, report, isOpen])

  if (!report) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!organizationName.trim()) {
      setError('Organization name is required.')
      return
    }
    if (!contactPerson.trim()) {
      setError('Contact person name is required.')
      return
    }
    if (!contactEmail.trim()) {
      setError('Contact email is required.')
      return
    }
    if (!supportCommitment.trim()) {
      setError('Support commitment is required (e.g. funding amount or equipment description).')
      return
    }

    // Ensure it's in supported projects
    addToSupported(report.track_id)

    // Save partnership details
    savePartnership(
      report.track_id,
      {
        organizationName: organizationName.trim(),
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        supportType,
        supportCommitment: supportCommitment.trim(),
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      },
      partnershipStatus
    )

    if (onSaved) {
      onSaved(report.track_id)
    }
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Partner Collaboration & Support Offer"
    >
      <div className="space-y-4">
        {/* Problem Header Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-[#187e8d]">{report.track_id}</span>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">
              {report.category}
            </span>
          </div>
          <h4 className="mt-1.5 font-[Manrope] text-sm font-bold text-[#13243b]">
            {report.problem_title}
          </h4>
          <p className="mt-1 text-slate-500">
            {report.district}, {report.locality}
          </p>
        </div>

        {/* Client-Side Notice as per Requirement 7 */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3.5 text-xs text-teal-950">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 shrink-0 text-[#187e8d]" />
            <p className="text-[11px] leading-relaxed text-teal-900">
              Partner collaboration data is currently stored in browser storage for this MVP. Backend persistence can be added later.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="partner-org" className="mb-1 block text-xs font-bold text-slate-700">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                id="partner-org"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Tata Steel CSR / UNICEF Jharkhand"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
                required
              />
            </div>

            <div>
              <label htmlFor="partner-contact" className="mb-1 block text-xs font-bold text-slate-700">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                id="partner-contact"
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Karan Patel"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="partner-email" className="mb-1 block text-xs font-bold text-slate-700">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="partner-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. partner@impactforge.org"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
                required
              />
            </div>

            <div>
              <label htmlFor="partner-support-type" className="mb-1 block text-xs font-bold text-slate-700">
                Support Type <span className="text-red-500">*</span>
              </label>
              <select
                id="partner-support-type"
                value={supportType}
                onChange={(e) => setSupportType(e.target.value as PartnerSupportType)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              >
                {SUPPORT_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="partner-status" className="mb-1 block text-xs font-bold text-slate-700">
              Partnership Status
            </label>
            <select
              id="partner-status"
              value={partnershipStatus}
              onChange={(e) => setPartnershipStatus(e.target.value as PartnershipStatus)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
            >
              {PARTNERSHIP_STATUSES.map((ps) => (
                <option key={ps} value={ps}>
                  {ps}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="partner-commitment" className="mb-1 block text-xs font-bold text-slate-700">
              Support Commitment Details <span className="text-red-500">*</span>
            </label>
            <input
              id="partner-commitment"
              type="text"
              value={supportCommitment}
              onChange={(e) => setSupportCommitment(e.target.value)}
              placeholder="e.g. ₹5,00,000 funding, 50 solar pump sets, technical advisory"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div>
            <label htmlFor="partner-notes" className="mb-1 block text-xs font-bold text-slate-700">
              Partnership Notes / Scope of Support (Optional)
            </label>
            <textarea
              id="partner-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Willing to co-fund with district administration and provide mentorship for HEI engineering students."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <X size={13} className="inline mr-1" />
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
            >
              <Handshake size={14} />
              <span>{existingCollab ? 'Update Commitment' : 'Confirm Partnership'}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
