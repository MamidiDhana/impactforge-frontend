import {
  FilePlus2,
  Clock,
  CheckCircle2,
  Users,
  Handshake,
  AlertCircle,
  FileText,
  Tags,
  Bell,
  FileCheck2,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { StatCard } from '../common/StatCard'
import { SectionHeader } from '../common/SectionHeader'
import {
  getImpactSummary,
  type BackendReportResponse,
  type ImpactSummaryResponse,
} from '../../services/reportService'
import { ImpactSummaryCards } from '../analytics/ImpactSummaryCards'
import { AnalyticsExplanationPanel } from '../analytics/AnalyticsExplanationPanel'
import type { AdminSection } from './AdminSidebar'
import { useAdmin } from '../../context/AdminContext'
import { usePartner } from '../../context/PartnerContext'

interface AdminOverviewProps {
  reports: BackendReportResponse[]
  onSelectSection: (section: AdminSection) => void
}

export function AdminOverview({ reports, onSelectSection }: AdminOverviewProps) {
  const { users, categories, announcements, auditLogs } = useAdmin()
  const { partnerProjects } = usePartner()
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryResponse | null>(null)
  const [isLoadingImpact, setIsLoadingImpact] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    getImpactSummary()
      .then((res) => {
        if (isMounted) setImpactSummary(res)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingImpact(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Live report counts
  const totalReports = reports.length
  const openReports = reports.filter((r) => r.status.toLowerCase() === 'open').length
  const inProgressReports = reports.filter((r) => r.status.toLowerCase() === 'in progress').length
  const resolvedReports = reports.filter(
    (r) => r.status.toLowerCase() === 'resolved' || r.status.toLowerCase() === 'completed'
  ).length

  // User and partnership counts
  const totalUsers = users.length
  const activePartnerships = Object.values(partnerProjects).filter(
    (p) =>
      p.status === 'Discussion Started' ||
      p.status === 'Support Confirmed' ||
      p.status === 'In Progress'
  ).length

  const quickNavs: { id: AdminSection; title: string; desc: string; icon: any; count: number | string }[] = [
    {
      id: 'reports',
      title: 'Reports Management',
      desc: 'Audit and modify live citizen problem resolution statuses.',
      icon: FileText,
      count: totalReports,
    },
    {
      id: 'users',
      title: 'User Management',
      desc: 'Manage stakeholders across Citizen, Govt, HEI, Faculty, and Partner roles.',
      icon: Users,
      count: totalUsers,
    },
    {
      id: 'categories',
      title: 'Taxonomy & Categories',
      desc: 'Configure core civic problem categories and active scopes.',
      icon: Tags,
      count: categories.length,
    },
    {
      id: 'announcements',
      title: 'Broadcast Announcements',
      desc: 'Send high-priority notifications to targeted portal user groups.',
      icon: Bell,
      count: announcements.filter((a) => a.active).length,
    },
    {
      id: 'audit',
      title: 'System Audit Logs',
      desc: 'Chronological tracking of state changes and administrative operations.',
      icon: FileCheck2,
      count: auditLogs.length,
    },
    {
      id: 'settings',
      title: 'Portal Governance Settings',
      desc: 'Platform identity, intake toggles, and default system parameters.',
      icon: Settings,
      count: 'Config',
    },
  ]

  return (
    <div className="space-y-6">
      {/* AI Project & Impact Analytics (Phase 1 Part 11) */}
      <AnalyticsExplanationPanel />
      <ImpactSummaryCards summary={impactSummary} loading={isLoadingImpact} />

      {/* 6 Summary Cards */}
      <section>
        <SectionHeader
          title="State Platform Command Overview"
          description="Live platform analytics combining PostgreSQL report registries and local governance entities."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Citizen Reports"
            value={String(totalReports)}
            description="Live PostgreSQL records"
            icon={FilePlus2}
          />
          <StatCard
            label="Open Reports"
            value={String(openReports)}
            description="Awaiting department action"
            icon={AlertCircle}
          />
          <StatCard
            label="In Progress"
            value={String(inProgressReports)}
            description="Academic / govt action"
            icon={Clock}
          />
          <StatCard
            label="Resolved Reports"
            value={String(resolvedReports)}
            description="Successfully addressed"
            icon={CheckCircle2}
          />
          <StatCard
            label="Total Users"
            value={String(totalUsers)}
            description="Active portal accounts"
            icon={Users}
          />
          <StatCard
            label="Active Partnerships"
            value={String(activePartnerships)}
            description="CSR & NGO pledges"
            icon={Handshake}
          />
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="space-y-3">
        <SectionHeader
          title="Super Admin Control Modules"
          description="Jump directly into specific governance sections to configure and manage platform operations."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickNavs.map((nav) => {
            const Icon = nav.icon
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => onSelectSection(nav.id)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#187e8d] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-[#12365a] transition group-hover:bg-teal-50 group-hover:text-[#187e8d]">
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                      {nav.count}
                    </span>
                  </div>
                  <h4 className="mt-3.5 font-[Manrope] text-sm font-bold text-[#13243b] group-hover:text-[#187e8d]">
                    {nav.title}
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{nav.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#187e8d]">
                  <span>Open Console</span>
                  <ArrowRight size={13} className="transition group-hover:translate-x-1" />
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
