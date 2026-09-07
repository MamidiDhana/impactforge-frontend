import { useState } from 'react'
import {
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Power,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { adminAIModels as initialAIModels } from '../../data/adminMockData'
import type { AIModelInfo } from '../../types/admin'

export function AdminAIModelsPage() {
  const [models, setModels] = useState<AIModelInfo[]>(initialAIModels)
  const [selectedConfigModel, setSelectedConfigModel] = useState<AIModelInfo | null>(null)
  const [retrainingModelId, setRetrainingModelId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Config sliders
  const [thresholdVal, setThresholdVal] = useState(85)

  // Aggregate stats
  const totalRequestsToday = models.reduce((acc, m) => acc + m.requestsToday, 0)
  const avgSystemAccuracy = (
    models.reduce((acc, m) => acc + m.accuracy, 0) / models.length
  ).toFixed(1)
  const activeCount = models.filter((m) => m.status === 'Active').length

  const handleToggleModelStatus = (model: AIModelInfo) => {
    const nextStatus = model.status === 'Active' ? 'Inactive' : 'Active'
    setModels((prev) =>
      prev.map((m) => (m.id === model.id ? { ...m, status: nextStatus } : m))
    )
    setFeedback(`AI Model "${model.name}" is now ${nextStatus}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleRetrain = (model: AIModelInfo) => {
    setRetrainingModelId(model.id)
    setFeedback(`Scheduled background retraining pipeline for "${model.name}".`)
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === model.id
            ? {
                ...m,
                status: 'Active',
                lastUpdated: 'Just now',
                accuracy: Math.min(99.5, Number((m.accuracy + 0.3).toFixed(1))),
              }
            : m
        )
      )
      setRetrainingModelId(null)
      setFeedback(`Retraining completed for "${model.name}". New accuracy score evaluated.`)
      setTimeout(() => setFeedback(null), 4500)
    }, 2200)
  }

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConfigModel) return

    setModels((prev) =>
      prev.map((m) =>
        m.id === selectedConfigModel.id
          ? { ...m, confidenceThreshold: thresholdVal }
          : m
      )
    )
    setFeedback(`Hyperparameters for "${selectedConfigModel.name}" updated in vector cache.`)
    setSelectedConfigModel(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="AI Models">
      <AdminPage
        title="AI Models"
        description="Monitor performance, accuracy, and latency for matching neural models."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Models' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              {activeCount} / {models.length} Models Online
            </span>
          </div>
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

          {/* AI Processing Statistics Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Inferences Today</span>
                <span className="rounded-lg bg-teal-50 p-2 text-[#187e8d]">
                  <Zap size={16} />
                </span>
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                {totalRequestsToday.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                <TrendingUp size={12} /> +18.4% surge during student sprint
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Average System Accuracy</span>
                <span className="rounded-lg bg-purple-50 p-2 text-purple-700">
                  <Sparkles size={16} />
                </span>
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                {avgSystemAccuracy}%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Evaluated against verified ground truth
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Average P95 Latency</span>
                <span className="rounded-lg bg-blue-50 p-2 text-blue-700">
                  <Clock size={16} />
                </span>
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                52ms
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Fast vector similarity cache active
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Auto-Matched Challenges</span>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <Bot size={16} />
                </span>
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                842
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Zero human intervention routing
              </p>
            </div>
          </div>

          {/* AI Model Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => {
              const isActive = model.status === 'Active'
              const isTraining = model.status === 'Training' || retrainingModelId === model.id

              return (
                <article
                  key={model.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-[#b8dfe0] hover:shadow-md"
                >
                  <div>
                    {/* Top row: Status badge + Version */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isTraining
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-500'
                              : isTraining
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        {isTraining ? 'Retraining...' : model.status}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {model.version}
                      </span>
                    </div>

                    {/* Model Name & Purpose */}
                    <h3 className="mt-3 font-[Manrope] text-base font-bold text-[#13243b]">
                      {model.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {model.purpose}
                    </p>

                    {/* Architecture details */}
                    <div className="mt-3 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Architecture</p>
                      <p className="font-mono text-[11px] text-slate-700 font-semibold truncate mt-0.5">
                        {model.architecture}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-slate-100 p-2.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Accuracy</span>
                        <p className="mt-0.5 font-[Manrope] text-base font-extrabold text-[#187e8d]">
                          {model.accuracy}%
                        </p>
                      </div>
                      <div className="rounded-lg border border-slate-100 p-2.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Confidence Cutoff</span>
                        <p className="mt-0.5 font-[Manrope] text-base font-extrabold text-slate-700">
                          {model.confidenceThreshold}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>{model.requestsToday.toLocaleString()} requests today</span>
                      <span>Latency: {model.avgLatency}</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedConfigModel(model)
                        setThresholdVal(model.confidenceThreshold)
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Sliders size={13} />
                      Configure
                    </button>
                    <button
                      type="button"
                      disabled={isTraining}
                      onClick={() => handleRetrain(model)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-[#187e8d] hover:bg-teal-100 disabled:opacity-50"
                      title="Run model retraining pipeline"
                    >
                      <RotateCcw size={13} className={isTraining ? 'animate-spin' : ''} />
                      Train
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleModelStatus(model)}
                      className={`inline-flex items-center justify-center rounded-lg p-2 text-xs font-semibold border ${
                        isActive
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700'
                          : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title={isActive ? 'Deactivate model' : 'Activate model'}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Model Configuration Modal */}
        {selectedConfigModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setSelectedConfigModel(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Cpu size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    {selectedConfigModel.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configuration & Confidence Thresholds
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="mt-5 space-y-4 text-xs">
                <div className="rounded-xl bg-slate-50 p-3.5 space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Model Version</span>
                    <span className="font-mono font-bold text-slate-800">{selectedConfigModel.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Underlying Framework</span>
                    <span className="font-medium text-slate-800">{selectedConfigModel.architecture}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Fine-tuned</span>
                    <span className="font-medium text-slate-800">{selectedConfigModel.lastUpdated}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      Minimum Confidence Threshold Cutoff
                    </label>
                    <span className="font-mono font-bold text-[#187e8d] text-sm">
                      {thresholdVal}%
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mb-2">
                    Inferences scoring below this threshold will be routed to government validators for manual confirmation.
                  </p>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={thresholdVal}
                    onChange={(e) => setThresholdVal(Number(e.target.value))}
                    className="w-full accent-[#187e8d]"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedConfigModel(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
