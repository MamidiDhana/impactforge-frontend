import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Layers,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { ResourceCard } from '../../components/partner/ResourceCard'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { partnerResources as initialResources } from '../../data/partnerResources'
import type { PartnerResource } from '../../types'

const RESOURCE_TYPES = [
  'Funding',
  'Equipment',
  'Software',
  'Technical Expertise',
  'Mentorship',
  'Data',
  'Infrastructure',
  'Field Support',
  'Training',
] as const

export function PartnerResourcesPage() {
  const [resources, setResources] = useState<PartnerResource[]>(initialResources)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [availabilityFilter, setAvailabilityFilter] = useState('All')

  // Modals & forms
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<PartnerResource | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<PartnerResource | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Modal Form State
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<string>('Technical Expertise')
  const [formQuantity, setFormQuantity] = useState('')
  const [formAvailability, setFormAvailability] = useState<'Available' | 'Committed' | 'Limited'>('Available')
  const [formStatus, setFormStatus] = useState<'Available' | 'Offered' | 'Committed'>('Available')
  const [formProject, setFormProject] = useState('')
  const [formNotes, setFormNotes] = useState('')

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        search === '' ||
        res.name.toLowerCase().includes(search.toLowerCase()) ||
        res.type.toLowerCase().includes(search.toLowerCase()) ||
        (res.relatedProject?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (res.notes?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchesType = typeFilter === 'All' || res.type === typeFilter
      const matchesAvail = availabilityFilter === 'All' || res.availability === availabilityFilter

      return matchesSearch && matchesType && matchesAvail
    })
  }, [resources, search, typeFilter, availabilityFilter])

  const openAddModal = () => {
    setEditingResource(null)
    setFormName('')
    setFormType('Technical Expertise')
    setFormQuantity('')
    setFormAvailability('Available')
    setFormStatus('Available')
    setFormProject('')
    setFormNotes('')
    setModalOpen(true)
  }

  const openEditModal = (res: PartnerResource) => {
    setEditingResource(res)
    setFormName(res.name)
    setFormType(res.type)
    setFormQuantity(res.quantity)
    setFormAvailability(res.availability)
    setFormStatus(res.contributionStatus)
    setFormProject(res.relatedProject ?? '')
    setFormNotes(res.notes ?? '')
    setModalOpen(true)
  }

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    if (editingResource) {
      // Edit existing
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingResource.id
            ? {
                ...r,
                name: formName,
                type: formType,
                quantity: formQuantity,
                availability: formAvailability,
                contributionStatus: formStatus,
                relatedProject: formProject.trim() ? formProject.trim() : undefined,
                notes: formNotes.trim() ? formNotes.trim() : undefined,
              }
            : r
        )
      )
      setFeedback(`Resource "${formName}" updated successfully.`)
    } else {
      // Add new
      const newRes: PartnerResource = {
        id: `res-${Date.now()}`,
        name: formName,
        type: formType,
        quantity: formQuantity,
        availability: formAvailability,
        contributionStatus: formStatus,
        relatedProject: formProject.trim() ? formProject.trim() : undefined,
        addedDate: 'Just now',
        notes: formNotes.trim() ? formNotes.trim() : undefined,
      }
      setResources((prev) => [newRes, ...prev])
      setFeedback(`Resource "${formName}" added to organization catalog.`)
    }

    setModalOpen(false)
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleToggleAvailability = (
    res: PartnerResource,
    newAvailability: 'Available' | 'Committed' | 'Limited'
  ) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === res.id
          ? {
              ...r,
              availability: newAvailability,
              contributionStatus: newAvailability === 'Committed' ? 'Committed' : r.contributionStatus,
            }
          : r
      )
    )
    setFeedback(`Resource "${res.name}" status set to "${newAvailability}".`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return
    setResources((prev) => prev.filter((r) => r.id !== deleteCandidate.id))
    setFeedback(`Resource "${deleteCandidate.name}" removed from inventory.`)
    setDeleteCandidate(null)
    setTimeout(() => setFeedback(null), 5000)
  }

  return (
    <PartnerLayout title="Resources">
      <PartnerPage
        title="Resources"
        description="Catalog and manage pledged equipment, software grants, funding, and mentor support."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Resources' },
        ]}
        action={
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Plus size={15} />
            Add New Resource
          </button>
        }
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

          {/* Filter and Search Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources by title, type, notes, or related project..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Types</option>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <label className="text-xs font-semibold text-slate-500 ml-2">Availability:</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Availabilities</option>
                  <option value="Available">Available</option>
                  <option value="Committed">Committed</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>
                Showing <strong>{filteredResources.length}</strong> of {resources.length} cataloged resources
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setTypeFilter('All')
                  setAvailabilityFilter('All')
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#187e8d] hover:underline"
              >
                <RotateCcw size={12} />
                Reset filters
              </button>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  onEdit={openEditModal}
                  onToggleAvailability={handleToggleAvailability}
                  onRemove={(candidate) => setDeleteCandidate(candidate)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Layers}
              title="No resources found"
              action={
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <Plus size={14} />
                  Add Your First Resource
                </button>
              }
            />
          )}
        </div>

        {/* Add / Edit Resource Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                  <Layers size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    {editingResource ? 'Edit Resource' : 'Add Resource to Catalog'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Make resources discoverable for automated matching against project gaps.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveResource} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Resource Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. IoT Sensor Calibration Bench, Cloud Compute Grant"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Resource Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Quantity / Hours</label>
                    <input
                      type="text"
                      required
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      placeholder="e.g. 40 hours, 10 units, ₹2,00,000"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Availability</label>
                    <select
                      value={formAvailability}
                      onChange={(e) => setFormAvailability(e.target.value as typeof formAvailability)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Committed">Committed</option>
                      <option value="Limited">Limited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">Contribution Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as typeof formStatus)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Offered">Offered</option>
                      <option value="Committed">Committed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    Related Project (Optional)
                  </label>
                  <input
                    type="text"
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    placeholder="e.g. Solar Water Monitoring Pilot"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Notes & Conditions</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Special terms, equipment delivery details, or mentor scheduling..."
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    {editingResource ? 'Update Resource' : 'Add to Inventory'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={Boolean(deleteCandidate)}
          title="Remove Resource?"
          description={`Are you sure you want to remove "${deleteCandidate?.name}" from your organization resource catalog?`}
          destructive
          confirmLabel="Remove Resource"
          onCancel={() => setDeleteCandidate(null)}
          onConfirm={handleConfirmDelete}
        />
      </PartnerPage>
    </PartnerLayout>
  )
}
