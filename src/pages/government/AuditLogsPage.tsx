import { useState } from 'react'
import { Search } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { SearchInput } from '../../components/forms/SearchInput'
import { EmptyState } from '../../components/common/EmptyState'
import { auditLogs } from '../../data/auditLogs'
export function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const results = auditLogs.filter((item) =>
    `${item.user} ${item.action} ${item.entity}`.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <GovernmentLayout title="Audit Logs">
      <GovPage
        title="Audit Logs"
        description="Review the mock history of governance and matching actions."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Audit Logs' },
        ]}
      >
        <div className="max-w-md">
          <SearchInput value={search} onChange={setSearch} placeholder="Search audit events" />
        </div>
        {results.length ? (
          <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="p-4">Date and time</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Status change</th>
                  <th className="p-4">Comment</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-4 text-slate-500">{item.dateTime}</td>
                    <td className="p-4 font-semibold text-slate-700">{item.user}</td>
                    <td className="p-4 text-slate-600">{item.action}</td>
                    <td className="p-4 text-slate-500">{item.entity}</td>
                    <td className="p-4 text-slate-500">
                      {item.previousStatus} → {item.newStatus}
                    </td>
                    <td className="p-4 text-slate-500">{item.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState icon={Search} title="No audit events found" description="Try a different search term." />
          </div>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}