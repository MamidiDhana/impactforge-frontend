import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { getReports, type BackendReportResponse } from '../../services/reportService'

export function AdminProblemsPage() {
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getReports()
      setReports(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch platform problems.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        search === '' ||
        r.problem_title.toLowerCase().includes(search.toLowerCase()) ||
        r.track_id.toLowerCase().includes(search.toLowerCase()) ||
        r.district.toLowerCase().includes(search.toLowerCase()) ||
        r.locality.toLowerCase().includes(search.toLowerCase())

      const matchesCat = categoryFilter === 'All' || r.category === categoryFilter || r.ai_category === categoryFilter
      const matchesPrio = priorityFilter === 'All' || r.priority === priorityFilter || r.ai_priority === priorityFilter
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter

      return matchesSearch && matchesCat && matchesPrio && matchesStatus
    })
  }, [reports, search, categoryFilter, priorityFilter, statusFilter])

  return (
    <AdminLayout title="Platform Problems Oversight">
      <AdminPage
        title="Platform Problems & Civic Challenges"
        description="Global oversight of reported civic grievances, municipal validations, and university innovation challenges."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Problems' },
        ]}
        action={
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-[#187e8d]' : 'text-slate-500'} />
            <span>Refresh Problems</span>
          </button>
        }
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, track ID, district..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs outline-none focus:border-[#187e8d] focus:bg-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Water and Sanitation">Water and Sanitation</option>
            <option value="Roads and Transport">Roads and Transport</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Public Safety">Public Safety</option>
            <option value="Environment">Environment</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Validated">Validated</option>
            <option value="Assigned">Assigned to HEI</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Problems Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          {loading && reports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="size-8 rounded-full border-3 border-slate-200 border-t-[#187e8d] animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading civic challenges...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-800">No problems found</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3.5">Track ID / Title</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Priority</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">AI Inference</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReports.map((r) => (
                    <tr key={r.track_id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 max-w-[240px]">
                        <span className="font-mono text-[10px] font-bold text-[#187e8d]">{r.track_id}</span>
                        <p className="font-bold text-slate-900 truncate mt-0.5">{r.problem_title}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{r.locality}, {r.district}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                          {r.ai_category || r.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                          r.priority === 'High' || r.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : r.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="capitalize font-bold text-xs text-slate-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.ai_analysis_status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Sparkles size={11} />
                            <span>Classified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock size={11} />
                            <span>{r.ai_analysis_status || 'Pending'}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Link
                          to={`/problems/${r.track_id}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#187e8d] hover:bg-teal-50 transition"
                        >
                          <span>Inspect</span>
                          <ExternalLink size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
