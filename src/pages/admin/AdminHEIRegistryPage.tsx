import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  GraduationCap,
  CheckCircle2,
  MapPin,
  Search,
  RefreshCw,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { EmptyState } from '../../components/common/EmptyState'
import { universities as defaultUniversities } from '../../data/universities'
import type { University } from '../../types'
import type { AdminOrganization } from '../../types/admin'

interface BackendHEIRecord {
  hei_id: string
  name: string
  district: string
  state: string
  institution_type: string
  departments?: string[]
  available_skills?: string[]
  technical_domains?: string[]
  laboratories?: string[]
  equipment?: string[]
  software_tools?: string[]
  project_experience?: {
    completed_civic_projects?: number
    active_projects?: number
    complexity_level?: string
    [key: string]: unknown
  }
  available_faculty_capacity?: number
  verification_status?: string
  contact_email?: string | null
}

const DEAN_CONTACTS: Record<string, string> = {
  'bit-mesra': 'Dr. Ramesh Chandra (Dean of R&D)',
  'bau-ranchi': 'Dr. A.K. Sarkar (Dean of Agriculture)',
  'cuj-ranchi': 'Prof. Manoj Kumar (Dean of Academics)',
  'coep-pune': 'Dr. Arjun Menon (Dean of Innovation)',
  'gujarat-university': 'Prof. Himanshu Pandya (Director of R&D)',
  'iisc-bengaluru': 'Prof. Rajesh Sundaresan (Dean of Research)',
  'iit-ism-dhanbad': 'Prof. Sagar Pal (Dean of R&D)',
  'iit-bhubaneswar': 'Prof. P.R. Sahu (Dean of Academic Affairs)',
  'iit-delhi': 'Prof. Ambuj Sagar (Dean of Corporate Relations & R&D)',
  'iit-madras': 'Prof. Manu Santhanam (Dean of IC&SR)',
  'iiit-hyderabad': 'Prof. P.J. Narayanan (Dean of R&D)',
  'jadavpur-kolkata': 'Prof. Chiranjib Bhattacharjee (Dean of Engineering)',
  'nit-jamshedpur': 'Dr. R.V. Sharma (Dean of Academic Affairs)',
  'nit-surathkal': 'Dr. Meera Nair (Head, Telemetry Research)',
  'symbiosis-design': 'Dr. Sanjeevani Ayachit (Director & Academic Dean)',
  'tiss-mumbai': 'Prof. Shalini Bharat (Director & Dean)',
  'uas-dharwad': 'Dr. P.L. Patil (Director of Research)',
}

function mapUniversityToAdminOrg(
  uni: University,
  live?: BackendHEIRecord
): AdminOrganization {
  const isVerified =
    live?.verification_status?.toLowerCase() === 'verified' ||
    (!live && uni.verified && uni.verification_status?.toLowerCase() === 'verified')

  const deanContact =
    DEAN_CONTACTS[uni.id] ||
    (uni.hei_id ? DEAN_CONTACTS[uni.hei_id] : undefined) ||
    'Dean of Academic Research & Innovation'

  const location =
    live?.district && live?.state
      ? `${live.district}, ${live.state}`
      : uni.location || `${uni.district}, ${uni.state}`

  const stateCode = (uni.state || live?.state || 'JH').slice(0, 2).toUpperCase()
  const cleanId = uni.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const legalId = `HEI-${stateCode}-${cleanId}-2025`

  return {
    id: uni.id,
    name: live?.name || uni.name,
    type: (live?.institution_type || uni.institution_type || 'Universities') as AdminOrganization['type'],
    contactPerson: deanContact,
    email: live?.contact_email || uni.contact_email || `rnd@${uni.id}.ac.in`,
    registrationDate: '10 Jan 2025',
    verificationStatus: (isVerified ? 'Verified' : 'Pending') as AdminOrganization['verificationStatus'],
    documentsStatus: (isVerified ? 'Verified' : 'Submitted') as AdminOrganization['documentsStatus'],
    location,
    website: `https://${uni.id}.ac.in`,
    legalId,
  }
}

export function AdminHEIRegistryPage() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>(() =>
    defaultUniversities.map((u) => mapUniversityToAdminOrg(u))
  )
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedOrg, setSelectedOrg] = useState<AdminOrganization | null>(null)

  // Fetch real HEI registry records from existing backend database API
  const fetchRegistry = useCallback(async () => {
    setIsLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'
      const res = await fetch(`${apiBase}/api/reports/heis/registry`)
      if (!res.ok) return

      const backendHEIs: BackendHEIRecord[] = await res.json()
      if (!Array.isArray(backendHEIs) || backendHEIs.length === 0) return

      const backendMap = new Map(backendHEIs.map((h) => [h.hei_id, h]))

      const mappedList: AdminOrganization[] = defaultUniversities.map((uni) => {
        const live = backendMap.get(uni.id) || backendMap.get(uni.hei_id || '')
        return mapUniversityToAdminOrg(uni, live)
      })

      backendHEIs.forEach((live) => {
        if (!mappedList.some((m) => m.id === live.hei_id)) {
          const isVerified = live.verification_status?.toLowerCase() === 'verified'
          const deanContact =
            DEAN_CONTACTS[live.hei_id] || 'Dean of Academic Research & Innovation'
          mappedList.push({
            id: live.hei_id,
            name: live.name,
            type: (live.institution_type || 'Universities') as AdminOrganization['type'],
            contactPerson: deanContact,
            email: live.contact_email || `rnd@${live.hei_id}.ac.in`,
            registrationDate: '10 Jan 2025',
            verificationStatus: (isVerified ? 'Verified' : 'Pending') as AdminOrganization['verificationStatus'],
            documentsStatus: (isVerified ? 'Verified' : 'Submitted') as AdminOrganization['documentsStatus'],
            location: `${live.district}, ${live.state}`,
            website: `https://${live.hei_id}.ac.in`,
            legalId: `HEI-${live.state.slice(0, 2).toUpperCase()}-${live.hei_id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-2025`,
          })
        }
      })

      setOrganizations(mappedList)
    } catch {
      // Keep initial mapped default list if backend is unreachable
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistry()
  }, [fetchRegistry])

  const filteredHEIs = useMemo(() => {
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
    setFeedback(`HEI Accreditation for "${org.name}" verified and authorized for university project matching.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="HEI Registry">
      <AdminPage
        title="HEI Registry"
        description="Authorize accredited universities and technical institutes to collaborate on projects."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'HEI Registry' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#e8f5f5] px-3 py-1.5 text-xs font-bold text-[#187e8d]">
              {filteredHEIs.length} Accredited HEIs
            </span>
            <button
              type="button"
              onClick={fetchRegistry}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              title="Reload HEI profiles from backend"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#187e8d]' : 'text-slate-600'} />
              <span>{isLoading ? 'Syncing...' : 'Sync Registry'}</span>
            </button>
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
                placeholder="Search HEI by name, faculty dean, or campus location..."
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

          {/* Table of HEIs */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="p-4">Institution Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Campus Location</th>
                  <th className="p-4">Dean / Contact</th>
                  <th className="p-4">Accreditation</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHEIs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-8 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]">
                          <GraduationCap size={16} />
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
                            Verify HEI
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

            {filteredHEIs.length === 0 && (
              <div className="p-12 text-center">
                <EmptyState
                  icon={GraduationCap}
                  title="No institutions match search"
                  description="Try adjusting your search criteria."
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
                  <GraduationCap className="text-[#187e8d]" />
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
                <p><strong>Location:</strong> {selectedOrg.location}</p>
                <p><strong>Institutional ID:</strong> {selectedOrg.legalId}</p>
                <p><strong>Dean / Contact:</strong> {selectedOrg.contactPerson} ({selectedOrg.email})</p>
                <p><strong>Verification Status:</strong> {selectedOrg.verificationStatus}</p>
                <p><strong>Documents:</strong> {selectedOrg.documentsStatus}</p>
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
