import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Database,
  Edit3,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import { Modal } from '../../../components/common/Modal'
import {
  getAIPredictions,
  submitAIFeedback,
  type AIPredictionItem,
} from '../../../services/aiManagementService'

export function AIFeedbackPage() {
  const [searchParams] = useSearchParams()
  const preselectedReportId = searchParams.get('report_id')

  const [predictions, setPredictions] = useState<AIPredictionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filter state
  const [statusTab, setStatusTab] = useState<'all' | 'needs_review' | 'incorrect' | 'correct'>('needs_review')
  const [search, setSearch] = useState('')

  // Active Review Modal state
  const [activeItem, setActiveItem] = useState<AIPredictionItem | null>(null)
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'incorrect' | 'needs_review'>('needs_review')
  const [correctedValueText, setCorrectedValueText] = useState('')
  const [feedbackReason, setFeedbackReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleOpenReview = useCallback((item: AIPredictionItem) => {
    setActiveItem(item)
    const existingFb = item.feedback
    if (existingFb?.status) {
      setFeedbackStatus(existingFb.status)
      setFeedbackReason(existingFb.reason || '')
      setCorrectedValueText(
        typeof existingFb.corrected === 'object'
          ? JSON.stringify(existingFb.corrected, null, 2)
          : String(existingFb.corrected || '')
      )
    } else {
      setFeedbackStatus(item.prediction_status === 'needs_review' ? 'needs_review' : 'incorrect')
      setFeedbackReason('')
      if (item.prediction_type === 'priority') {
        const currentPrio = item.predicted_value?.priority || 'Medium'
        const altPrio = currentPrio === 'High' ? 'Medium' : currentPrio === 'Medium' ? 'High' : 'Medium'
        setCorrectedValueText(JSON.stringify({ priority: altPrio, score: altPrio === 'High' ? 85 : 60 }, null, 2))
      } else if (item.prediction_type === 'category') {
        setCorrectedValueText(
          JSON.stringify(
            {
              category: item.predicted_value?.category || 'Water and Sanitation',
              subcategory: item.predicted_value?.subcategory || 'General Civic Issue',
              problem_type: item.predicted_value?.problem_type || 'Civic Issue',
            },
            null,
            2
          )
        )
      } else {
        setCorrectedValueText(JSON.stringify(item.predicted_value || {}, null, 2))
      }
    }
    setAdminNotes('')
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAIPredictions({
        search: search.trim() || undefined,
      })
      setPredictions(data)

      // If URL had report_id, open modal for it
      if (preselectedReportId) {
        const found = data.find((p) => String(p.report_id) === preselectedReportId)
        if (found) {
          handleOpenReview(found)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load predictions.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [search, preselectedReportId, handleOpenReview])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem) return

    setSubmitting(true)
    try {
      let parsedCorrectedValue: any = correctedValueText
      try {
        parsedCorrectedValue = JSON.parse(correctedValueText)
      } catch {
        // Keep string if not valid json
      }

      await submitAIFeedback({
        report_id: activeItem.report_id,
        prediction_type: activeItem.prediction_type,
        original_prediction: activeItem.predicted_value,
        corrected_value: parsedCorrectedValue,
        feedback_status: feedbackStatus,
        feedback_reason: feedbackReason.trim(),
        admin_feedback: adminNotes.trim(),
        model_version: activeItem.model_version,
      })

      showToast(`Feedback recorded for "${activeItem.problem_title}". Ground truth saved without altering original prediction.`)
      setActiveItem(null)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit feedback.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter predictions by tab
  const filteredList = predictions.filter((p) => {
    if (statusTab === 'needs_review') {
      return p.prediction_status === 'needs_review' || p.feedback?.status === 'needs_review' || !p.feedback
    }
    if (statusTab === 'incorrect') {
      return p.feedback?.status === 'incorrect'
    }
    if (statusTab === 'correct') {
      return p.feedback?.status === 'correct'
    }
    return true
  })

  return (
    <AdminLayout title="AI Feedback Review">
      <AdminPage
        title="AI Feedback & Human-in-the-Loop Review"
        description="Inspect doubtful or contested predictions, provide ground truth corrections, and approve feedback records for the retraining dataset."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'AI Feedback' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
              <span>Refresh Queue</span>
            </button>
            <Link
              to="/admin/ai/dataset"
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs"
            >
              <Database size={14} className="text-teal-300" />
              <span>View Training Dataset</span>
            </Link>
          </div>
        }
      >
        {/* Toast Notification */}
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

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="text-rose-600 hover:text-rose-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Audit Safety Banner */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-3 shadow-2xs">
          <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-blue-950">Non-Destructive Feedback Policy</p>
            <p className="text-blue-800 leading-relaxed">
              Human reviews do not overwrite original AI prediction entries in historical civic records. All corrections, reviewer emails, and timestamps are stored in isolated audit tables (<code className="font-mono text-blue-950">ai_feedback</code> and <code className="font-mono text-blue-950">training_records</code>) to maintain strict evidentiary compliance.
            </p>
          </div>
        </div>

        {/* Tab & Search Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setStatusTab('needs_review')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 ${
                statusTab === 'needs_review'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock size={13} />
              <span>Pending Review</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('incorrect')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 ${
                statusTab === 'incorrect'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <XCircle size={13} className="text-rose-400" />
              <span>Flagged / Corrected</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('correct')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-2 ${
                statusTab === 'correct'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Verified Correct</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusTab('all')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                statusTab === 'all'
                  ? 'bg-[#12365a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Feedback
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports or reasons..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#187e8d] focus:bg-white focus:ring-2 focus:ring-[#187e8d]/20 transition"
            />
          </div>
        </div>

        {/* Prediction Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading && predictions.length === 0 ? (
            <div className="col-span-full flex min-h-[260px] items-center justify-center p-8 bg-white rounded-2xl border border-slate-200">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Loading feedback queue...</p>
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Queue is Clear</h4>
              <p className="text-xs text-slate-500 mt-1">No predictions matching this review filter.</p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-[#187e8d]/50 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#187e8d] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {item.track_id}
                    </span>
                    <span className="capitalize text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.prediction_type}
                    </span>
                  </div>

                  {/* Problem Title & Text */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {item.problem_title}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.input_text}
                    </p>
                  </div>

                  {/* AI Prediction Box */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Original AI Prediction</span>
                      <span>{Math.round(item.confidence_score * 100)}% Conf</span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs">
                      {item.prediction_type === 'priority' ? (
                        <span>Priority: {item.predicted_value?.priority} ({item.predicted_value?.score}/100)</span>
                      ) : item.prediction_type === 'category' ? (
                        <span>Category: {item.predicted_value?.category}</span>
                      ) : (
                        <span>{JSON.stringify(item.predicted_value)}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      "{item.explanation}"
                    </p>
                  </div>

                  {/* Existing Feedback Badge if reviewed */}
                  {item.feedback && (
                    <div className={`rounded-xl p-2.5 text-[11px] font-medium border ${
                      item.feedback.status === 'correct'
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                        : item.feedback.status === 'incorrect'
                        ? 'border-rose-200 bg-rose-50/70 text-rose-900'
                        : 'border-amber-200 bg-amber-50/70 text-amber-900'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-0.5">
                        {item.feedback.status === 'correct' ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : item.feedback.status === 'incorrect' ? (
                          <XCircle size={13} className="text-rose-600" />
                        ) : (
                          <Clock size={13} className="text-amber-600" />
                        )}
                        <span className="capitalize">Review: {item.feedback.status}</span>
                      </div>
                      {item.feedback.reason && (
                        <p className="line-clamp-2">Reason: {item.feedback.reason}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Model: {item.model_version}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenReview(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#12365a] hover:text-white transition shadow-2xs"
                  >
                    <Edit3 size={13} />
                    <span>{item.feedback ? 'Edit Review' : 'Review & Correct'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feedback Review Modal */}
        {activeItem && (
          <Modal
            open={Boolean(activeItem)}
            onClose={() => setActiveItem(null)}
            title="Review & Correct AI Prediction"
          >
            <form onSubmit={handleSaveFeedback} className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="font-mono text-xs font-bold text-[#187e8d]">
                  {activeItem.track_id}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {activeItem.problem_title}
                </h4>
              </div>

              {/* Original Prediction display */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Original AI Inferred Value
                </span>
                <p className="font-mono text-xs font-bold text-slate-800">
                  {JSON.stringify(activeItem.predicted_value, null, 2)}
                </p>
                <p className="text-[11px] text-slate-500">
                  Model: {activeItem.model_version} | Confidence: {Math.round(activeItem.confidence_score * 100)}%
                </p>
              </div>

              {/* Review Decision Buttons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Review Assessment Decision
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('correct')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      feedbackStatus === 'correct'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Mark Correct</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('incorrect')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      feedbackStatus === 'incorrect'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle size={14} className="text-rose-600" />
                    <span>Mark Incorrect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackStatus('needs_review')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      feedbackStatus === 'needs_review'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={14} className="text-amber-600" />
                    <span>Needs Review</span>
                  </button>
                </div>
              </div>

              {/* Corrected Value field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Human-Verified Ground Truth (JSON or Text)
                </label>
                <textarea
                  rows={3}
                  value={correctedValueText}
                  onChange={(e) => setCorrectedValueText(e.target.value)}
                  placeholder="e.g. { 'priority': 'Medium', 'score': 60 }"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This value will be staged into the training dataset without modifying the live report directly.
                </p>
              </div>

              {/* Feedback Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Human Correction
                </label>
                <input
                  type="text"
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder="e.g. Pipeline leak is localized to an internal alleyway with low traffic impact."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 transition"
                  required
                />
              </div>

              {/* Admin Feedback Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Internal Feedback & Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Audit notes for training engineers or municipal validation teams..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-[#187e8d] transition"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2a47] transition shadow-xs disabled:opacity-60"
                >
                  <Save size={14} className="text-teal-300" />
                  <span>{submitting ? 'Recording Audit...' : 'Save Feedback'}</span>
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
