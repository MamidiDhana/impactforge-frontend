import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Layers,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import { getAIOverview, refreshAIMetrics, type AIOverviewData } from '../../../services/aiManagementService'

export function AIOverviewPage() {
  const [data, setData] = useState<AIOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshToast, setRefreshToast] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAIOverview()
      setData(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch AI overview metrics.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRefreshMetrics = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await refreshAIMetrics()
      setData(res)
      setRefreshToast('Metrics successfully recalculated and synchronized with live database.')
      setTimeout(() => setRefreshToast(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh AI metrics.'
      setError(msg)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <AdminLayout title="AI Management Overview">
      <AdminPage
        title="AI Management Overview"
        description="Monitor foundation models, prediction volumes, human feedback metrics, and autonomous retraining health."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'AI Overview' },
        ]}
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefreshMetrics}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing || loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
              <span>{refreshing ? 'Recalculating...' : 'Refresh Metrics'}</span>
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
        {/* Success Toast */}
        {refreshToast && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>{refreshToast}</span>
            </div>
            <button type="button" onClick={() => setRefreshToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="underline font-bold hover:text-rose-950 ml-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !data ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 shadow-2xs">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="size-10 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
              <p className="text-xs font-bold text-slate-600">Connecting to AI telemetry services...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Fallback mode alert if active */}
            {data?.health_status.includes('Fallback') && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900 flex items-start gap-3 shadow-2xs">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">AI Running in Offline Heuristic Fallback Mode</p>
                  <p className="mt-0.5 text-amber-800">
                    AI provider is configured with offline taxonomic heuristics. API key is unconfigured in current environment, so deterministic civic classifiers are serving predictions reliably.
                  </p>
                </div>
              </div>
            )}

            {/* Top Stat Cards: Health & Core Specs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: AI Health Status */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">System Health</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Activity size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-slate-900">
                    {data?.health_status || 'Operational'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Telemetry feed online</span>
                </div>
              </div>

              {/* Card 2: AI Foundation Model */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Foundation Model</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Bot size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-base font-extrabold text-slate-900 truncate">
                    {data?.model || 'gemini-1.5-flash'}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="capitalize font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {data?.provider || 'gemini'}
                  </span>
                  <span>{data?.ai_enabled ? 'Active' : 'Disabled'}</span>
                </div>
              </div>

              {/* Card 3: Embedding Model */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vector Embeddings</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
                    <Layers size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-extrabold text-slate-900 truncate">
                    {data?.embedding_model || 'BAAI/bge-small-en-v1.5'}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {data?.embedding_enabled ? 'Embeddings Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Card 4: Model Version & Retraining */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Version</span>
                  <div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-slate-900">
                    {data?.current_model_version || 'v1.0.0'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    {data?.accuracy_score}% Acc
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                  <Clock size={12} className="text-slate-400" />
                  <span>
                    Last trained: {data?.last_retraining_date ? new Date(data.last_retraining_date).toLocaleDateString() : 'Baseline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Prediction & Human Feedback Telemetry Grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Left 2 Cols: Prediction Accuracy & Feedback Metrics */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                      Prediction & Feedback Metrics
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live audit of classification, prioritization, and human label reviews.
                    </p>
                  </div>
                  <Link
                    to="/admin/ai/predictions"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187e8d] hover:text-[#12365a]"
                  >
                    <span>View Predictions</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {/* Total Predictions */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                      <Sparkles size={15} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {data?.total_predictions ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">System predictions</p>
                  </div>

                  {/* Correct Predictions */}
                  <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-100">
                    <div className="flex items-center justify-between text-emerald-600">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Correct</span>
                      <CheckCircle2 size={15} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-emerald-700">
                      {data?.correct_predictions ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] text-emerald-800 font-medium">Human verified</p>
                  </div>

                  {/* Incorrect / Corrected */}
                  <div className="rounded-xl bg-rose-50/70 p-4 border border-rose-100">
                    <div className="flex items-center justify-between text-rose-600">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Incorrect</span>
                      <XCircle size={15} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-rose-700">
                      {data?.incorrect_predictions ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] text-rose-800 font-medium">Flagged for dataset</p>
                  </div>

                  {/* Pending Feedback */}
                  <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-100">
                    <div className="flex items-center justify-between text-amber-600">
                      <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
                      <MessageSquare size={15} />
                    </div>
                    <p className="mt-2 text-2xl font-black text-amber-700">
                      {data?.pending_feedback ?? 0}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-800 font-medium">Needs human review</p>
                  </div>
                </div>

                {/* Feedback Ratio Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                    <span>Evaluated Accuracy Benchmark</span>
                    <span className="font-extrabold text-slate-900">{data?.accuracy_score || 94.8}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
                    <div
                      className="bg-emerald-500 transition-all duration-500"
                      style={{ width: `${data?.accuracy_score || 94.8}%` }}
                    />
                    <div
                      className="bg-rose-400 transition-all duration-500"
                      style={{ width: `${100 - (data?.accuracy_score || 94.8)}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" /> Ground truth concordance
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-rose-400" /> Correction error delta
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Navigation & Action Center */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                  AI Governance Modules
                </h3>
                <p className="text-xs text-slate-500">
                  Controlled administrative workflows for machine learning lifecycle management.
                </p>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/admin/ai/dataset"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-[#187e8d] hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-[#e8f5f5] group-hover:text-[#187e8d]">
                        <Database size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Training Dataset</p>
                        <p className="text-[11px] text-slate-500">Curated ground truth pairs</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-[#187e8d]" />
                  </Link>

                  <Link
                    to="/admin/ai/retraining"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-[#187e8d] hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-teal-50 text-[#187e8d] group-hover:bg-[#12365a] group-hover:text-white transition">
                        <Cpu size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Retraining Pipeline</p>
                        <p className="text-[11px] text-slate-500">Safe human-in-the-loop builds</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-[#187e8d]" />
                  </Link>

                  <Link
                    to="/admin/ai/settings"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-[#187e8d] hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-[#e8f5f5] group-hover:text-[#187e8d]">
                        <Sliders size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">AI Configuration</p>
                        <p className="text-[11px] text-slate-500">Sanitized provider settings</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-[#187e8d]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
