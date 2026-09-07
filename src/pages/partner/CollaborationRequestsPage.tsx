import { useMemo, useState } from 'react'
import {
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  Handshake,
  HelpCircle,
  MessageSquare,
  Search,
  User,
  X,
} from 'lucide-react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { CollaborationRequestCard } from '../../components/partner/CollaborationRequestCard'
import { PartnerStatusBadge } from '../../components/partner/PartnerStatusBadge'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { partnerRequests as initialRequests } from '../../data/partnerRequests'
import type { PartnerCollaborationRequest, CollaborationRequestStatus } from '../../types'

export function CollaborationRequestsPage() {
  const [requests, setRequests] = useState<PartnerCollaborationRequest[]>(initialRequests)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [activeTab, setActiveTab] = useState<'All' | 'Incoming' | 'Outgoing'>('All')

  // Modals & confirmation state
  const [selectedRequest, setSelectedRequest] = useState<PartnerCollaborationRequest | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  // Filtered list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        search === '' ||
        req.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
        req.university.toLowerCase().includes(search.toLowerCase()) ||
        req.facultyLead.toLowerCase().includes(search.toLowerCase()) ||
        req.requestedSupport.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' ||
        req.status === statusFilter ||
        (statusFilter === 'Pending Review' && (req.status === 'Sent' || req.status === 'Under Review' || req.status === 'Pending Review'))

      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Incoming' && req.requestType === 'Incoming Request') ||
        (activeTab === 'Outgoing' && req.requestType !== 'Incoming Request')

      return matchesSearch && matchesStatus && matchesTab
    })
  }, [requests, search, statusFilter, activeTab])

  const updateRequestStatus = (id: string, newStatus: CollaborationRequestStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }

  const handleView = (req: PartnerCollaborationRequest) => {
    setSelectedRequest(req)
    setViewModalOpen(true)
  }

  const handleAccept = (req: PartnerCollaborationRequest) => {
    updateRequestStatus(req.id, 'Accepted')
    setFeedback(`Collaboration request for "${req.projectTitle}" accepted. Team partnership initiated.`)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleInitiateReject = (req: PartnerCollaborationRequest) => {
    setSelectedRequest(req)
    setRejectConfirmOpen(true)
  }

  const handleConfirmReject = () => {
    if (!selectedRequest) return
    updateRequestStatus(selectedRequest.id, 'Rejected')
    setRejectConfirmOpen(false)
    setFeedback(`Collaboration request for "${selectedRequest.projectTitle}" has been rejected.`)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleInitiateCancel = (req: PartnerCollaborationRequest) => {
    setSelectedRequest(req)
    setCancelConfirmOpen(true)
  }

  const handleConfirmCancel = () => {
    if (!selectedRequest) return
    updateRequestStatus(selectedRequest.id, 'Withdrawn')
    setCancelConfirmOpen(false)
    setFeedback(`Your request for "${selectedRequest.projectTitle}" was successfully cancelled/withdrawn.`)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleRequestMoreInfo = (req: PartnerCollaborationRequest) => {
    setSelectedRequest(req)
    setInfoModalOpen(true)
  }

  const handleSendMoreInfoRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return
    updateRequestStatus(selectedRequest.id, 'More Information Required')
    setInfoModalOpen(false)
    setInfoMessage('')
    setFeedback(`Clarification request sent to ${selectedRequest.facultyLead}. Request status updated to "More Information Required".`)
    setTimeout(() => setFeedback(null), 5000)
  }

  return (
    <PartnerLayout title="Requests">
      <PartnerPage
        title="Requests"
        description="Review incoming support queries and track partnership offers."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Requests' },
        ]}
      >
        <div className="space-y-6">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Top navigation tabs and filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                {(['All', 'Incoming', 'Outgoing'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      activeTab === tab
                        ? 'bg-[#12365a] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'All' ? 'All Requests' : tab === 'Incoming' ? 'Incoming from HEIs' : 'Our Support Offers'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{filteredRequests.length} requests matching</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by project title, university, faculty lead, or support type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="More Information Required">More Info Required</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected / Withdrawn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Request Cards List */}
          {filteredRequests.length > 0 ? (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <CollaborationRequestCard
                  key={request.id}
                  request={request}
                  onView={handleView}
                  onAccept={handleAccept}
                  onReject={handleInitiateReject}
                  onRequestMoreInfo={handleRequestMoreInfo}
                  onCancel={handleInitiateCancel}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Handshake}
              title="No collaboration requests found"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('All')
                    setActiveTab('All')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <Filter size={14} />
                  Reset Filters
                </button>
              }
            />
          )}
        </div>

        {/* View Request Details Modal */}
        {viewModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 pr-6">
                <div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {selectedRequest.requestType ?? 'Collaboration Offer'}
                  </span>
                  <h3 className="mt-1.5 font-[Manrope] text-lg font-bold text-[#13243b]">
                    {selectedRequest.projectTitle}
                  </h3>
                </div>
                <PartnerStatusBadge status={selectedRequest.status} />
              </div>

              <div className="mt-5 space-y-3.5 text-xs text-slate-600">
                <div className="grid gap-3 sm:grid-cols-2 rounded-lg bg-slate-50 p-3.5">
                  <div>
                    <p className="font-semibold text-slate-400">Host University</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Building2 size={13} className="text-[#187e8d]" />
                      {selectedRequest.university}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400">Faculty Lead</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <User size={13} />
                      {selectedRequest.facultyLead}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-400">Requested Support Area</p>
                  <p className="text-slate-800 font-bold mt-0.5">{selectedRequest.requestedSupport}</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-400">Proposed Resource / Contribution</p>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedRequest.contribution}</p>
                </div>

                {selectedRequest.timeline && (
                  <div>
                    <p className="font-semibold text-slate-400">Projected Timeline</p>
                    <p className="text-slate-800 font-medium mt-0.5">{selectedRequest.timeline}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-slate-400">Submission Note / Message</p>
                  <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-slate-700 leading-relaxed">
                    {selectedRequest.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 pt-2">
                  <Calendar size={13} />
                  <span>Submitted on {selectedRequest.requestDate}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Request Confirmation Dialog */}
        <ConfirmDialog
          open={rejectConfirmOpen}
          title="Reject Collaboration Request?"
          description={`Are you sure you want to reject the collaboration request for "${selectedRequest?.projectTitle}"? The university team will be notified.`}
          destructive
          confirmLabel="Reject Request"
          onCancel={() => setRejectConfirmOpen(false)}
          onConfirm={handleConfirmReject}
        />

        {/* Cancel/Withdraw Request Confirmation Dialog */}
        <ConfirmDialog
          open={cancelConfirmOpen}
          title="Cancel Collaboration Offer?"
          description={`Are you sure you want to cancel and withdraw your proposed support offer for "${selectedRequest?.projectTitle}"?`}
          destructive
          confirmLabel="Withdraw Request"
          onCancel={() => setCancelConfirmOpen(false)}
          onConfirm={handleConfirmCancel}
        />

        {/* Request More Information Modal */}
        {infoModalOpen && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setInfoModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                  <HelpCircle size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Request More Information
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-sm">
                    {selectedRequest.projectTitle} · {selectedRequest.facultyLead}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendMoreInfoRequest} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Specify what additional details or documents are needed:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={infoMessage}
                    onChange={(e) => setInfoMessage(e.target.value)}
                    placeholder="e.g. Please clarify the planned timeline for Phase 2 hardware fabrication, or provide the preliminary sensor telemetry payload structure..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInfoModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <MessageSquare size={13} />
                    Send Request to Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PartnerPage>
    </PartnerLayout>
  )
}