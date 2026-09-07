import { useState, type FormEvent } from 'react'
import { CheckCircle2, HeartHandshake, X } from 'lucide-react'
import type { PartnerProject, PartnerCollaborationRequest } from '../../types'

const CONTRIBUTION_TYPES = [
  'Technical Expertise',
  'Funding',
  'Equipment',
  'Software',
  'Mentorship',
  'Data',
  'Infrastructure',
  'Field Support',
  'Training',
]

interface ExpressInterestModalProps {
  open: boolean
  project: PartnerProject | null
  onClose: () => void
  onSubmit: (newRequest: PartnerCollaborationRequest) => void
}

export function ExpressInterestModal({
  open,
  project,
  onClose,
  onSubmit,
}: ExpressInterestModalProps) {
  const [contributionType, setContributionType] = useState('Technical Expertise')
  const [proposedContribution, setProposedContribution] = useState('')
  const [availableTimeline, setAvailableTimeline] = useState('Immediate / Next 3 Months')
  const [contactPerson, setContactPerson] = useState('Karan Patel (Director of Strategic Partnerships)')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!open || !project) return null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!proposedContribution.trim()) return

    const newRequest: PartnerCollaborationRequest = {
      id: `pr-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      university: project.university,
      facultyLead: project.facultyLead,
      requestType: 'Support Offer',
      requestedSupport: contributionType,
      contribution: proposedContribution,
      timeline: availableTimeline,
      contactPerson,
      message: message || `We would like to support ${project.title} with our ${contributionType.toLowerCase()} resources.`,
      requestDate: 'Just now',
      status: 'Pending Review',
    }

    onSubmit(newRequest)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={32} />
            </span>
            <h3 className="mt-4 font-[Manrope] text-xl font-bold text-[#13243b]">
              Interest Expressed Successfully!
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your collaboration offer has been logged as <strong>&ldquo;Pending Review&rdquo;</strong> and sent to {project.facultyLead} at {project.university}.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                <HeartHandshake size={20} />
              </span>
              <div>
                <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                  Express Interest in Project
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  {project.title} · {project.university}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Contribution Type</label>
                <select
                  value={contributionType}
                  onChange={(e) => setContributionType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  {CONTRIBUTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Proposed Contribution Details <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2 IoT firmware mentors (40 hrs) + 10 test sensors"
                  value={proposedContribution}
                  onChange={(e) => setProposedContribution(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Available Timeline</label>
                  <input
                    type="text"
                    value={availableTimeline}
                    onChange={(e) => setAvailableTimeline(e.target.value)}
                    placeholder="e.g. Q4 2026 / 3 Months"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Partner Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Additional Message to Faculty & Student Team
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain how your organization can add value or mention specific capabilities you would like to pair on..."
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="rounded-lg bg-amber-50/70 border border-amber-200/60 p-3 text-[11px] text-amber-800">
                <strong>Notice:</strong> Your initial expression of interest will create a <em>Pending Review</em> request. The university lead will review your submission before scheduling alignment discussions.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Submit Collaboration Request
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
