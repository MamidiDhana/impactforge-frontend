import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Edit2,
  FolderTree,
  Plus,
  RotateCcw,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { adminTaxonomy as initialTaxonomy } from '../../data/adminMockData'
import type { TaxonomyCategory } from '../../types/admin'

const TAXONOMY_TYPES = [
  'All',
  'Problem Categories',
  'Technology Categories',
  'Domain Categories',
  'Capability Categories',
  'Skill Tags',
] as const

export function AdminTaxonomyPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyCategory[]>(initialTaxonomy)
  const [activeTab, setActiveTab] = useState<typeof TAXONOMY_TYPES[number]>('All')
  const [search, setSearch] = useState('')

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<TaxonomyCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<TaxonomyCategory | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<TaxonomyCategory['type']>('Problem Categories')
  const [formParent, setFormParent] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formTags, setFormTags] = useState('')

  // Metrics
  const totalCategoryCount = taxonomy.filter((t) => t.type.includes('Categories')).length
  const totalCapabilityCount = taxonomy
    .filter((t) => t.type === 'Capability Categories' || t.type === 'Skill Tags')
    .reduce((sum, item) => sum + item.itemCount, 0)
  const totalTagsCount = taxonomy.reduce((sum, item) => sum + item.tags.length, 0)

  // Filtered taxonomy list
  const filteredTaxonomy = useMemo(() => {
    return taxonomy.filter((item) => {
      const matchesTab = activeTab === 'All' || item.type === activeTab
      const matchesSearch =
        search === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        (item.parentCategory && item.parentCategory.toLowerCase().includes(search.toLowerCase()))

      return matchesTab && matchesSearch
    })
  }, [taxonomy, activeTab, search])

  // Handlers
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newItem: TaxonomyCategory = {
      id: `tax-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      parentCategory: formParent.trim() || undefined,
      description: formDesc.trim() || 'Civic taxonomy classification entry.',
      itemCount: 1,
      tags: parsedTags.length > 0 ? parsedTags : [formName.trim()],
    }

    setTaxonomy([newItem, ...taxonomy])
    setAddModalOpen(false)
    setFormName('')
    setFormParent('')
    setFormDesc('')
    setFormTags('')
    setFeedback(`Taxonomy node "${newItem.name}" added successfully!`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCategory) return

    setTaxonomy((prev) =>
      prev.map((t) => (t.id === editCategory.id ? editCategory : t))
    )
    setFeedback(`Taxonomy item "${editCategory.name}" updated successfully.`)
    setEditCategory(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleConfirmDelete = () => {
    if (!deletingCategory) return
    setTaxonomy((prev) => prev.filter((t) => t.id !== deletingCategory.id))
    setFeedback(`Taxonomy item "${deletingCategory.name}" was removed from the directory.`)
    setDeletingCategory(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="Taxonomy">
      <AdminPage
        title="Taxonomy"
        description="Standardize civic vocabularies, categories, and skill tags for AI matching."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Taxonomy' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Plus size={14} />
            Add Taxonomy Node
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

          {/* Metric Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Categories Count
              </span>
              <p className="mt-1 font-[Manrope] text-3xl font-extrabold text-[#13243b]">
                {totalCategoryCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                WASH, Energy, Health, AgTech & Smart Cities
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-[#187e8d] uppercase tracking-wider">
                Total Capability Count
              </span>
              <p className="mt-1 font-[Manrope] text-3xl font-extrabold text-[#187e8d]">
                {totalCapabilityCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Mapped to university labs and student teams
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Active Skill & Spec Tags
              </span>
              <p className="mt-1 font-[Manrope] text-3xl font-extrabold text-purple-700">
                {totalTagsCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Indexed for semantic vector search
              </p>
            </div>
          </div>

          {/* Taxonomy Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
            {TAXONOMY_TYPES.map((type) => {
              const count =
                type === 'All'
                  ? taxonomy.length
                  : taxonomy.filter((t) => t.type === type).length

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveTab(type)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                    activeTab === type
                      ? 'bg-[#12365a] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type} ({count})
                </button>
              )
            })}
          </div>

          {/* Search bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search taxonomy items, parent categories, or sub-tags (e.g. LoRaWAN, Water, Solar)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Taxonomy Hierarchy & Items Grid */}
          {filteredTaxonomy.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No taxonomy items match"
              description="Try adjusting your search query or tab category filter."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTaxonomy.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-[#b8dfe0] hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded bg-[#e8f5f5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#187e8d]">
                        {item.type}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {item.itemCount} mapped
                      </span>
                    </div>

                    <h3 className="mt-3 font-[Manrope] text-base font-bold text-[#13243b]">
                      {item.name}
                    </h3>

                    {item.parentCategory && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Parent Domain: <strong className="text-slate-700">{item.parentCategory}</strong>
                      </p>
                    )}

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Skill / Keyword Tags */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Tag size={11} /> Associated Tags ({item.tags.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditCategory({ ...item })}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* 1. Add Taxonomy Node Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <FolderTree size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Add Taxonomy Category
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register a new domain, problem, or technology classification.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveAdd} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Precision Drip Irrigation & IoT"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700">Classification Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as TaxonomyCategory['type'])}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      {TAXONOMY_TYPES.filter((t) => t !== 'All').map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Parent Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. Agriculture"
                      value={formParent}
                      onChange={(e) => setFormParent(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Description & Context</label>
                  <textarea
                    rows={2}
                    placeholder="Describe scope, use cases, and intended academic alignments..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Soil Moisture, Solenoid Valves, LoRa"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Edit Taxonomy Category Modal */}
        {editCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Edit Taxonomy Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update classification node and associated keywords.
              </p>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Category Name</label>
                  <input
                    type="text"
                    required
                    value={editCategory.name}
                    onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Parent Domain</label>
                  <input
                    type="text"
                    value={editCategory.parentCategory ?? ''}
                    onChange={(e) => setEditCategory({ ...editCategory, parentCategory: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    value={editCategory.description}
                    onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditCategory(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. Delete Confirmation Dialog */}
        <ConfirmDialog
          open={Boolean(deletingCategory)}
          title="Confirm Taxonomy Deletion"
          description={`Are you sure you want to permanently delete "${deletingCategory?.name}"? Projects mapped to this category may lose their automated AI semantic tags.`}
          confirmLabel="Delete Category"
          destructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      </AdminPage>
    </AdminLayout>
  )
}
