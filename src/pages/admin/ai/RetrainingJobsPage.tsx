import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Eye,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../../layouts/AdminLayout'
import { AdminPage } from '../../../components/admin/AdminShared'
import { Modal } from '../../../components/common/Modal'
import {
  getRetrainingJobs,
  createRetrainingJob,
  startRetrainingJob,
  cancelRetrainingJob,
  approveCandidateModel,
  rejectCandidateModel,
  deployCandidateModel,
  rollbackModelVersion,
  validateRetrainingDataset,
  type RetrainingJobItem,
  type DatasetValidationResult,
} from '../../../services/aiManagementService'

export function RetrainingJobsPage() {
  const [jobs, setJobs] = useState<RetrainingJobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Dataset Validation state
  const [validation, setValidation] = useState<DatasetValidationResult | null>(null)

  // Confirmation Modal states
  const [isConfirmStartOpen, setIsConfirmStartOpen] = useState(false)
  const [targetJobToStart, setTargetJobToStart] = useState<RetrainingJobItem | null>(null)
  const [isRollbackConfirmOpen, setIsRollbackConfirmOpen] = useState(false)

  // Details / Logs Modal
  const [activeJobDetail, setActiveJobDetail] = useState<RetrainingJobItem | null>(null)

  // Action in-flight states
  const [actionInProgress, setActionInProgress] = useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4500)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [jobsData, validData] = await Promise.all([
        getRetrainingJobs(),
        validateRetrainingDataset(),
      ])
      setJobs(jobsData)
      setValidation(validData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch retraining jobs.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateJob = async () => {
    setActionInProgress(true)
    setError(null)
    try {
      const res = await createRetrainingJob()
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Job creation failed.'
      setError(msg)
    } finally {
      setActionInProgress(false)
    }
  }

  const handlePromptStart = (job: RetrainingJobItem) => {
    setTargetJobToStart(job)
    setIsConfirmStartOpen(true)
  }

  const handleConfirmStart = async () => {
    if (!targetJobToStart) return
    setIsConfirmStartOpen(false)
    setActionInProgress(true)
    try {
      const res = await startRetrainingJob(targetJobToStart.job_id)
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to execute retraining job.'
      setError(msg)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      const res = await cancelRetrainingJob(jobId)
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to cancel job.'
      setError(msg)
    }
  }

  const handleApproveModel = async (jobId: string) => {
    try {
      const res = await approveCandidateModel(jobId)
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed.'
      setError(msg)
    }
  }

  const handleRejectModel = async (jobId: string) => {
    try {
      const res = await rejectCandidateModel(jobId)
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rejection failed.'
      setError(msg)
    }
  }

  const handleDeployModel = async (jobId: string) => {
    if (!window.confirm('Deploy this evaluated model to production? All future inferences will run on this new version.')) {
      return
    }
    setActionInProgress(true)
    try {
      const res = await deployCandidateModel(jobId)
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deployment failed.'
      setError(msg)
    } finally {
      setActionInProgress(false)
    }
  }

  const handleRollback = async () => {
    setIsRollbackConfirmOpen(false)
    setActionInProgress(true)
    try {
      const res = await rollbackModelVersion()
      showToast(res.message)
      await loadData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rollback failed.'
      setError(msg)
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <AdminLayout title="AI Retraining Pipeline">
      <AdminPage
        title="AI Retraining & Lifecycle Pipeline"
        description="Controlled multi-stage retraining pipeline with human-in-the-loop evaluation, manual deployment gating, and one-click rollback."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'AI Management', href: '/admin/ai/overview' },
          { label: 'Retraining Jobs' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsRollbackConfirmOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-2xs"
            >
              <RotateCcw size={14} className="text-amber-700" />
              <span>Roll Back Model</span>
            </button>
            <button
              type="button"
              onClick={handleCreateJob}
              disabled={actionInProgress || !validation?.is_valid}
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Cpu size={14} className="text-teal-300" />
              <span>Create Retraining Job</span>
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
            <button type="button" onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)} className="text-rose-600 hover:text-rose-950">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Retraining Workflow Visualizer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <h3 className="font-[Manrope] text-sm font-bold text-slate-900">
            Mandatory Retraining Safety Workflow
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="font-bold text-slate-400 text-[10px] block">Step 1</span>
              <span className="font-bold text-slate-800">Review Feedback</span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200">
              <span className="font-bold text-slate-400 text-[10px] block">Step 2</span>
              <span className="font-bold text-slate-800">Approve Records</span>
            </div>
            <div className="rounded-xl bg-teal-50 p-2.5 border border-teal-200">
              <span className="font-bold text-[#187e8d] text-[10px] block">Step 3</span>
              <span className="font-bold text-[#12365a]">Validate Dataset</span>
            </div>
            <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-200">
              <span className="font-bold text-blue-600 text-[10px] block">Step 4</span>
              <span className="font-bold text-blue-950">Create Job</span>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200">
              <span className="font-bold text-amber-600 text-[10px] block">Step 5</span>
              <span className="font-bold text-amber-950">Confirm & Run</span>
            </div>
            <div className="rounded-xl bg-purple-50 p-2.5 border border-purple-200">
              <span className="font-bold text-purple-600 text-[10px] block">Step 6</span>
              <span className="font-bold text-purple-950">Evaluate & Review</span>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-200">
              <span className="font-bold text-emerald-600 text-[10px] block">Step 7</span>
              <span className="font-bold text-emerald-950">Deploy / Rollback</span>
            </div>
          </div>
        </div>

        {/* Dataset Readiness & Safety Policy Notice */}
        {validation && (
          <div className={`rounded-2xl border p-4 text-xs shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            validation.is_valid
              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
              : 'border-amber-200 bg-amber-50/60 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {validation.is_valid ? (
                <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {validation.is_valid ? 'Retraining Pre-Flight Checks Passed' : 'Pre-Flight Requirements Pending'}
                </p>
                <p className="mt-0.5 leading-relaxed">
                  {validation.validation_message} ({validation.approved_records_count} approved records ready).
                  {!validation.is_valid && validation.issues.length > 0 && (
                    <span className="font-semibold text-amber-800 block mt-1">
                      Requirement: {validation.issues[0]}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Link
              to="/admin/ai/dataset"
              className="inline-flex items-center gap-1.5 font-bold text-xs underline shrink-0 hover:opacity-80"
            >
              <span>Manage Dataset</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Retraining Jobs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-[Manrope] text-base font-bold text-slate-900">
              Retraining Pipelines & Versions ({jobs.length})
            </h3>
            <button
              type="button"
              onClick={loadData}
              className="text-xs font-semibold text-[#187e8d] hover:underline"
            >
              Refresh Status
            </button>
          </div>

          {loading && jobs.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
              <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <Cpu size={36} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">No Retraining Jobs Created</h4>
              <p className="text-xs text-slate-500 mt-1">Click "Create Retraining Job" once your dataset has approved ground-truth pairs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-4"
                >
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`grid size-9 place-items-center rounded-xl font-mono text-xs font-bold ${
                        job.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : job.status === 'running'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {job.job_id.split('-').pop()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{job.job_id}</span>
                          <span className={`capitalize rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            job.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : job.status === 'running'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : job.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Base: <code className="font-bold text-slate-800">{job.base_model_version}</code> → Candidate: <code className="font-bold text-teal-700">{job.candidate_model_version}</code>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveJobDetail(job)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      >
                        <Eye size={13} />
                        <span>Inspect & Logs</span>
                      </button>

                      {job.status === 'ready' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePromptStart(job)}
                            disabled={actionInProgress}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                          >
                            <Play size={13} />
                            <span>Start Pipeline</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelJob(job.job_id)}
                            className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {job.status === 'completed' && job.approval_status !== 'approved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveModel(job.job_id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-xs"
                          >
                            <CheckCircle2 size={13} />
                            <span>Approve Candidate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectModel(job.job_id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {job.status === 'completed' && job.approval_status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleDeployModel(job.job_id)}
                          disabled={actionInProgress}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#12365a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0f2d4a] transition shadow-xs"
                        >
                          <ShieldCheck size={13} className="text-teal-300" />
                          <span>Deploy to Production</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Evaluation Metrics Comparison */}
                  {job.evaluation_metrics && Object.keys(job.evaluation_metrics).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Accuracy Metric</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-500">{job.evaluation_metrics.old_accuracy}%</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span className="font-extrabold text-emerald-700">{job.evaluation_metrics.new_accuracy}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">F1-Score</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-500">{job.evaluation_metrics.old_f1}%</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span className="font-extrabold text-emerald-700">{job.evaluation_metrics.new_f1}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Loss Delta</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-500">{job.evaluation_metrics.old_loss}</span>
                          <ArrowRight size={12} className="text-slate-400" />
                          <span className="font-extrabold text-blue-700">{job.evaluation_metrics.new_loss}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Latency</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {job.evaluation_metrics.latency_ms || 315} ms
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Job Progress & Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                      <span>Dataset: <strong className="text-slate-700">{job.dataset_version}</strong> ({job.approved_records_count} records)</span>
                      <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      {job.reviewed_by && (
                        <span className="font-semibold text-purple-800">
                          Reviewed by {job.reviewed_by}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation Modal: Start Job */}
        {isConfirmStartOpen && targetJobToStart && (
          <Modal
            open={isConfirmStartOpen}
            onClose={() => setIsConfirmStartOpen(false)}
            title="Confirm Retraining Job Execution"
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Caution: Retraining Confirmation Required</p>
                  <p className="leading-relaxed">
                    “This action may change future AI predictions. Do you want to continue?”
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 border border-slate-200 font-mono">
                <p>Job ID: <strong>{targetJobToStart.job_id}</strong></p>
                <p>Base Model: {targetJobToStart.base_model_version}</p>
                <p>Target Candidate: {targetJobToStart.candidate_model_version}</p>
                <p>Approved Training Records: {targetJobToStart.approved_records_count}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsConfirmStartOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStart}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Confirm & Execute Retraining
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Confirmation Modal: Rollback */}
        {isRollbackConfirmOpen && (
          <Modal
            open={isRollbackConfirmOpen}
            onClose={() => setIsRollbackConfirmOpen(false)}
            title="Roll Back Active Production Model"
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-950 flex items-start gap-3">
                <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Emergency Model Rollback</p>
                  <p className="leading-relaxed">
                    Rolling back will immediately demote the active production model and restore the preceding deprecated stable checkpoint. All future predictions will execute on the restored model.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRollbackConfirmOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRollback}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
                >
                  Confirm Immediate Rollback
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Details & Logs Modal */}
        {activeJobDetail && (
          <Modal
            open={Boolean(activeJobDetail)}
            onClose={() => setActiveJobDetail(null)}
            title={`Retraining Execution Telemetry: ${activeJobDetail.job_id}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-[#187e8d]">{activeJobDetail.job_id}</span>
                  <p className="text-xs text-slate-500">
                    Candidate: {activeJobDetail.candidate_model_version}
                  </p>
                </div>
                <span className="capitalize font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">
                  Status: {activeJobDetail.status}
                </span>
              </div>

              {/* Terminal Logs View */}
              <div className="rounded-xl bg-slate-950 p-4 text-emerald-400 font-mono text-[11px] space-y-1.5 max-h-64 overflow-y-auto shadow-inner">
                <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-slate-800">
                  <Terminal size={13} />
                  <span>Pipeline Execution Logs</span>
                </div>
                {activeJobDetail.logs && activeJobDetail.logs.length > 0 ? (
                  activeJobDetail.logs.map((line, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No logs recorded for this job yet.</p>
                )}
              </div>

              {/* Model Comparison Table */}
              {activeJobDetail.evaluation_metrics && Object.keys(activeJobDetail.evaluation_metrics).length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <h5 className="font-bold text-xs text-slate-900">
                    Old Model vs New Model Evaluation
                  </h5>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 font-bold block">Base Accuracy</span>
                      <span className="font-semibold text-slate-700">{activeJobDetail.evaluation_metrics.old_accuracy}%</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 font-bold block">Candidate Accuracy</span>
                      <span className="font-extrabold text-emerald-800">{activeJobDetail.evaluation_metrics.new_accuracy}%</span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <span className="text-[10px] text-blue-700 font-bold block">Test Loss Delta</span>
                      <span className="font-extrabold text-blue-800">{activeJobDetail.evaluation_metrics.new_loss}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveJobDetail(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
