import { useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  Eye,
  FileCheck,
  FileText,
  Globe,
  HelpCircle,
  Mail,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  X,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { EmptyState } from '../../components/common/EmptyState'
import { adminOrganizations as initialOrganizations } from '../../data/adminMockData'
import type { AdminOrganization } from '../../types/admin'

const ORG_TABS = [
  'All',
  'Universities',
  'Government Departments',
  'Industry Partners',
  'NGOs',
  'Research Institutions',
] as const

export function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>(initialOrganizations)
  const [activeTab, setActiveTab] = useState<typeof ORG_TABS[number]>('All')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Modals & detail state
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null)
  const [rejectModalOrg, setRejectModalOrg] = useState<AdminOrganization | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [infoModalOrg, setInfoModalOrg] = useState<AdminOrganization | null>(null)
  const [infoQuery, setInfoQuery] = useState('')
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // New organization form state
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgType, setNewOrgType] = useState<AdminOrganization['type']>('Universities')
  const [newOrgContact, setNewOrgContact] = useState('')
  const [newOrgEmail, setNewOrgEmail] = useState('')
  const [newOrgLocation, setNewOrgLocation] = useState('')

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchesTab = activeTab === 'All' || org.type === activeTab
      const matchesSearch =
        search === '' ||
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        org.email.toLowerCase().includes(search.toLowerCase()) ||
        org.location.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'All' || org.verificationStatus === statusFilter

      return matchesTab && matchesSearch && matchesStatus
    })
  }, [organizations, activeTab, search, statusFilter])

  // Handlers
  const handleApprove = (org: AdminOrganization) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === org.id ? { ...o, verificationStatus: 'Verified', documentsStatus: 'Verified' } : o))
    )
    setFeedback(`Organization "${org.name}" has been verified and granted institutional access!`)
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalOrg) return
    setOrganizations((prev) =>
      prev.map((o) => (o.id === rejectModalOrg.id ? { ...o, verificationStatus: 'Rejected' } : o))
    )
    setFeedback(`Verification for "${rejectModalOrg.name}" rejected. Feedback notification sent.`)
    setRejectModalOrg(null)
    setRejectReason('')
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleConfirmRequestInfo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!infoModalOrg) return
    setOrganizations((prev) =>
      prev.map((o) => (o.id === infoModalOrg.id ? { ...o, verificationStatus: 'More Info Required' } : o))
    )
    setFeedback(`Information request sent to ${infoModalOrg.contactPerson}. Status updated to "More Info Required".`)
    setInfoModalOrg(null)
    setInfoQuery('')
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim() || !newOrgContact.trim()) return

    const created: AdminOrganization = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      type: newOrgType,
      contactPerson: newOrgContact.trim(),
      email: newOrgEmail.trim() || 'contact@org.gov.in',
      registrationDate: 'Just now',
      verificationStatus: 'Verified',
      documentsStatus: 'Submitted',
      location: newOrgLocation.trim() || 'India',
      website: 'https://org.gov.in',
      legalId: `REG-${Date.now()}`,
    }

    setOrganizations([created, ...organizations])
    setAddOrgModalOpen(false)
    setNewOrgName('')
    setNewOrgContact('')
    setNewOrgEmail('')
    setNewOrgLocation('')
    setFeedback(`Organization "${created.name}" created and verified.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="Organizations">
      <AdminPage
        title="Organizations"
        description="Verify credentials and authorize institutions, directorates, and partners."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Organizations' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setAddOrgModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Plus size={14} />
            Register Organization
          </button>
        }
      >
        <div className="space-y-6">
          {/* Feedback banner */}
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Organization Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {ORG_TABS.map((tab) => {
              const count =
                tab === 'All'
                  ? organizations.length
                  : organizations.filter((o) => o.type === tab).length

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === tab
                      ? 'bg-[#12365a] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>

          {/* Search and Filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search organizations by title, contact lead, email, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label className="font-semibold text-slate-500 whitespace-nowrap">Verification Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending Review</option>
                  <option value="More Info Required">More Info Required</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {(search || statusFilter !== 'All') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('All')
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw size={12} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Organization Verification Table */}
          {filteredOrgs.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No organizations found"
              description="No registered organizations match the selected criteria."
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Organization Name</th>
                      <th className="px-4 py-3">Sector / Type</th>
                      <th className="px-4 py-3">Contact Lead</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3">Documents</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrgs.map((org) => {
                      const isPending = org.verificationStatus === 'Pending'
                      const isMoreInfo = org.verificationStatus === 'More Info Required'

                      return (
                        <tr key={org.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-800">{org.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {org.location}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                              {org.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-medium text-slate-800">{org.contactPerson}</p>
                            <p className="text-[10px] text-slate-400">{org.email}</p>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                            {org.registrationDate}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                org.verificationStatus === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : org.verificationStatus === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : org.verificationStatus === 'More Info Required'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {org.verificationStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                                org.documentsStatus === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : org.documentsStatus === 'Submitted'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {org.documentsStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedOrg(org)}
                                className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                <Eye size={12} />
                                View Details
                              </button>

                              {(isPending || isMoreInfo) && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(org)}
                                    className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                                  >
                                    <CheckCircle2 size={12} />
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectModalOrg(org)}
                                    className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                  >
                                    <XCircle size={12} />
                                    Reject
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setInfoModalOrg(org)}
                                    className="inline-flex items-center gap-1 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                                  >
                                    <HelpCircle size={12} />
                                    Request Info
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 1. View Organization Details Modal */}
        {selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedOrg(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="grid size-12 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Building2 size={24} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                      {selectedOrg.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {selectedOrg.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} /> {selectedOrg.location}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium">Verification Status</span>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedOrg.verificationStatus}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Documents Audit</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{selectedOrg.documentsStatus}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Legal Registration ID</span>
                    <p className="font-mono text-slate-800 mt-0.5">{selectedOrg.legalId ?? 'GOV-REG-2025'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Registration Date</span>
                    <p className="font-medium text-slate-800 mt-0.5">{selectedOrg.registrationDate}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <p className="font-bold text-slate-700">Official Contact Person & Coordinates:</p>
                  <p className="text-slate-800 font-medium">{selectedOrg.contactPerson}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail size={12} /> {selectedOrg.email}
                  </p>
                  {selectedOrg.website && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Globe size={12} /> {selectedOrg.website}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <p className="font-bold text-slate-700 mb-1.5">Submitted Compliance Artifacts:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-[11px]">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <FileText size={13} className="text-[#187e8d]" />
                        Official Institution Recognition & Charter.pdf
                      </span>
                      <span className="text-emerald-700 font-bold">Verified</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-[11px]">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <FileCheck size={13} className="text-[#187e8d]" />
                        Authorized Signatory Authorization Letter.pdf
                      </span>
                      <span className="text-emerald-700 font-bold">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Reject Verification Modal */}
        {rejectModalOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setRejectModalOrg(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <h3 className="font-[Manrope] text-lg font-bold text-rose-900">
                Reject Organization Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please provide the regulatory or compliance reason for rejecting{' '}
                <strong>{rejectModalOrg.name}</strong>.
              </p>

              <form onSubmit={handleConfirmReject} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Rejection Reason</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Missing valid GST/PAN certificate or mismatch in authorized representative credentials..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOrg(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Request More Information Modal */}
        {infoModalOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setInfoModalOrg(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Request Additional Documentation
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Notify <strong>{infoModalOrg.contactPerson}</strong> regarding required filings or clarification.
              </p>

              <form onSubmit={handleConfirmRequestInfo} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Inquiry & Required Documents</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Please upload the certified copy of your 80G tax exemption and annual balance sheet for fiscal year 2025..."
                    value={infoQuery}
                    onChange={(e) => setInfoQuery(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInfoModalOrg(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Dispatch Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 4. Register Organization Modal */}
        {addOrgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAddOrgModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Register New Organization
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard a university, government agency, or corporate partner.
              </p>

              <form onSubmit={handleCreateOrg} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indian Institute of Science (IISc)"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Sector / Type</label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as AdminOrganization['type'])}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  >
                    {ORG_TABS.filter((t) => t !== 'All').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Primary Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. G. Narayanan (Dean)"
                    value={newOrgContact}
                    onChange={(e) => setNewOrgContact(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700">Official Email</label>
                    <input
                      type="email"
                      required
                      placeholder="dean@iisc.ac.in"
                      value={newOrgEmail}
                      onChange={(e) => setNewOrgEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Location (City, State)</label>
                    <input
                      type="text"
                      placeholder="Bengaluru, KA"
                      value={newOrgLocation}
                      onChange={(e) => setNewOrgLocation(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddOrgModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Register & Verify
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
