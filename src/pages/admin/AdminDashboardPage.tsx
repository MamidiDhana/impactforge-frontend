import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  FolderTree,
  KeyRound,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { StatCard } from '../../components/common/StatCard'
import {
  adminUsers as initialUsers,
  adminOrganizations as initialOrgs,
  adminAuditLogs,
} from '../../data/adminMockData'
import type { AdminOrganization } from '../../types/admin'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<AdminOrganization[]>(initialOrgs)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Pending organizations
  const pendingOrgs = organizations.filter(
    (o) => o.verificationStatus === 'Pending' || o.verificationStatus === 'More Info Required'
  )

  // Recent user registrations (latest 5)
  const recentUsers = initialUsers.slice(0, 5)

  const handleApproveOrg = (orgId: string, orgName: string) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, verificationStatus: 'Verified' } : o))
    )
    setFeedback(`Organization "${orgName}" has been successfully verified!`)
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleRejectOrg = (orgId: string, orgName: string) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, verificationStatus: 'Rejected' } : o))
    )
    setFeedback(`Verification for "${orgName}" was rejected. Notice dispatched.`)
    setTimeout(() => setFeedback(null), 4500)
  }

  return (
    <AdminLayout title="Super Admin">
      <AdminPage
        title="Super Admin"
        description="Manage platform operations and governance"
        breadcrumbs={[{ label: 'Super Admin' }]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users size={14} />
              Manage Users
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/organizations')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
            >
              <Building2 size={14} />
              Review Organizations
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          {/* Feedback Toast */}
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* 1. Key Platform Stat Cards */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                label="Total Users"
                value="3,842"
                trend="+12%"
                trendDirection="up"
                description="this month"
                icon={Users}
              />
              <StatCard
                label="Active Organizations"
                value="184"
                trend="+18"
                trendDirection="up"
                description="HEIs & partners"
                icon={Building2}
              />
              <StatCard
                label="Pending Verifications"
                value={pendingOrgs.length}
                trend="Action required"
                trendDirection={pendingOrgs.length > 0 ? 'down' : 'neutral'}
                description="Compliance review"
                icon={FileCheck}
              />
              <StatCard
                label="Total Problems"
                value="1,248"
                trend="+89"
                trendDirection="up"
                description="this week"
                icon={Layers}
              />
              <StatCard
                label="Active Projects"
                value="342"
                trend="+14"
                trendDirection="up"
                description="in pilot phase"
                icon={ShieldCheck}
              />
              <StatCard
                label="AI Requests Today"
                value="48.6K"
                trend="99.4%"
                trendDirection="up"
                description="accuracy rate"
                icon={Cpu}
              />
            </div>
          </section>

          {/* 2. Quick Action Buttons */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Platform Governance Quick Actions
            </p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                  <Users size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">User Access</p>
                  <p className="text-[10px] text-slate-400">Directory & locks</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/roles')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <KeyRound size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Role Matrix</p>
                  <p className="text-[10px] text-slate-400">Permissions ACL</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/organizations')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Building2 size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Verify Orgs</p>
                  <p className="text-[10px] text-slate-400">HEI / Partner vetting</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/taxonomy')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <FolderTree size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Taxonomy</p>
                  <p className="text-[10px] text-slate-400">Categories & skills</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/ai-models')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-700">
                  <Sparkles size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">AI Models</p>
                  <p className="text-[10px] text-slate-400">6 engines active</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/system-health')}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-3 text-left transition hover:border-[#187e8d] hover:bg-slate-50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-50 text-rose-700">
                  <Activity size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Health Core</p>
                  <p className="text-[10px] text-slate-400">99.98% uptime</p>
                </div>
              </button>
            </div>
          </section>

          {/* 3. Main Operational Grids: Pending Verifications & Health Summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Pending Organization Verification Table (2 cols) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Pending Organization Verifications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Institutions and corporate partners awaiting compliance approval
                  </p>
                </div>
                <Link
                  to="/admin/organizations"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
                >
                  View all ({organizations.length})
                  <ArrowRight size={14} />
                </Link>
              </div>

              {pendingOrgs.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                  All organizations are currently verified. No pending items.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Organization</th>
                        <th className="px-3 py-2.5">Type</th>
                        <th className="px-3 py-2.5">Contact Lead</th>
                        <th className="px-3 py-2.5">Docs</th>
                        <th className="px-3 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingOrgs.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-50/70">
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-800">{org.name}</p>
                            <p className="text-[11px] text-slate-400">{org.location}</p>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {org.type}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <p className="font-medium text-slate-700">{org.contactPerson}</p>
                            <p className="text-[10px] text-slate-400">{org.email}</p>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                                org.documentsStatus === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : org.documentsStatus === 'Submitted'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {org.documentsStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveOrg(org.id, org.name)}
                                className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectOrg(org.id, org.name)}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Platform Health Summary Widget (1 col) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[#187e8d]" />
                    <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      Platform Health
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    All Systems Operational
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium">Core API Gateway</span>
                    <span className="font-bold text-emerald-700">28ms · 99.99%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium">PostgreSQL Cluster</span>
                    <span className="font-bold text-emerald-700">12ms · 99.98%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium">AI Inference Nodes</span>
                    <span className="font-bold text-emerald-700">85ms · 99.92%</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-slate-600 font-medium">Vector Search (Milvus)</span>
                    <span className="font-bold text-emerald-700">44ms · 99.95%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/admin/system-health')}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <Activity size={14} />
                  Inspect Full Diagnostics
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Secondary Grids: Recent Users Table & Live Activity Feed */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent User Registrations (2 cols) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Recent User Registrations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Newly onboarded citizens, faculty, students, and institutional representatives
                  </p>
                </div>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#187e8d] hover:underline"
                >
                  View Directory ({initialUsers.length})
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5">User</th>
                      <th className="px-3 py-2.5">Role</th>
                      <th className="px-3 py-2.5">Organization</th>
                      <th className="px-3 py-2.5">Joined</th>
                      <th className="px-3 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-7 place-items-center rounded-full bg-[#d9eeee] font-bold text-[#12365a] text-[11px]">
                              {u.avatar ?? u.name.charAt(0)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{u.name}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3 py-3 max-w-[200px] truncate">
                          {u.organization}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-slate-400">
                          {u.joinedDate}
                        </td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : u.status === 'Pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Activity Timeline (1 col) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#187e8d]" />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Live System Activity
                  </h3>
                </div>
                <Link
                  to="/admin/audit-logs"
                  className="text-xs font-bold text-[#187e8d] hover:underline"
                >
                  Full audit
                </Link>
              </div>

              <div className="mt-4 space-y-4">
                {adminAuditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="relative pl-5 border-l-2 border-slate-200 text-xs">
                    <span
                      className={`absolute -left-[5px] top-1 size-2 rounded-full ${
                        log.status === 'Success'
                          ? 'bg-emerald-500'
                          : log.status === 'Warning'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp.split(',')[1]}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 line-clamp-2">{log.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      By <strong>{log.user}</strong> ({log.role})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
