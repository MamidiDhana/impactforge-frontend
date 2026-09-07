import { useState } from 'react'
import { Bell, CheckCheck, Compass, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { citizenNotifications } from '../../data/citizenNotifications'

export function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(citizenNotifications)
  const markRead = (id: string) =>
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item))
    )

  return (
    <CitizenLayout title="Alerts">
      <PageContainer>
        <PageHeader
          title="Alerts"
          description="Stay up to date with validation, project, and collaboration activity."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Alerts' },
          ]}
          action={
            <button
              type="button"
              onClick={() => setNotifications((items) => items.map((item) => ({ ...item, read: true })))}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>
          }
        />
        {notifications.length ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`flex flex-col sm:flex-row gap-4 border-b border-slate-100 p-5 last:border-0 ${
                  notification.read ? '' : 'bg-[#f7fbfb]'
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${
                    notification.read ? 'bg-slate-100 text-slate-500' : 'bg-[#d9eeee] text-[#187e8d]'
                  }`}
                >
                  <Bell size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-[#13243b]">
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block size-2 rounded-full bg-[#1c91a1]" />
                        )}
                      </h2>
                      {notification.status === 'Resolved' && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          Resolved
                        </span>
                      )}
                      {notification.trackId && (
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                          {notification.trackId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{notification.createdAt}</span>
                  </div>
                  {notification.description && (
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-xs capitalize text-slate-400">{notification.type ?? 'system'}</p>
                    {notification.actionUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          markRead(notification.id)
                          navigate(notification.actionUrl!)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#12365a] px-3 py-1 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                      >
                        <Compass size={12} />
                        Track Problem
                      </button>
                    )}
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        className="text-xs font-bold text-[#187e8d] hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No alerts"
            description="New updates about your problems and projects will appear here."
          />
        )}
      </PageContainer>
    </CitizenLayout>
  )
}
