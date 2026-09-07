import { useState } from 'react'
import { Bell, CheckCheck, CheckCircle2, Inbox, Trash2 } from 'lucide-react'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from './WorkspaceShared'
import { EmptyState } from '../../components/common/EmptyState'
import type { Notification } from '../../types'

export function WorkspaceNotificationsPage({
  role = 'faculty',
  initialItems,
}: {
  role?: 'faculty'
  initialItems: Notification[]
}) {
  const [items, setItems] = useState<Notification[]>(initialItems)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'request' | 'project' | 'status'>('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2000)
  }

  const handleMarkAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, read: true })))
    showToast('All notifications marked as read.')
  }

  const handleMarkRead = (id: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  const handleDelete = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
    showToast('Notification removed.')
  }

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'unread') return !item.read
    if (activeFilter !== 'all') return item.type === activeFilter
    return true
  })

  const unreadCount = items.filter((item) => !item.read).length

  return (
    <FacultyStudentLayout role={role} title="Alerts">
      {toastMessage && (
        <div
          role="status"
          className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl bg-[#12365a] px-4 py-3 text-sm font-semibold text-white shadow-xl animate-fade-in"
        >
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <WorkspacePage
        role={role}
        title="Alerts"
        description="Stay current on milestone deadlines, team assignments, capability requests, and student submissions."
        breadcrumbs={[{ label: 'Faculty', href: `/${role}/dashboard` }, { label: 'Alerts' }]}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <CheckCheck size={16} className="text-[#187e8d]" />
              Mark all as read ({unreadCount})
            </button>
          ) : undefined
        }
      >
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeFilter === 'all'
                ? 'bg-[#12365a] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeFilter === 'unread'
                ? 'bg-[#12365a] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('request')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeFilter === 'request'
                ? 'bg-[#12365a] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Requests
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('project')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeFilter === 'project'
                ? 'bg-[#12365a] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Projects
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('status')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeFilter === 'status'
                ? 'bg-[#12365a] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Status
          </button>
        </div>

        {/* Notifications List */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No notifications found"
            description={
              activeFilter === 'unread'
                ? "You're all caught up! No unread notifications remain."
                : 'No notifications in this category yet.'
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className={`flex items-start gap-4 border-b border-slate-100 p-5 transition last:border-0 hover:bg-slate-50/70 ${
                  !item.read ? 'bg-sky-50/30' : ''
                }`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-full ${
                    !item.read
                      ? 'bg-[#d9eeee] text-[#12365a]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell size={18} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-sm font-semibold ${
                          !item.read ? 'text-[#12365a] font-bold' : 'text-slate-800'
                        }`}
                      >
                        {item.title}
                      </h2>
                      {!item.read && (
                        <span className="size-2 rounded-full bg-[#187e8d]" title="Unread" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{item.createdAt}</span>
                  </div>

                  {item.description && (
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        className="text-xs font-bold text-[#187e8d] hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition"
                      aria-label="Delete notification"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}