import { useState, useEffect } from 'react'
import { BarChart3, ShieldCheck, RefreshCw } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { StatCard } from '../../components/common/StatCard'
import { governmentAnalytics } from '../../data/governmentAnalytics'
import {
  getImpactSummary,
  getDistrictImpact,
  getCategoryImpact,
  getResolutionPerformanceAnalytics,
  type ImpactSummaryResponse,
  type DistrictImpactItem,
  type CategoryImpactItem,
  type ResolutionPerformanceResponse,
} from '../../services/reportService'
import { ImpactSummaryCards } from '../../components/analytics/ImpactSummaryCards'
import { AnalyticsExplanationPanel } from '../../components/analytics/AnalyticsExplanationPanel'
import { ResolutionPerformanceChart } from '../../components/analytics/ResolutionPerformanceChart'
import { DistrictImpactChart } from '../../components/analytics/DistrictImpactChart'
import { CategoryImpactChart } from '../../components/analytics/CategoryImpactChart'

export function GovernmentAnalyticsPage() {
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryResponse | null>(null)
  const [districts, setDistricts] = useState<DistrictImpactItem[]>([])
  const [categories, setCategories] = useState<CategoryImpactItem[]>([])
  const [resolutionPerf, setResolutionPerf] = useState<ResolutionPerformanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [sumRes, distRes, catRes, perfRes] = await Promise.all([
        getImpactSummary().catch(() => null),
        getDistrictImpact().catch(() => null),
        getCategoryImpact().catch(() => null),
        getResolutionPerformanceAnalytics().catch(() => null),
      ])
      if (sumRes) setImpactSummary(sumRes)
      if (distRes && distRes.districts) setDistricts(distRes.districts)
      if (catRes && catRes.categories) setCategories(catRes.categories)
      if (perfRes) setResolutionPerf(perfRes)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <GovernmentLayout title="Impact">
      <GovPage
        title="Civic Impact & Analytical Intelligence"
        description="Comprehensive evaluation across problems, technical feasibility, partner mobilization, and resolution performance."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Impact Analytics' },
        ]}
      >
        {/* Live Data Sync Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">
              Live PostgreSQL metrics synchronized across all Jharkhand districts &middot; Advisory Zero-Mutation
            </span>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>

        {/* Phase 1 AI Project & Impact Analytics Real Metrics */}
        <AnalyticsExplanationPanel />
        <ImpactSummaryCards summary={impactSummary} loading={isLoading} />

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <ResolutionPerformanceChart performance={resolutionPerf} loading={isLoading} />
          <DistrictImpactChart districts={districts} loading={isLoading} />
        </div>

        <div className="mb-8">
          <CategoryImpactChart categories={categories} loading={isLoading} />
        </div>

        {/* Traditional Indicators & Demonstrational Breakdown */}
        <div className="border-t border-slate-200 pt-6 mt-8">
          <h3 className="font-[Manrope] text-base font-bold text-slate-800 mb-3">
            Demographic Reference Indicators
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {governmentAnalytics.indicators.map((indicator) => (
              <StatCard
                key={indicator.label}
                label={indicator.label}
                value={indicator.value}
                description="Reference baseline"
                icon={BarChart3}
              />
            ))}
          </div>
        </div>
      </GovPage>
    </GovernmentLayout>
  )
}