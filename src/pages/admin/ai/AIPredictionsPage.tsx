import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import { Modal } from '../../../components/common/Modal'
import {
  getAIPredictions,
  type AIPredictionItem,
} from '../../../services/aiManagementService'

export function AIPredictionsPage() {
  const [predictions, setPredictions] = useState<AIPredictionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confidenceFilter, setConfidenceFilter] = useState('all')

  // Details Modal
  const [selectedPrediction, setSelectedPrediction] = useState<AIPredictionItem | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAIPredictions({
        search: search.trim() || undefined,
        prediction_type: typeFilter !== 'all' ? typeFilter : undefined,
        status_filter: statusFilter !== 'all' ? statusFilter : undefined,
      })
      setPredictions(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve AI predictions.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter client-side confidence
  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      if (confidenceFilter === 'high') return p.confidence_score >= 0.85
      if (confidenceFilter === 'medium') return p.confidence_score >= 0.65 && p.confidence_score < 0.85
      if (confidenceFilter === 'low') return p.confidence_score < 0.65
      return true
    })
  }, [predictions, confidenceFilter])

  const formatPredictedValue = (item: AIPredictionItem) => {
    if (item.prediction_type === 'category') {
      return (
        <div>
          <span className="font-bold text-slate-900">{item.predicted_value?.category || 'General'}</span>
          {item.predicted_value?.subcategory && (
            <p className="text-[11px] text-slate-500">{item.predicted_value.subcategory}</p>
          )}
        </div>
      )
    }
    if (item.prediction_type === 'priority') {
      const p = item.predicted_value?.priority || 'Medium'
      const colors: Record<string, string> = {
        High: 'text-rose-700 bg-rose-50 border-rose-200',
        Critical: 'text-red-700 bg-red-100 border-red-300',
        Medium: 'text-amber-700 bg-amber-50 border-amber-200',
        Low: 'text-slate-700 bg-slate-100 border-slate-200',
      }
      return (
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold border ${colors[p] || colors.Medium}`}>
            {p}
          </span>
          {item.predicted_value?.score !== undefined && (
            <span className="text-[11px] text-slate-500 font-semibold">({item.predicted_value.score}/100)</span>
          )}
        </div>
      )
    }
    if (item.prediction_type === 'capability') {
      const skills = item.predicted_value?.required_skills || ['Civic Engineering']
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {skills.slice(0, 2).map((s: string, idx: number) => (
            <span key={idx} className="rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200">
              {s}
            </span>
          ))}
          {skills.length > 2 && (
            <span className="text-[10px] text-slate-400 font-semibold">+{skills.length - 2} more</span>
          )}
        </div>
      )
    }
    return <span className="font-mono text-xs">{JSON.stringify(item.predicted_value)}</span>
  }

  return (
    <AdminLayout title="AI Predictions">
      <AdminPage
        title="AI Predictions"
        description="Audit all automated inferences generated across categorization, priority triage, and matching pipelines."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'AI Predictions' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
              <span>Refresh</span>
            </button>
            <Link
              to="/admin/ai/dataset"
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs"
            >
              <Database size={14} className="text-teal-300" />
              <span>Training Dataset</span>
            </Link>
          </div>
        }
      >
        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            {error}
          </div>
        )}

        {/* Filters Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search predictions, titles, keywords..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs outline-none focus:border-[#187e8d] focus:bg-white focus:ring-2 focus:ring-[#187e8d]/20 transition"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:bg-white"
            >
              <option value="all">All Prediction Types</option>
              <option value="category">Category Classification</option>
              <option value="priority">Priority Assessment</option>
              <option value="capability">Capability Extraction</option>
              <option value="matching">HEI / Student Matching</option>
            </select>

            {/* Confidence Filter */}
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:bg-white"
            >
              <option value="all">All Confidence Levels</option>
              <option value="high">High Confidence (≥ 85%)</option>
              <option value="medium">Medium Confidence (65% - 84%)</option>
              <option value="low">Needs Review (&lt; 65%)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#187e8d] focus:bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed / Confident</option>
              <option value="needs_review">Needs Human Review</option>
              <option value="failed">Failed / Skipped</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredPredictions.length}</strong> inferences
            </span>
            {(search || typeFilter !== 'all' || confidenceFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setTypeFilter('all')
                  setConfidenceFilter('all')
                  setStatusFilter('all')
                }}
                className="font-bold text-[#187e8d] hover:text-[#12365a]"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Predictions Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          {loading && predictions.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Fetching predictions...</p>
              </div>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="p-12 text-center">
              <Bot size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">No predictions found</p>
              <p className="text-xs text-slate-500 mt-1">Try changing your search keywords or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Report / Problem</th>
                    <th className="px-4 py-3.5">Prediction Type</th>
                    <th className="px-4 py-3.5">Inference Result</th>
                    <th className="px-4 py-3.5">Confidence</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPredictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-slate-50/70 transition">
                      {/* Report / Problem */}
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="font-bold text-slate-900 truncate" title={pred.problem_title}>
                          {pred.problem_title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {pred.track_id}
                        </p>
                      </td>

                      {/* Prediction Type Badge */}
                      <td className="px-4 py-3">
                        <span className="capitalize inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {pred.prediction_type}
                        </span>
                      </td>

                      {/* Inference Result */}
                      <td className="px-4 py-3">
                        {formatPredictedValue(pred)}
                      </td>

                      {/* Confidence Score Bar */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pred.confidence_score >= 0.8
                                  ? 'bg-emerald-500'
                                  : pred.confidence_score >= 0.6
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.round(pred.confidence_score * 100)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 text-xs">
                            {Math.round(pred.confidence_score * 100)}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pred.prediction_status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        ) : pred.prediction_status === 'needs_review' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock size={12} />
                            <span>Needs Review</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle size={12} />
                            <span>{pred.prediction_status}</span>
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {new Date(pred.prediction_date).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPrediction(pred)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View Prediction Details"
                          >
                            <Eye size={15} />
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

        {/* Prediction Details Modal */}
        {selectedPrediction && (
          <Modal
            open={Boolean(selectedPrediction)}
            onClose={() => setSelectedPrediction(null)}
            title="AI Prediction Audit Details"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-[#187e8d] uppercase tracking-wider font-mono">
                    {selectedPrediction.track_id}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedPrediction.problem_title}
                  </h4>
                </div>
                <span className="capitalize font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                  {selectedPrediction.prediction_type}
                </span>
              </div>

              {/* Input context */}
              <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Input Feature Text
                </span>
                <p className="mt-1 text-slate-700 leading-relaxed font-mono text-[11px]">
                  {selectedPrediction.input_text}
                </p>
              </div>

              {/* Model Output & Confidence */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Inference Output</span>
                  <div className="mt-1 font-bold text-slate-900 text-sm">
                    {formatPredictedValue(selectedPrediction)}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3 bg-white">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence & Model</span>
                  <p className="mt-1 font-extrabold text-slate-900 text-sm">
                    {Math.round(selectedPrediction.confidence_score * 100)}% Confidence
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {selectedPrediction.model_version}
                  </p>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="rounded-xl border border-teal-100 bg-[#e8f5f5]/50 p-3.5 text-xs text-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-[#12365a] mb-1">
                  <Sparkles size={14} className="text-[#187e8d]" />
                  <span>AI Reasoning & Explanation</span>
                </div>
                <p className="leading-relaxed text-slate-700">
                  {selectedPrediction.explanation}
                </p>
              </div>

              {/* Actions in modal */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPrediction(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
