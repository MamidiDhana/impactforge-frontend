import type { CitizenProblem, CitizenProblemStatus, TrackingStage } from '../types'
import { buildInitialStages } from '../data/jharkhandData'

export interface BackendReportPayload {
  problem_title: string
  category: string
  context_and_desired_outcome: string | null
  existing_efforts: string | null
  expected_outcome: string | null
  state: string
  district: string
  locality: string
  address_or_landmark: string
  latitude: number | null
  longitude: number | null
  priority: string
}

export interface BackendReportResponse {
  track_id: string
  problem_title: string
  category: string
  context_and_desired_outcome: string | null
  existing_efforts: string | null
  expected_outcome: string | null
  state: string
  district: string
  locality: string
  address_or_landmark: string
  latitude: number | null
  longitude: number | null
  priority: string
  status: string
  created_at: string
  updated_at: string
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'

/**
 * Parses and formats error messages returned by the backend (specifically 422 validation errors).
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const errorData = await response.json()
    if (errorData?.detail) {
      if (Array.isArray(errorData.detail)) {
        const issues = errorData.detail.map((err: { loc?: string[]; msg?: string }) => {
          const field = err.loc && err.loc.length > 0 ? err.loc[err.loc.length - 1] : ''
          return field ? `${field}: ${err.msg}` : (err.msg || 'Invalid field')
        })
        return `Validation Error (422): ${issues.join(' | ')}`
      }
      if (typeof errorData.detail === 'string') {
        return errorData.detail
      }
    }
  } catch {
    // If response is not JSON
  }
  return `Server request failed with status ${response.status} (${response.statusText})`
}

/**
 * Submits a new problem report to the FastAPI backend.
 * Calls POST /api/reports
 */
export async function createReport(payload: BackendReportPayload): Promise<BackendReportResponse> {
  const url = `${API_BASE_URL}/api/reports`
  let response: Response

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error'
    throw new Error(`Unable to connect to backend at ${API_BASE_URL}. Ensure the server is running. (${errorMsg})`)
  }

  if (!response.ok) {
    const errorText = await extractErrorMessage(response)
    throw new Error(errorText)
  }

  return (await response.json()) as BackendReportResponse
}

/**
 * Fetches an individual problem report by its backend Track ID.
 * Calls GET /api/reports/{track_id}
 */
export async function getReportByTrackId(trackId: string): Promise<BackendReportResponse> {
  const cleanId = encodeURIComponent(trackId.trim())
  const url = `${API_BASE_URL}/api/reports/${cleanId}`
  let response: Response

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error'
    throw new Error(`Unable to connect to backend at ${API_BASE_URL}. (${errorMsg})`)
  }

  if (response.status === 404) {
    throw new Error(`Report with Track ID "${trackId}" not found. Please verify the ID.`)
  }

  if (!response.ok) {
    const errorText = await extractErrorMessage(response)
    throw new Error(errorText)
  }

  return (await response.json()) as BackendReportResponse
}

/**
 * Fetches all problem reports from the backend.
 * Calls GET /api/reports
 */
export async function getReports(): Promise<BackendReportResponse[]> {
  const url = `${API_BASE_URL}/api/reports`
  let response: Response

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network error'
    throw new Error(`Unable to connect to backend at ${API_BASE_URL}. (${errorMsg})`)
  }

  if (!response.ok) {
    const errorText = await extractErrorMessage(response)
    throw new Error(errorText)
  }

  return (await response.json()) as BackendReportResponse[]
}

/**
 * Maps a backend report response into the frontend CitizenProblem format,
 * calculating appropriate 15-stage timeline and location details for UI presentation.
 */
export function mapBackendReportToCitizenProblem(report: BackendReportResponse): CitizenProblem {
  const createdDate = new Date(report.created_at)
  const dateStr = !isNaN(createdDate.getTime())
    ? `${createdDate.getDate()} ${createdDate.toLocaleString('en-US', { month: 'short' })} ${createdDate.getFullYear()}`
    : 'Recent'

  const stages: TrackingStage[] = buildInitialStages(0, dateStr)

  let stageIndex = 1
  if (report.status === 'In Progress') {
    stageIndex = 7
    for (let i = 0; i <= 6; i++) {
      if (stages[i]) {
        stages[i].status = 'Completed'
        stages[i].date = dateStr
      }
    }
    if (stages[7]) {
      stages[7].status = 'In Progress'
      stages[7].date = dateStr
    }
  } else if (report.status === 'Resolved') {
    stageIndex = 14
    for (let i = 0; i < stages.length; i++) {
      stages[i].status = 'Completed'
      stages[i].date = dateStr
    }
  } else if (report.status === 'Rejected') {
    stageIndex = 0
    if (stages[0]) {
      stages[0].status = 'Completed'
      stages[0].date = dateStr
    }
  } else {
    // Open / Submitted
    stageIndex = 1
    if (stages[0]) {
      stages[0].status = 'Completed'
      stages[0].date = dateStr
    }
    if (stages[1]) {
      stages[1].status = 'In Progress'
      stages[1].date = dateStr
    }
  }

  const priorityNormalized = (['Low', 'Medium', 'High', 'Critical'].includes(report.priority)
    ? report.priority
    : 'Medium') as 'Low' | 'Medium' | 'High' | 'Critical'

  return {
    id: `report-${report.track_id}`,
    trackId: report.track_id,
    title: report.problem_title,
    description: report.context_and_desired_outcome || 'No description provided.',
    category: report.category,
    location: `${report.district}, Jharkhand${report.locality ? ` (${report.locality})` : ''}`,
    state: report.state || 'Jharkhand',
    district: report.district,
    locality: report.locality || '',
    landmark: report.address_or_landmark || '',
    latitude: report.latitude !== null ? report.latitude : undefined,
    longitude: report.longitude !== null ? report.longitude : undefined,
    status: report.status as CitizenProblemStatus,
    urgency: priorityNormalized,
    affectedPeople: 0,
    submittedAt: dateStr,
    lastUpdated: dateStr,
    currentStageIndex: stageIndex,
    timelineStages: stages,
    requiredCapabilities: ['Civic assessment', 'Field survey', 'Public consultation'],
    requiredResources: [
      {
        id: `res-${report.track_id}-1`,
        name: 'Technical Assessment',
        category: 'Experts',
        requiredQuantity: '1 Lead Analyst',
        status: report.status === 'In Progress' ? 'Available' : 'Required',
      },
      {
        id: `res-${report.track_id}-2`,
        name: 'Field Survey Verification',
        category: 'Data',
        requiredQuantity: 'District Sample Data',
        status: report.status === 'In Progress' ? 'Partner Identified' : 'Pending',
      },
    ],
  }
}
