const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(window.atob(base64))
    if (!payload.exp) return true
    // Valid if expiry is at least 30 seconds into the future
    return payload.exp * 1000 > Date.now() + 30000
  } catch {
    return false
  }
}

export async function getValidAuthToken(): Promise<string> {
  const existingToken =
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('token') ||
    ''

  if (existingToken && isTokenValid(existingToken)) {
    return existingToken
  }

  // Obtain authenticated JWT token from backend /api/auth/login for active admin session
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@impactforge.org',
        password: 'demo-password',
        role: 'admin',
      }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.access_token) {
        sessionStorage.setItem('access_token', data.access_token)
        localStorage.setItem('access_token', data.access_token)
        return data.access_token
      }
    }
  } catch (err) {
    console.error('Failed to establish authenticated session with AI backend:', err)
  }

  return existingToken
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidAuthToken()
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
  }
  if (options.body && typeof options.body === 'string') {
    baseHeaders['Content-Type'] = 'application/json'
  }
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`
  }

  const mergedHeaders = { ...baseHeaders, ...(options.headers as Record<string, string> || {}) }
  let res = await fetch(url, { ...options, headers: mergedHeaders })

  // If token was rejected (expired / rotated), clear storage, re-authenticate, and retry once
  if (res.status === 401) {
    sessionStorage.removeItem('access_token')
    localStorage.removeItem('access_token')
    const freshToken = await getValidAuthToken()
    if (freshToken) {
      mergedHeaders['Authorization'] = `Bearer ${freshToken}`
      res = await fetch(url, { ...options, headers: mergedHeaders })
    }
  }

  return res
}

async function extractError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (data?.detail) {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail)) {
        return data.detail.map((d: { msg?: string }) => d.msg || 'Validation error').join(', ')
      }
    }
  } catch {
    // Non-JSON response
  }
  return `Request failed with status ${response.status}`
}

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------
export interface AIOverviewData {
  provider: string
  model: string
  ai_enabled: boolean
  embedding_model: string
  embedding_enabled: boolean
  total_predictions: number
  correct_predictions: number
  incorrect_predictions: number
  pending_feedback: number
  last_retraining_date: string | null
  current_model_version: string
  accuracy_score: number
  health_status: string
  api_key_configured: boolean
}

export interface AIPredictionItem {
  id: string
  report_id: number
  track_id: string
  problem_title: string
  input_text: string
  prediction_type: 'category' | 'priority' | 'capability' | 'matching' | string
  predicted_value: any
  confidence_score: number
  explanation: string
  prediction_date: string
  model_version: string
  prediction_status: string
  feedback?: {
    status?: 'correct' | 'incorrect' | 'needs_review' | null
    reason?: string | null
    corrected?: any
  } | null
}

export interface AIPredictionDetail {
  id: string
  report_id: number
  track_id: string
  problem_title: string
  description?: string | null
  locality?: string
  district?: string
  state?: string
  category?: string
  subcategory?: string
  problem_type?: string
  priority?: string
  confidence_score: number
  summary?: string
  priority_reasons?: string[]
  capabilities?: any
  model_version: string
  feedback?: {
    id: number
    status: string
    reason: string
    corrected_value: any
    admin_feedback?: string
    reviewer?: string
    timestamp?: string
  } | null
}

export interface AIFeedbackPayload {
  report_id?: number
  prediction_type: string
  original_prediction?: any
  corrected_value?: any
  feedback_status: 'correct' | 'incorrect' | 'needs_review'
  feedback_reason: string
  admin_feedback?: string
  model_version?: string
}

export interface TrainingRecordItem {
  id: number
  feedback_id?: number | null
  input_text: string
  prediction_type: string
  original_prediction?: any
  target_label?: any
  feedback_reason?: string
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string | null
  approved_at?: string | null
  is_duplicate: boolean
  dataset_version: string
  created_at: string
}

export interface DatasetValidationResult {
  is_valid: boolean
  approved_records_count: number
  pending_records_count: number
  issues: string[]
  validation_message: string
}

export interface RetrainingJobItem {
  id: number
  job_id: string
  status: 'ready' | 'running' | 'completed' | 'failed' | 'cancelled' | string
  base_model_version: string
  candidate_model_version: string
  dataset_version: string
  approved_records_count: number
  progress_percent: number
  logs: string[]
  evaluation_metrics: {
    old_accuracy?: number
    new_accuracy?: number
    old_f1?: number
    new_f1?: number
    old_loss?: number
    new_loss?: number
    latency_ms?: number
  }
  approval_status: 'pending_review' | 'approved' | 'rejected'
  reviewed_by?: string | null
  reviewed_at?: string | null
  started_by?: string | null
  started_at?: string | null
  completed_at?: string | null
  created_at: string
}

export interface AISettingsData {
  ai_provider: string
  ai_model: string
  embedding_model: string
  multilingual_embedding_model: string
  ai_enabled: boolean
  embedding_enabled: boolean
  api_key_configured: boolean
  similarity_threshold_possible: number
  similarity_threshold_strong: number
  similarity_threshold_duplicate: number
  current_model_version: string
  note: string
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

export async function getAIOverview(): Promise<AIOverviewData> {
  const url = `${API_BASE_URL}/api/ai/overview`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function refreshAIMetrics(): Promise<AIOverviewData> {
  const url = `${API_BASE_URL}/api/ai/metrics/refresh`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) {
    // Graceful fallback to getAIOverview if POST not supported
    return getAIOverview()
  }
  return res.json()
}

export async function getAIPredictions(params?: {
  search?: string
  prediction_type?: string
  status_filter?: string
  min_confidence?: number
}): Promise<AIPredictionItem[]> {
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.prediction_type) query.set('prediction_type', params.prediction_type)
  if (params?.status_filter) query.set('status_filter', params.status_filter)
  if (params?.min_confidence !== undefined) query.set('min_confidence', String(params.min_confidence))

  const url = `${API_BASE_URL}/api/ai/predictions?${query.toString()}`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function getAIPredictionDetail(predictionId: string): Promise<AIPredictionDetail> {
  const url = `${API_BASE_URL}/api/ai/predictions/${encodeURIComponent(predictionId)}`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function submitAIFeedback(payload: AIFeedbackPayload): Promise<{ message: string; feedback_id: number; status: string }> {
  const url = `${API_BASE_URL}/api/ai/feedback`
  const res = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function getTrainingDataset(params?: {
  approval_status?: string
  search?: string
}): Promise<TrainingRecordItem[]> {
  const query = new URLSearchParams()
  if (params?.approval_status) query.set('approval_status', params.approval_status)
  if (params?.search) query.set('search', params.search)

  const url = `${API_BASE_URL}/api/ai/dataset?${query.toString()}`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function approveTrainingRecord(recordId: number): Promise<{ message: string; approval_status: string }> {
  const url = `${API_BASE_URL}/api/ai/dataset/${recordId}/approve`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function rejectTrainingRecord(recordId: number): Promise<{ message: string; approval_status: string }> {
  const url = `${API_BASE_URL}/api/ai/dataset/${recordId}/reject`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function deleteTrainingRecord(recordId: number): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/api/ai/dataset/${recordId}`
  const res = await authenticatedFetch(url, { method: 'DELETE' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function validateRetrainingDataset(): Promise<DatasetValidationResult> {
  const url = `${API_BASE_URL}/api/ai/retraining/validate`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function getRetrainingJobs(): Promise<RetrainingJobItem[]> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function createRetrainingJob(): Promise<{ message: string; job_id: string; status: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs`
  const res = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function startRetrainingJob(jobId: string): Promise<{ message: string; status: string; evaluation_metrics: any }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs/${encodeURIComponent(jobId)}/start`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function cancelRetrainingJob(jobId: string): Promise<{ message: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs/${encodeURIComponent(jobId)}/cancel`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function approveCandidateModel(jobId: string): Promise<{ message: string; approval_status: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs/${encodeURIComponent(jobId)}/approve-model`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function rejectCandidateModel(jobId: string): Promise<{ message: string; approval_status: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs/${encodeURIComponent(jobId)}/reject-model`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function deployCandidateModel(jobId: string): Promise<{ message: string; active_model_version: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/jobs/${encodeURIComponent(jobId)}/deploy`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function rollbackModelVersion(): Promise<{ message: string; active_model_version: string }> {
  const url = `${API_BASE_URL}/api/ai/retraining/rollback`
  const res = await authenticatedFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function getAISettings(): Promise<AISettingsData> {
  const url = `${API_BASE_URL}/api/ai/settings`
  const res = await authenticatedFetch(url, { method: 'GET' })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}

export async function updateAISettings(updates: Partial<AISettingsData>): Promise<AISettingsData> {
  const url = `${API_BASE_URL}/api/ai/settings`
  const res = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error(await extractError(res))
  return res.json()
}
