import { useState, useMemo } from 'react'
import { Search, Info, Trash2, X, Clock } from 'lucide-react'
import { Modal } from '../common/Modal'
import { useAdmin } from '../../context/AdminContext'

export function AdminAuditLog() {
  const { auditLogs, clearAuditLog } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      return (
        log.action.toLowerCase().includes(q) ||
        log.targetItem.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q)
      )
    })
  }, [auditLogs, searchQuery])

  const getActionBadge = (action: string) => {
    if (action.includes('Delete')) {
      return 'bg-red-50 text-red-700 ring-red-200'
    }
    if (action.includes('Create') || action.includes('Add')) {
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    }
    if (action.includes('Update') || action.includes('Status')) {
      return 'bg-blue-50 text-blue-700 ring-blue-200'
    }
    return 'bg-slate-100 text-slate-700 ring-slate-200'
  }

  return (
    <div className="space-y-4">
      {/* MVP Notice as required by Requirement 8 */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
        <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-[11px] leading-relaxed text-amber-900">
          These audit logs are stored locally for this MVP and are not a secure server-side audit trail. They track administrative actions performed in your current browser session.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by action, target, or details..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 sm:text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            <strong>{filteredLogs.length}</strong> events logged
          </span>
          {auditLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
            >
              <Trash2 size={13} />
              <span>Clear Trail</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-4 pr-3 whitespace-nowrap">Timestamp</th>
                <th className="px-3 py-3.5">Admin Action</th>
                <th className="px-3 py-3.5">Target Item</th>
                <th className="px-3 py-3.5">Description</th>
                <th className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No audit records matching search query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-50/70">
                    <td className="py-3 pl-4 pr-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap font-mono font-bold text-slate-800">
                      {log.targetItem}
                    </td>
                    <td className="px-3 py-3 text-slate-600 max-w-[320px]">
                      {log.description}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {log.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Clear Modal */}
      <Modal
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear Audit Trail"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to clear all local audit trail logs? This action will reset your audit log history in browser storage.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearAuditLog()
                setConfirmClearOpen(false)
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
