import { useMemo, useState } from 'react'
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FileCheck,
  Handshake,
  Inbox,
  MessageSquare,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { EmptyState } from '../../components/common/EmptyState'
import {
  partnerNotifications as initialNotifications,
  type ExtendedPartnerNotification,
} from '../../data/partnerNotifications'

export function PartnerNotificationsPage() {
  const [notifications, setNotifications] = useState<ExtendedPartnerNotification[]>(initialNotifications)
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [feedback, setFeedback] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesRead = filterType === 'all' || !n.read
      const matchesCat = categoryFilter === 'All' || n.category === categoryFilter
      return matchesRead && matchesCat
    })
  }, [notifications, filterType, categoryFilter])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setFeedback('All notifications marked as read.')
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setFeedback('Notification removed.')
    setTimeout(() => setFeedback(null), 3000)
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'request':
        return Handshake
      case 'status':
        return CheckCircle2
      case 'milestone':
        return FileCheck
      case 'message':
        return MessageSquare
      case 'impact':
        return Sparkles
      default:
        return Bell
    }
  }

  return (
    <PartnerLayout title="Alerts">
      <PartnerPage
        title="Alerts"
        description="Stay updated with incoming collaboration requests and project updates."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Alerts' },
        ]}
        action={
          unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CheckCheck size={15} />
              Mark all as read ({unreadCount})
            </button>
          )
        }
      >
        <div className="space-y-6 max-w-4xl">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  filterType === 'all'
                    ? 'bg-[#12365a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('unread')}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  filterType === 'unread'
                    ? 'bg-[#12365a] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500">Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="request">Requests & Proposals</option>
                <option value="status">Status Changes</option>
                <option value="milestone">Project Milestones</option>
                <option value="message">Messages</option>
                <option value="impact">Impact Reminders</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          {filtered.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {filtered.map((item) => {
                const Icon = getCategoryIcon(item.category)
                return (
                  <article
                    key={item.id}
                    className={`flex items-start gap-4 p-5 transition-colors ${
                      item.read ? 'bg-white hover:bg-slate-50/70' : 'bg-[#e8f5f5]/30 hover:bg-[#e8f5f5]/50'
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl border ${
                        item.read
                          ? 'border-slate-200 bg-slate-100 text-slate-500'
                          : 'border-teal-200 bg-[#e8f5f5] text-[#187e8d]'
                      }`}
                    >
                      <Icon size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <h3 className={`text-sm ${item.read ? 'font-medium text-slate-800' : 'font-bold text-[#13243b]'}`}>
                          {item.title}
                        </h3>
                        <span className="text-[11px] text-slate-400 shrink-0">{item.createdAt}</span>
                      </div>

                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {item.actionUrl && (
                          <Link
                            to={item.actionUrl}
                            className="text-xs font-bold text-[#187e8d] hover:underline"
                          >
                            View Details →
                          </Link>
                        )}

                        {!item.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(item.id)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                          >
                            Mark as read
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 ml-auto"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No notifications found"
              action={
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all')
                    setCategoryFilter('All')
                  }}
                  className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Reset Filters
                </button>
              }
            />
          )}
        </div>
      </PartnerPage>
    </PartnerLayout>
  )
}