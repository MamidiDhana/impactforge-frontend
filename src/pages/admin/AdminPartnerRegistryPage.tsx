import { useMemo, useState } from 'react'
import {
  Handshake,
  CheckCircle2,
  MapPin,
  Search,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { EmptyState } from '../../components/common/EmptyState'
import { adminOrganizations as initialOrganizations } from '../../data/adminMockData'
import type { AdminOrganization } from '../../types/admin'

export function AdminPartnerRegistryPage() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>(() =>
    initialOrganizations.filter(
      (org) => org.type === 'Industry Partners' || org.type === 'NGOs'
    )
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null)

  const filteredPartners = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        search === '' ||
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        org.location.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || org.verificationStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [organizations, search, statusFilter])

  const handleApprove = (org: AdminOrganization) => {
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === org.id
          ? { ...o, verificationStatus: 'Verified', documentsStatus: 'Verified' }
          : o
      )
    )
    setFeedback(`Partner "${org.name}" authorized for CSR funding and resource sponsorship.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="Partner Registry">
      <AdminPage
        title="Partner Registry"
        description="Verify CSR entities and partners authorized to contribute funding and resources."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Partner Registry' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700">
              {filteredPartners.length} Active Partners
            </span>
          </div>
        }
      >
        <div className="space-y-6">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
            >
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partner by name, CSR director, or headquarters..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-xs font-medium text-slate-800 focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Review</option>
                <option value="More Info Required">More Info Required</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table of Partners */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Partner Entity</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">CSR Lead / Contact</th>
                  <th className="p-4">Compliance</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-lg bg-purple-50 text-purple-700">
                          <Handshake size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-[#13243b]">{org.name}</p>
                          <p className="text-[11px] text-slate-400">{org.legalId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">{org.type}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{org.location}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{org.contactPerson}</p>
                      <p className="text-[11px] text-slate-400">{org.email}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          org.verificationStatus === 'Verified'
                            ? 'bg-emerald-50 text-emerald-700'
                            : org.verificationStatus === 'Rejected'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {org.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {org.verificationStatus !== 'Verified' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(org)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            Verify Partner
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedOrg(org)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPartners.length === 0 && (
              <div className="p-12 text-center">
                <EmptyState
                  icon={Handshake}
                  title="No partner entities match search"
                  description="Try adjusting your filter criteria."
                />
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {selectedOrg && (
          <div
            role="dialog"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Handshake className="text-purple-600" />
                  <h3 className="font-bold text-[#13243b] text-base">{selectedOrg.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <p><strong>Type:</strong> {selectedOrg.type}</p>
                <p><strong>HQ Location:</strong> {selectedOrg.location}</p>
                <p><strong>Corporate / Legal Registration:</strong> {selectedOrg.legalId}</p>
                <p><strong>CSR Representative:</strong> {selectedOrg.contactPerson} ({selectedOrg.email})</p>
                <p><strong>Status:</strong> {selectedOrg.verificationStatus}</p>
                <p><strong>Compliance Documentation:</strong> {selectedOrg.documentsStatus}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
