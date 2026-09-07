import { useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  HeartPulse,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import {
  adminSystemHealth as initialHealth,
  adminSystemIncidents as initialIncidents,
} from '../../data/adminMockData'
import type { SystemHealthService, AdminSystemIncident } from '../../types/admin'

export function AdminSystemHealthPage() {
  const [services, setServices] = useState<SystemHealthService[]>(initialHealth)
  const [incidents] = useState<AdminSystemIncident[]>(initialIncidents)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleRefreshHealth = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => ({
          ...s,
          lastChecked: 'Just now',
          responseTime: `${Math.floor(Math.random() * 25) + 18}ms`,
        }))
      )
      setIsRefreshing(false)
      setFeedback('Live cluster diagnostics refreshed. All core services responding normally.')
      setTimeout(() => setFeedback(null), 4000)
    }, 900)
  }

  const getServiceIcon = (service: string) => {
    if (service.includes('API')) return Server
    if (service.includes('PostgreSQL') || service.includes('Database')) return Database
    if (service.includes('Authentication')) return ShieldCheck
    if (service.includes('AI')) return Sparkles
    if (service.includes('Vector')) return Zap
    if (service.includes('Storage')) return HardDrive
    return Activity
  }

  return (
    <AdminLayout title="System Health">
      <AdminPage
        title="System Health"
        description="Real-time uptime metrics, database cluster health, and service latency."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'System Health' },
        ]}
        action={
          <button
            type="button"
            disabled={isRefreshing}
            onClick={handleRefreshHealth}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a] disabled:opacity-60"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Pinging Services...' : 'Refresh Status'}
          </button>
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

          {/* Top Level Telemetry Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Status */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Platform Status
                </span>
                <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-black text-emerald-900">
                Operational
              </p>
              <p className="mt-1 text-xs text-emerald-700 font-semibold">
                99.98% 30-Day SLA Uptime
              </p>
            </div>

            {/* Response Time */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Avg Response Time</span>
                <Clock size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                34 ms
              </p>
              <p className="mt-1 text-xs text-slate-400">
                P99 ceiling: 110ms on inference
              </p>
            </div>

            {/* Error Rate */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Global Error Rate</span>
                <Activity size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                0.015%
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-semibold">
                Within 0.05% SLO target
              </p>
            </div>

            {/* Compute Nodes */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Compute Clusters</span>
                <Server size={16} className="text-slate-400" />
              </div>
              <p className="mt-2 font-[Manrope] text-2xl font-bold text-[#13243b]">
                12 / 12 Healthy
              </p>
              <p className="mt-1 text-xs text-slate-400">
                3 zones across MeitY cloud
              </p>
            </div>
          </div>

          {/* Core Services Telemetry Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Subsystem Health & Live Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status indicators across all seven platform services
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Refreshed every 60s
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Subsystem</th>
                    <th className="px-4 py-3">Health Status</th>
                    <th className="px-4 py-3">Uptime</th>
                    <th className="px-4 py-3">Response Time</th>
                    <th className="px-4 py-3">Error Rate</th>
                    <th className="px-4 py-3 text-right">Heartbeat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((item) => {
                    const Icon = getServiceIcon(item.service)
                    const isHealthy = item.status === 'Operational'
                    const isDegraded = item.status === 'Degraded'

                    return (
                      <tr key={item.service} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                              <Icon size={16} />
                            </span>
                            <span className="font-bold text-slate-800">{item.service}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isHealthy
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isDegraded
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isHealthy
                                  ? 'bg-emerald-500'
                                  : isDegraded
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-700 font-medium">
                          {item.uptime}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-700 font-medium">
                          {item.responseTime}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-700 font-medium">
                          {item.errorRate}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap text-[11px] text-slate-400">
                          {item.lastChecked}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent System Incidents Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse size={18} className="text-[#187e8d]" />
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Recent System Incidents & Scheduled Maintenance
                </h3>
              </div>
              <span className="text-xs text-slate-400">Past 30 Days</span>
            </div>

            <div className="mt-4 space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 size={11} /> {inc.status}
                      </span>
                      <h4 className="font-bold text-sm text-[#13243b]">{inc.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">{inc.time}</span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                    <span>Impacted Service: <strong className="text-slate-600">{inc.service}</strong></span>
                    <span>Resolution Duration: <strong className="text-slate-600">{inc.duration}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
