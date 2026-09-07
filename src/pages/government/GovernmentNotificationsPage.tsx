import { useState } from 'react'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { EmptyState } from '../../components/common/EmptyState'
import { governmentNotifications } from '../../data/governmentNotifications'
export function GovernmentNotificationsPage() {
  const [items, setItems] = useState(governmentNotifications)
  return (
    <GovernmentLayout title="Alerts">
      <GovPage
        title="Alerts"
        description="Stay informed about validation queues, duplicates, and project risks."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Alerts' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        }
      >
        {items.length ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            {items.map((item) => (
              <article
                key={item.id}
                className={`flex gap-4 border-b border-slate-100 p-5 last:border-0 ${item.read ? '' : 'bg-[#f7fbfb]'}`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d9eeee] text-[#187e8d]">
                  <Bell size={18} />
                </span>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <h2 className="font-semibold text-[#13243b]">{item.title}</h2>
                    <span className="text-xs text-slate-400">{item.createdAt}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() =>
                        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)))
                      }
                      className="mt-3 text-xs font-bold text-[#187e8d]"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Inbox} title="No alerts" description="No new alerts at this time." />
        )}
      </GovPage>
    </GovernmentLayout>
  )
}