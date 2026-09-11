import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Eye,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import { Modal } from '../../../components/common/Modal'
import {
  getTrainingDataset,
  approveTrainingRecord,
  rejectTrainingRecord,
  deleteTrainingRecord,
  type TrainingRecordItem,
} from '../../../services/aiManagementService'

export function TrainingDatasetPage() {
  const [records, setRecords] = useState<TrainingRecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Record Details Modal
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecordItem | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadRecords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTrainingDataset({
        approval_status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      })
      setRecords(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve training dataset.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleApprove = async (id: number) => {
    try {
      await approveTrainingRecord(id)
      showToast(`Record #${id} approved for model retraining.`)
      await loadRecords()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.'
      setError(msg)
    }
  }

  const handleReject = async (id: number) => {
    try {
      await rejectTrainingRecord(id)
      showToast(`Record #${id} rejected from retraining dataset.`)
      await loadRecords()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.'
      setError(msg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to remove duplicate training record #${id}?`)) return
    try {
      await deleteTrainingRecord(id)
      showToast(`Record #${id} deleted from dataset.`)
      await loadRecords()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record.'
      setError(msg)
    }
  }

  const approvedCount = records.filter((r) => r.approval_status === 'approved').length
  const pendingCount = records.filter((r) => r.approval_status === 'pending').length

  return (
    <AdminLayout title="Training Dataset Management">
      <AdminPage
        title="Curated Training Dataset"
        description="Inspect, validate, and approve human-verified feedback pairs eligible for the next model retraining epoch."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'Training Dataset' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadRecords}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/ai/retraining"
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs"
            >
              <Cpu size={14} className="text-teal-300" />
              <span>Retraining Pipeline</span>
            </Link>
          </div>
        }
      >
        {/* Toast */}
        {toastMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{toastMessage}</span>
            </div>
            <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-rose-600 hover:text-rose-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Dataset Readiness Summary Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-[#187e8d]">
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                  Dataset Version: v1.0 Production Staging
                </h3>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  {approvedCount} Approved Records
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Only records marked <strong className="text-slate-800">Approved</strong> are fed into training loss optimization pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 border border-amber-200">
                <Clock size={14} className="text-amber-600" />
                <span>{pendingCount} Pending Approvals</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>All Queue Reviewed</span>
              </span>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Records ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock size={13} className="text-amber-400" />
              <span>Pending ({pendingCount})</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem text, labels..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#187e8d] focus:bg-white focus:ring-2 focus:ring-[#187e8d]/20 transition"
            />
          </div>
        </div>

        {/* Dataset Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          {loading && records.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading training dataset...</p>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center">
              <Database size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">No training records found</p>
              <p className="text-xs text-slate-500 mt-1">Review feedback in the AI Feedback queue to generate candidate dataset pairs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Input Problem Text</th>
                    <th className="px-4 py-3.5">Original Prediction</th>
                    <th className="px-4 py-3.5">Target Ground Truth</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Approved By</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      {/* ID */}
                      <td className="px-4 py-3 font-mono font-bold text-[#187e8d]">
                        #{r.id}
                      </td>

                      {/* Input Text */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="line-clamp-2 font-medium text-slate-900 leading-relaxed">
                          {r.input_text}
                        </p>
                        {r.feedback_reason && (
                          <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                            Reason: {r.feedback_reason}
                          </p>
                        )}
                      </td>

                      {/* Original Prediction */}
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 max-w-[160px]">
                        <span className="line-clamp-2 bg-slate-100 p-1 rounded-md">
                          {JSON.stringify(r.original_prediction)}
                        </span>
                      </td>

                      {/* Target Ground Truth */}
                      <td className="px-4 py-3 font-mono text-[11px] text-emerald-800 max-w-[160px]">
                        <span className="line-clamp-2 bg-emerald-50 border border-emerald-200 p-1 rounded-md font-bold">
                          {JSON.stringify(r.target_label)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.approval_status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Approved</span>
                          </span>
                        ) : r.approval_status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock size={12} />
                            <span>Pending Review</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle size={12} />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Approved By */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {r.approved_by ? (
                          <div>
                            <span className="font-semibold text-slate-800">{r.approved_by}</span>
                            {r.approved_at && (
                              <p className="text-[10px] text-slate-400">
                                {new Date(r.approved_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unapproved</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedRecord(r)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View Record Details"
                          >
                            <Eye size={15} />
                          </button>

                          {r.approval_status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id)}
                              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                              title="Approve for Training"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}

                          {r.approval_status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleReject(r.id)}
                              className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition"
                              title="Reject from Training"
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(r.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Remove Duplicate Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Record Details Modal */}
        {selectedRecord && (
          <Modal
            open={Boolean(selectedRecord)}
            onClose={() => setSelectedRecord(null)}
            title={`Training Dataset Pair #${selectedRecord.id}`}
          >
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Input Feature Text
                </span>
                <p className="mt-1 rounded-xl bg-slate-50 p-3 font-medium text-slate-800 text-xs leading-relaxed border border-slate-100">
                  {selectedRecord.input_text}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Original Prediction</span>
                  <pre className="mt-1 font-mono text-[11px] text-slate-700 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedRecord.original_prediction, null, 2)}
                  </pre>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Target Ground Truth</span>
                  <pre className="mt-1 font-mono text-[11px] text-emerald-900 font-bold overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedRecord.target_label, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedRecord.feedback_reason && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                    Human Justification & Reason
                  </span>
                  <p className="mt-1 text-slate-800 italic">
                    "{selectedRecord.feedback_reason}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Dataset: {selectedRecord.dataset_version}</span>
                <span>Created: {new Date(selectedRecord.created_at).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                {selectedRecord.approval_status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(selectedRecord.id)
                      setSelectedRecord(null)
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Approve for Training
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
