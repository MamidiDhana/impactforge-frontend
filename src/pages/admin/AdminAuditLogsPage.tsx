import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { EmptyState } from '../../components/common/EmptyState'
import { adminAuditLogs as initialAuditLogs } from '../../data/adminMockData'
import type { AdminAuditLog } from '../../types/admin'

const MODULE_FILTERS = [
  'All',
  'Users',
  'Roles',
  'Organizations',
  'Taxonomy',
  'AI Engine',
  'Security',
  'Platform',
]

const ACTION_FILTERS = [
  'All',
  'CONFIG_UPDATE',
  'UPDATE_STATUS',
  'EDIT_ROLE',
  'MODEL_RETRAIN',
  'USER_DEACTIVATE',
  'TAXONOMY_SUGGEST',
  'TAXONOMY_ADD',
  'LOGIN',
  'AUTH_FAILED',
  'VERIFY_REJECT',
]

export function AdminAuditLogsPage() {
  const [logs] = useState<AdminAuditLog[]>(initialAuditLogs)
  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState('All')
  const [selectedAction, setSelectedAction] = useState('All')
  const [selectedDate, setSelectedDate] = useState('All')
  const [selectedUser, setSelectedUser] = useState('All')

  // Log details modal
  const [viewLog, setViewLog] = useState<AdminAuditLog | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Unique users from logs
  const userList = useMemo(() => {
    return ['All', ...Array.from(new Set(logs.map((l) => l.user)))]
  }, [logs])

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        search === '' ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.ipAddress.includes(search)

      const matchesModule = selectedModule === 'All' || log.module === selectedModule
      const matchesAction = selectedAction === 'All' || log.action === selectedAction
      const matchesUser = selectedUser === 'All' || log.user === selectedUser

      const matchesDate =
        selectedDate === 'All' ||
        (selectedDate === 'Today' && log.timestamp.includes('06 Sep 2026')) ||
        (selectedDate === 'Yesterday' && log.timestamp.includes('05 Sep 2026'))

      return matchesSearch && matchesModule && matchesAction && matchesUser && matchesDate
    })
  }, [logs, search, selectedModule, selectedAction, selectedUser, selectedDate])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  const handleExportLogs = () => {
    setFeedback('Platform Security & Compliance Audit Log (CSV) compiled and downloaded in mock session!')
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedModule('All')
    setSelectedAction('All')
    setSelectedDate('All')
    setSelectedUser('All')
    setCurrentPage(1)
  }

  return (
    <AdminLayout title="Audit Logs">
      <AdminPage
        title="Audit Logs"
        description="Review system activity, authentication events, and administrative changes."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Audit Logs' },
        ]}
        action={
          <button
            type="button"
            onClick={handleExportLogs}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Download size={14} />
            Export Audit Logs
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

          {/* Search & Filters */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs by action, user name, IP address, or keyword..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              {(search || selectedModule !== 'All' || selectedAction !== 'All' || selectedUser !== 'All' || selectedDate !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                >
                  <RotateCcw size={12} />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-slate-100 text-xs">
              {/* Module Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Module</label>
                <select
                  value={selectedModule}
                  onChange={(e) => {
                    setSelectedModule(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {MODULE_FILTERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Action Type</label>
                <select
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {ACTION_FILTERS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">User / Initiator</label>
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none truncate"
                >
                  {userList.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Date Range</label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today (06 Sep)</option>
                  <option value="Yesterday">Yesterday (05 Sep)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          {filteredLogs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No audit entries matched"
              description="No security or system records match the applied query."
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">User & Role</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Module</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          {log.timestamp}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-bold text-slate-800">{log.user}</p>
                          <p className="text-[10px] text-slate-400">{log.role}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-[#187e8d]">
                            {log.module}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs truncate text-slate-700">
                          {log.description}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              log.status === 'Success'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'Warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewLog(log)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            title="View log details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination UI */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)} to{' '}
                  {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} audit logs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="font-bold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Log Details Modal */}
        {viewLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setViewLog(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Audit Record: {viewLog.action}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {viewLog.id} · {viewLog.timestamp}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-xs text-slate-600">
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-medium">Actor / User</span>
                    <p className="font-bold text-slate-800 mt-0.5">{viewLog.user}</p>
                    <p className="text-[11px] text-slate-500">{viewLog.role}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Platform Module</span>
                    <p className="font-bold text-[#187e8d] mt-0.5">{viewLog.module}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Execution Status</span>
                    <p className="font-bold text-emerald-700 mt-0.5">{viewLog.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Source IP Address</span>
                    <p className="font-mono text-slate-700 mt-0.5">{viewLog.ipAddress}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 bg-white">
                  <p className="font-bold text-slate-700 mb-1">Action Description:</p>
                  <p className="text-slate-800 leading-relaxed font-mono text-[11px]">
                    {viewLog.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setViewLog(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
