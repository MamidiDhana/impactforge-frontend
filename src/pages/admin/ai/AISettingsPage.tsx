import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ExternalLink,
  Key,
  Layers,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import {
  getAISettings,
  updateAISettings,
  type AISettingsData,
} from '../../../services/aiManagementService'

export function AISettingsPage() {
  const [settings, setSettings] = useState<AISettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Editable Form State
  const [aiEnabled, setAiEnabled] = useState(true)
  const [embeddingEnabled, setEmbeddingEnabled] = useState(true)
  const [threshPossible, setThreshPossible] = useState(0.55)
  const [threshStrong, setThreshStrong] = useState(0.75)
  const [threshDuplicate, setThreshDuplicate] = useState(0.85)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAISettings()
      setSettings(data)
      setAiEnabled(data.ai_enabled)
      setEmbeddingEnabled(data.embedding_enabled)
      setThreshPossible(data.similarity_threshold_possible)
      setThreshStrong(data.similarity_threshold_strong)
      setThreshDuplicate(data.similarity_threshold_duplicate)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load AI system configuration.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (threshPossible > threshStrong) {
      setError('Possible duplicate threshold must be less than or equal to strong candidate threshold.')
      return
    }
    if (threshStrong > threshDuplicate) {
      setError('Strong candidate threshold must be less than or equal to definite duplicate threshold.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const updated = await updateAISettings({
        ai_enabled: aiEnabled,
        embedding_enabled: embeddingEnabled,
        similarity_threshold_possible: threshPossible,
        similarity_threshold_strong: threshStrong,
        similarity_threshold_duplicate: threshDuplicate,
      })
      setSettings(updated)
      showToast('AI architecture settings saved and live in production.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save settings.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="AI System Settings">
      <AdminPage
        title="AI Architecture & Security Settings"
        description="Review active foundation model configurations, vector embedding pipelines, and tune live runtime hyperparameters."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'AI Settings' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
              <span>Reload</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin text-teal-300" />
              ) : (
                <ShieldCheck size={14} className="text-teal-300" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
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
            <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
              Dismiss
            </button>
          </div>
        )}
        {/* Zero-Leak Security Notice */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-2xs">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Enterprise Secret Hygiene Policy</p>
            <p className="leading-relaxed text-emerald-900">
              In accordance with platform security standards, raw API secrets (<code className="font-mono text-emerald-950 font-bold">AI_API_KEY</code>) are never transmitted to browsers or bundled in frontend client builds. Keys are securely injected via server environment variables on the backend process.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={loadSettings} className="underline hover:text-rose-950">
              Retry
            </button>
          </div>
        )}

        {loading && !settings ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
            <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Primary Settings Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Card 1: LLM Inference Engine */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                      Foundation LLM Provider
                    </h3>
                    <p className="text-xs text-slate-500">Core civic problem classification & reasoning engine</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Provider Service</span>
                    <span className="font-mono font-bold text-slate-900 uppercase">
                      {settings?.ai_provider}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Model Checkpoint</span>
                    <span className="font-mono font-bold text-slate-900">
                      {settings?.ai_model}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Inference Pipeline Status</span>
                    <button
                      type="button"
                      onClick={() => setAiEnabled(!aiEnabled)}
                      className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-md border text-xs transition cursor-pointer shadow-2xs ${
                        aiEnabled
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {aiEnabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{aiEnabled ? 'Enabled' : 'Disabled'}</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Toggle)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium">API Key Status</span>
                    {settings?.api_key_configured ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono text-[11px]">
                        <Key size={12} />
                        <span>Configured (Masked in Backend)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-mono text-[11px]">
                        <AlertCircle size={12} />
                        <span>Missing in .env (Offline Heuristics Active)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Embedding & Similarity Pipeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                      Vector Embeddings & Semantic Index
                    </h3>
                    <p className="text-xs text-slate-500">Duplicate detection, problem similarity, and HEI matching</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Embedding Model</span>
                    <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]" title={settings?.embedding_model}>
                      {settings?.embedding_model}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Multilingual Checkpoint</span>
                    <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]" title={settings?.multilingual_embedding_model}>
                      {settings?.multilingual_embedding_model}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Vector Indexing Status</span>
                    <button
                      type="button"
                      onClick={() => setEmbeddingEnabled(!embeddingEnabled)}
                      className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-md border text-xs transition cursor-pointer shadow-2xs ${
                        embeddingEnabled
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {embeddingEnabled ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{embeddingEnabled ? 'Enabled' : 'Disabled'}</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Toggle)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 font-medium">Active Model Version</span>
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {settings?.current_model_version}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hyperparameter & Threshold Status */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-[Manrope] text-base font-bold text-slate-900">
                    Vector Similarity Hyperparameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calibrated cosine similarity thresholds governing automated duplicate flagging and cross-jurisdictional recommendations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs disabled:opacity-60 shrink-0 self-start sm:self-auto"
                >
                  <ShieldCheck size={13} className="text-teal-300" />
                  <span>{saving ? 'Saving...' : 'Apply & Save'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Possible Duplicate */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Possible Duplicate
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {threshPossible.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {Math.round(threshPossible * 100)}%
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={0.9}
                    step={0.01}
                    value={threshPossible}
                    onChange={(e) => setThreshPossible(parseFloat(e.target.value))}
                    className="w-full accent-[#187e8d] cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 block">Flagged for human triage queue</span>
                </div>

                {/* Strong Candidate */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Strong Candidate
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {threshStrong.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {Math.round(threshStrong * 100)}%
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={0.95}
                    step={0.01}
                    value={threshStrong}
                    onChange={(e) => setThreshStrong(parseFloat(e.target.value))}
                    className="w-full accent-[#187e8d] cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 block">Probable duplicate cluster warning</span>
                </div>

                {/* Definite Duplicate */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Definite Duplicate
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {threshDuplicate.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {Math.round(threshDuplicate * 100)}%
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={0.99}
                    step={0.01}
                    value={threshDuplicate}
                    onChange={(e) => setThreshDuplicate(parseFloat(e.target.value))}
                    className="w-full accent-[#187e8d] cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500 block">Automated merge recommendation</span>
                </div>
              </div>
            </div>

            {/* Governance & Operator Controls Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need to update API keys or change LLM providers?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your server configuration in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">backend/.env</code> and restart the backend server.
                </p>
              </div>
              <Link
                to="/admin/ai/overview"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <span>Return to Overview</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
