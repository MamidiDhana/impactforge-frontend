import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  FileCheck,
  Search,
  Check,
  X,
  FileText,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { FilterSelect } from '../../components/forms/FilterSelect'
import { Modal } from '../../components/common/Modal'
import { EmptyState } from '../../components/common/EmptyState'
import {
  initialFacultyProjectOutputs,
  type FacultyProjectOutput,
} from '../../data/facultyStudentManagement'

export function FacultyReviewsPage() {
  const [outputs, setOutputs] = useState<FacultyProjectOutput[]>(initialFacultyProjectOutputs)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [projectFilter, setProjectFilter] = useState('All Projects')

  const [activeReviewItem, setActiveReviewItem] = useState<FacultyProjectOutput | null>(null)
  const [reviewStatusChoice, setReviewStatusChoice] = useState<FacultyProjectOutput['reviewStatus']>('Approved')
  const [reviewNotes, setReviewNotes] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const statusOptions = ['All Statuses', 'Pending Review', 'Approved', 'Changes Requested', 'Rejected']
  const projectOptions = useMemo(() => {
    const s = new Set<string>()
    outputs.forEach((o) => s.add(o.projectName))
    return ['All Projects', ...Array.from(s)]
  }, [outputs])

  const filteredOutputs = useMemo(() => {
    return outputs.filter((item) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.submittedBy.toLowerCase().includes(q) ||
        item.outputType.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === 'All Statuses' || item.reviewStatus === statusFilter
      const matchesProject =
        projectFilter === 'All Projects' || item.projectName === projectFilter

      return matchesSearch && matchesStatus && matchesProject
    })
  }, [outputs, search, statusFilter, projectFilter])

  const handleOpenReview = (item: FacultyProjectOutput) => {
    setActiveReviewItem(item)
    setReviewStatusChoice(item.reviewStatus === 'Pending Review' ? 'Approved' : item.reviewStatus)
    setReviewNotes(item.reviewerComments || '')
  }

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeReviewItem) return

    setOutputs((prev) =>
      prev.map((item) =>
        item.id === activeReviewItem.id
          ? {
              ...item,
              reviewStatus: reviewStatusChoice,
              reviewerComments: reviewNotes.trim() || undefined,
            }
          : item
      )
    )

    setActiveReviewItem(null)
    setFeedback(`Review recorded for "${activeReviewItem.title}". Status: ${reviewStatusChoice}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const getStatusBadge = (status: FacultyProjectOutput['reviewStatus']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <Check size={12} />
            Approved
          </span>
        )
      case 'Changes Requested':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <AlertTriangle size={12} />
            Changes Requested
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
            <X size={12} />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            <Clock size={12} />
            Pending Review
          </span>
        )
    }
  }

  return (
    <HEILayout
      title="Reviews"
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'Reviews' },
      ]}
    >
      <PageContainer>
        <PageHeader
          title="Reviews"
          description="Evaluate and validate deliverables, technical blueprints, and milestone outputs submitted by student cohorts."
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'Reviews' },
          ]}
        />

        {feedback && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search deliverables, outputs, or submitter..."
            />
          </div>
          <div className="w-full md:w-48">
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </div>
          <div className="w-full md:w-56">
            <FilterSelect
              label="Project"
              value={projectFilter}
              options={projectOptions}
              onChange={setProjectFilter}
            />
          </div>
        </div>

        {/* Outputs Grid */}
        {filteredOutputs.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No deliverables found"
            description="Adjust your search query or filter selection."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredOutputs.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#a9d9d9]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#187e8d]">
                        {item.outputType} · {item.version}
                      </span>
                      <h3 className="mt-1 font-[Manrope] text-base font-bold text-[#13243b]">
                        {item.title}
                      </h3>
                    </div>
                    {getStatusBadge(item.reviewStatus)}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs space-y-1 text-slate-600">
                    <p>
                      <strong>Project:</strong> {item.projectName}
                    </p>
                    <p>
                      <strong>Submitted by:</strong> {item.submittedBy} on {item.submissionDate}
                    </p>
                    {item.attachmentName && (
                      <p className="flex items-center gap-1 text-[#187e8d] font-semibold pt-1">
                        <FileText size={13} />
                        <span>{item.attachmentName}</span>
                      </p>
                    )}
                  </div>

                  {item.reviewerComments && (
                    <div className="mt-3 rounded-lg border border-slate-100 bg-[#f7fbfb] p-2.5 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">Faculty Feedback:</p>
                      <p className="mt-0.5">{item.reviewerComments}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">ID: {item.id}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(item)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <FileCheck size={14} />
                    <span>{item.reviewStatus === 'Pending Review' ? 'Conduct Review' : 'Edit Review'}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {activeReviewItem && (
          <Modal
            open={Boolean(activeReviewItem)}
            title={`Review: ${activeReviewItem.title}`}
            onClose={() => setActiveReviewItem(null)}
          >
            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-slate-700">Project / Cohort</p>
                <p className="text-slate-500">{activeReviewItem.projectName} · {activeReviewItem.submittedBy}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Evaluation Outcome</label>
                <select
                  value={reviewStatusChoice}
                  onChange={(e) =>
                    setReviewStatusChoice(e.target.value as FacultyProjectOutput['reviewStatus'])
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="Approved">Approved (Meets Quality Standards)</option>
                  <option value="Changes Requested">Changes Requested (Needs Revision)</option>
                  <option value="Pending Review">Keep as Pending Review</option>
                  <option value="Rejected">Rejected (Does Not Meet Criteria)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700">Detailed Feedback to Student</label>
                <textarea
                  rows={4}
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide concrete remarks, suggestions for improvement, or praise for good execution..."
                  className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveReviewItem(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Save Review Decision
                </button>
              </div>
            </form>
          </Modal>
        )}
      </PageContainer>
    </HEILayout>
  )
}
