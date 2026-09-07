import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Eye,
  Filter,
  Handshake,
  Layers,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'
import { Modal } from '../../components/common/Modal'
import { EmptyState } from '../../components/common/EmptyState'
import { facultyCapabilityGaps as initialFacultyGaps, type FacultyExtendedGap } from '../../data/facultyCapabilityGaps'

export function FacultyCapabilityGapsPage() {
  const [gaps, setGaps] = useState<FacultyExtendedGap[]>(initialFacultyGaps)
  const [selectedGap, setSelectedGap] = useState<FacultyExtendedGap | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const filteredGaps = gaps.filter((gap) => {
    if (severityFilter !== 'All' && gap.severity !== severityFilter) return false
    if (statusFilter !== 'All' && gap.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesProject = gap.project.toLowerCase().includes(q)
      const matchesReq = gap.required.toLowerCase().includes(q)
      const matchesMissing = gap.missing.toLowerCase().includes(q)
      if (!matchesProject && !matchesReq && !matchesMissing) return false
    }
    return true
  })

  const handleResolveGap = (id: string) => {
    setGaps((current) =>
      current.map((g) => (g.id === id ? { ...g, status: 'Resolved' } : g))
    )
    if (selectedGap?.id === id) {
      setSelectedGap((prev) => (prev ? { ...prev, status: 'Resolved' } : null))
    }
    showToast('Capability gap marked as resolved.')
  }

  const handleRequestPartner = (id: string) => {
    setGaps((current) =>
      current.map((g) => (g.id === id ? { ...g, status: 'Partner Requested' } : g))
    )
    if (selectedGap?.id === id) {
      setSelectedGap((prev) => (prev ? { ...prev, status: 'Partner Requested' } : null))
    }
    showToast('Collaboration request dispatched to matching industry and CSR partners.')
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Medium':
        return 'bg-amber-50/60 text-amber-800 border-amber-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700'
      case 'Partner Requested':
      case 'In Review':
        return 'bg-cyan-50 text-cyan-800'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const location = useLocation()
  const pageTitle = location.pathname.includes('/resources')
    ? 'Resources'
    : location.pathname.includes('/guidance')
    ? 'Guidance'
    : location.pathname.includes('/reports')
    ? 'Reports'
    : 'Requests'

  const pageDescription = location.pathname.includes('/resources')
    ? 'Access and coordinate external expert and institutional resources.'
    : location.pathname.includes('/guidance')
    ? 'Guide project teams and review mentoring requirements.'
    : location.pathname.includes('/reports')
    ? 'Review team progress reports and delivery evaluations.'
    : 'Coordinate team capability requests and partner support.'

  return (
    <FacultyStudentLayout role="faculty" title={pageTitle}>
      {toastMessage && (
        <div
          role="status"
          className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <WorkspacePage
        role="faculty"
        title={pageTitle}
        description={pageDescription}
        breadcrumbs={[{ label: 'Faculty', href: '/faculty/dashboard' }, { label: pageTitle }]}
      >
        {/* AI Disclaimer Banner */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-700">
          <Bot className="mt-0.5 shrink-0 text-[#187e8d]" size={20} />
          <div>
            <span className="font-bold text-[#13243b]">AI-Assisted Capability Gap Analysis</span>
            <p className="mt-1 text-slate-600">
              Evaluates project requirements against student roster skills and lab facilities. Recommendations and risk scores are simulated benchmarks; faculty leads maintain full discretion on team interventions and partner matching.
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Gaps</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">{gaps.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">Critical Severity</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-rose-700">
              {gaps.filter((g) => g.severity === 'Critical').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">High Severity</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-amber-700">
              {gaps.filter((g) => g.severity === 'High').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolved</p>
            <p className="mt-2 font-[Manrope] text-2xl font-bold text-emerald-700">
              {gaps.filter((g) => g.status === 'Resolved').length}
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-slate-400" />
              <label htmlFor="severity-select" className="text-xs font-semibold text-slate-600">
                Severity:
              </label>
              <select
                id="severity-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
              >
                <option value="All">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="status-select" className="text-xs font-semibold text-slate-600">
                Status:
              </label>
              <select
                id="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Partner Requested">Partner Requested</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              aria-label="Search capability gaps"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gaps or projects..."
              className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#187e8d]"
            />
          </div>
        </div>

        {/* Gaps Grid */}
        {filteredGaps.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No capability gaps match your filters"
            description="Clear search or reset filters to display all logged team capability gaps."
            action={
              <button
                type="button"
                onClick={() => {
                  setSeverityFilter('All')
                  setStatusFilter('All')
                  setSearchQuery('')
                }}
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGaps.map((gap) => (
              <article
                key={gap.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {gap.project}
                      </span>
                      <h2 className="mt-2 font-[Manrope] text-base font-bold text-[#13243b]">
                        {gap.required}
                      </h2>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getSeverityBadgeClass(
                          gap.severity
                        )}`}
                      >
                        {gap.severity}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClass(
                          gap.status
                        )}`}
                      >
                        {gap.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="text-xs font-medium text-slate-400">Current Level: </span>
                      <span className="font-medium text-slate-700">{gap.currentLevel}</span>
                    </p>
                    <p>
                      <span className="text-xs font-medium text-slate-400">Missing: </span>
                      <span className="font-semibold text-rose-700">{gap.missing}</span>
                    </p>
                    {gap.impactRisk && (
                      <p className="flex items-start gap-1.5 text-xs text-amber-800">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-600" />
                        <span>{gap.impactRisk}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedGap(gap)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
                  >
                    <Eye size={13} />
                    Open Gap Details
                  </button>

                  <div className="flex items-center gap-2">
                    {gap.status !== 'Resolved' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRequestPartner(gap.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#187e8d] px-2.5 py-1.5 text-xs font-semibold text-[#187e8d] transition hover:bg-[#e8f5f5]"
                        >
                          <Handshake size={13} />
                          Find Partner
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveGap(gap.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0e2a47]"
                        >
                          <CheckCircle2 size={13} />
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Detailed Gap Modal */}
        <Modal
          open={Boolean(selectedGap)}
          title="Capability Gap Analysis & Partner Routing"
          onClose={() => setSelectedGap(null)}
        >
          {selectedGap && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{selectedGap.project}</p>
                  <h3 className="text-base font-bold text-[#13243b]">{selectedGap.required}</h3>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${getSeverityBadgeClass(
                    selectedGap.severity
                  )}`}
                >
                  {selectedGap.severity} Severity
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 p-3.5 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Student Competency:</span>
                  <span className="font-semibold text-slate-800">{selectedGap.currentLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Specific Shortfall / Need:</span>
                  <span className="font-semibold text-rose-700">{selectedGap.missing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution Status:</span>
                  <span className="font-semibold text-[#187e8d]">{selectedGap.status}</span>
                </div>
              </div>

              {selectedGap.impactRisk && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <ShieldAlert size={14} className="text-amber-700" />
                    Delivery Risk Assessment:
                  </p>
                  <p>{selectedGap.impactRisk}</p>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
                <p className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                  <Layers size={13} className="text-[#187e8d]" />
                  Recommended Partner Profile:
                </p>
                <p>{selectedGap.suggestedPartnerType ?? 'Industry or Specialist Partner'}</p>
                <p className="mt-2 text-slate-500">
                  <strong>Suggested Action:</strong> {selectedGap.suggestedAction}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGap(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                {selectedGap.status !== 'Resolved' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRequestPartner(selectedGap.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#187e8d] bg-[#e8f5f5] px-3.5 py-2 text-xs font-bold text-[#12365a] hover:bg-[#d9eeee]"
                    >
                      <Handshake size={14} />
                      Request Partner Support
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveGap(selectedGap.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47]"
                    >
                      <CheckCircle2 size={14} />
                      Mark Resolved
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}