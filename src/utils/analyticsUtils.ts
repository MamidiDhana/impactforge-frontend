import type { BackendReportResponse } from '../services/reportService'

export type NormalizedStatus = 'Open' | 'In Progress' | 'Resolved' | 'Rejected' | 'Other'
export type NormalizedUrgency = 'Low' | 'Medium' | 'High' | 'Critical'

export interface SummaryStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  rejected: number
  highUrgency: number
  criticalUrgency: number
  resolutionRate: number // 0 to 100, safe from NaN
}

export interface StatusSlice {
  name: string
  value: number
  color: string
}

export interface CategoryMetric {
  category: string
  count: number
}

export interface DistrictMetric {
  district: string
  count: number
}

export interface UrgencySlice {
  urgency: string
  count: number
  color: string
}

export interface TrendMetric {
  date: string
  count: number
  timestamp: number
}

export interface ImpactHighlightsData {
  mostAffectedDistrict: string
  mostAffectedDistrictCount: number
  mostReportedCategory: string
  mostReportedCategoryCount: number
  highUrgencyTotal: number
  resolvedProblemsCount: number
  activeProblemAreasCount: number // Unique district + category combinations with active problems
}

/**
 * Normalizes raw report status strings into canonical values.
 */
export function normalizeStatus(raw?: string | null): NormalizedStatus {
  if (!raw) return 'Open'
  const s = raw.trim().toLowerCase()
  if (s === 'open' || s === 'submitted') return 'Open'
  if (s === 'in progress' || s === 'inprogress' || s === 'active') return 'In Progress'
  if (s === 'resolved' || s === 'completed' || s === 'closed') return 'Resolved'
  if (s === 'rejected' || s === 'cancelled' || s === 'declined') return 'Rejected'
  return 'Other'
}

/**
 * Normalizes raw priority/urgency strings into canonical values.
 */
export function normalizeUrgency(raw?: string | null): NormalizedUrgency {
  if (!raw) return 'Medium'
  const u = raw.trim().toLowerCase()
  if (u === 'critical') return 'Critical'
  if (u === 'high') return 'High'
  if (u === 'low') return 'Low'
  return 'Medium'
}

/**
 * Normalizes district names, providing a safe fallback.
 */
export function normalizeDistrict(raw?: string | null): string {
  if (!raw || !raw.trim()) return 'Unknown District'
  return raw.trim()
}

/**
 * Normalizes category names, providing a safe fallback.
 */
export function normalizeCategory(raw?: string | null): string {
  if (!raw || !raw.trim()) return 'Uncategorized'
  return raw.trim()
}

/**
 * Calculates core summary metrics safely without NaN or Infinity.
 */
export function calculateSummaryStats(reports: BackendReportResponse[]): SummaryStats {
  const total = reports.length
  let open = 0
  let inProgress = 0
  let resolved = 0
  let rejected = 0
  let highUrgency = 0
  let criticalUrgency = 0

  for (const r of reports) {
    const st = normalizeStatus(r.status)
    if (st === 'Open') open++
    else if (st === 'In Progress') inProgress++
    else if (st === 'Resolved') resolved++
    else if (st === 'Rejected') rejected++

    const urg = normalizeUrgency(r.priority)
    if (urg === 'High') highUrgency++
    else if (urg === 'Critical') criticalUrgency++
  }

  const resolutionRate = total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0

  return {
    total,
    open,
    inProgress,
    resolved,
    rejected,
    highUrgency,
    criticalUrgency,
    resolutionRate: isFinite(resolutionRate) ? resolutionRate : 0,
  }
}

/**
 * Status distribution breakdown with theme colors.
 */
export function calculateStatusDistribution(reports: BackendReportResponse[]): StatusSlice[] {
  const stats = calculateSummaryStats(reports)
  return [
    { name: 'Open', value: stats.open, color: '#f59e0b' }, // Amber
    { name: 'In Progress', value: stats.inProgress, color: '#0284c7' }, // Sky
    { name: 'Resolved', value: stats.resolved, color: '#10b981' }, // Emerald
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }, // Red
  ]
}

/**
 * Category distribution sorted by count descending.
 */
export function calculateCategoryDistribution(reports: BackendReportResponse[]): CategoryMetric[] {
  const counts: Record<string, number> = {}
  for (const r of reports) {
    const cat = normalizeCategory(r.category)
    counts[cat] = (counts[cat] || 0) + 1
  }

  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * District problem counts sorted by count descending.
 */
export function calculateDistrictDistribution(reports: BackendReportResponse[]): DistrictMetric[] {
  const counts: Record<string, number> = {}
  for (const r of reports) {
    const dist = normalizeDistrict(r.district)
    counts[dist] = (counts[dist] || 0) + 1
  }

  return Object.entries(counts)
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Urgency distribution for Low, Medium, High, Critical.
 */
export function calculateUrgencyDistribution(reports: BackendReportResponse[]): UrgencySlice[] {
  const counts: Record<NormalizedUrgency, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  }

  for (const r of reports) {
    const urg = normalizeUrgency(r.priority)
    counts[urg]++
  }

  return [
    { urgency: 'Low', count: counts.Low, color: '#64748b' }, // Slate
    { urgency: 'Medium', count: counts.Medium, color: '#0284c7' }, // Sky
    { urgency: 'High', count: counts.High, color: '#f59e0b' }, // Amber
    { urgency: 'Critical', count: counts.Critical, color: '#ef4444' }, // Rose
  ]
}

/**
 * Formats an ISO string into standard readable date.
 */
export function formatReportDate(isoString?: string | null): string {
  if (!isoString) return 'Not available'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return 'Not available'
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Not available'
  }
}

/**
 * Calculates date-based submission trend.
 * Returns empty array if no valid dates exist.
 */
export function calculateDateTrends(reports: BackendReportResponse[]): TrendMetric[] {
  const dateMap: Record<string, { count: number; timestamp: number }> = {}

  for (const r of reports) {
    if (!r.created_at) continue
    const d = new Date(r.created_at)
    if (isNaN(d.getTime())) continue

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dayTimestamp = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

    if (!dateMap[key]) {
      dateMap[key] = { count: 0, timestamp: dayTimestamp }
    }
    dateMap[key].count++
  }

  const entries = Object.entries(dateMap).map(([key, data]) => {
    const d = new Date(key)
    const label = !isNaN(d.getTime())
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : key
    return {
      date: label,
      count: data.count,
      timestamp: data.timestamp,
    }
  })

  return entries.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Calculates strategic highlights and most affected areas.
 */
export function calculateImpactHighlights(reports: BackendReportResponse[]): ImpactHighlightsData {
  const districtCounts: Record<string, number> = {}
  const categoryCounts: Record<string, number> = {}
  const activeAreas = new Set<string>()

  let highUrgencyTotal = 0
  let resolvedProblemsCount = 0

  for (const r of reports) {
    const dist = normalizeDistrict(r.district)
    const cat = normalizeCategory(r.category)
    const st = normalizeStatus(r.status)
    const urg = normalizeUrgency(r.priority)

    districtCounts[dist] = (districtCounts[dist] || 0) + 1
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1

    if (urg === 'High' || urg === 'Critical') {
      highUrgencyTotal++
    }

    if (st === 'Resolved') {
      resolvedProblemsCount++
    } else if (st === 'Open' || st === 'In Progress') {
      // Area with active problems
      activeAreas.add(`${dist}::${cat}`)
    }
  }

  // Find top district
  let mostAffectedDistrict = 'None'
  let mostAffectedDistrictCount = 0
  for (const [dist, count] of Object.entries(districtCounts)) {
    if (count > mostAffectedDistrictCount) {
      mostAffectedDistrictCount = count
      mostAffectedDistrict = dist
    }
  }

  // Find top category
  let mostReportedCategory = 'None'
  let mostReportedCategoryCount = 0
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > mostReportedCategoryCount) {
      mostReportedCategoryCount = count
      mostReportedCategory = cat
    }
  }

  return {
    mostAffectedDistrict,
    mostAffectedDistrictCount,
    mostReportedCategory,
    mostReportedCategoryCount,
    highUrgencyTotal,
    resolvedProblemsCount,
    activeProblemAreasCount: activeAreas.size,
  }
}
