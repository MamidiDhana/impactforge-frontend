import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  Compass,
  FileCheck2,
  FolderKanban,
  Megaphone,
  Trash2,
  UserCheck,
} from 'lucide-react'
import type { Notification } from '../../utils/notificationUtils'
import { formatRelativeTime } from '../../utils/notificationUtils'

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDismiss: (id: string) => void
  onCloseParent?: () => void
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onCloseParent,
}: NotificationItemProps) {
  const navigate = useNavigate()

  const getIcon = () => {
    switch (notification.type) {
      case 'report_submitted':
        return <FileCheck2 size={16} className="text-emerald-600" />
      case 'status_changed':
        return <Compass size={16} className="text-[#187e8d]" />
      case 'assignment_updated':
        return <UserCheck size={16} className="text-indigo-600" />
      case 'project_updated':
        return <FolderKanban size={16} className="text-sky-600" />
      case 'announcement':
        return <Megaphone size={16} className="text-amber-600" />
      default:
        return <Bell size={16} className="text-slate-600" />
    }
  }

  const getPriorityBadge = () => {
    switch (notification.priority) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 ring-rose-200'
      case 'Urgent':
        return 'bg-red-50 text-red-700 ring-red-200'
      case 'Important':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200'
    }
  }

  const handleActionClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (onCloseParent) {
      onCloseParent()
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    } else if (notification.relatedTrackId) {
      navigate(`/citizen/problems/${notification.relatedTrackId}`)
    }
  }

  return (
    <div
      className={`group relative flex items-start gap-3 rounded-xl border p-3.5 transition ${
        notification.read
          ? 'border-slate-200 bg-white hover:border-slate-300'
          : 'border-teal-100 bg-[#f7fbfb] hover:border-teal-200 shadow-xs'
      }`}
    >
      {/* Icon */}
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-100 shadow-2xs mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4
              className={`text-xs leading-snug font-bold ${
                notification.read ? 'text-slate-700' : 'text-[#13243b]'
              }`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <span
                className="size-2 rounded-full bg-[#187e8d]"
                title="Unread notification"
              />
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {notification.message}
        </p>

        {/* Metadata Badges & Quick Action */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className={`rounded-md px-1.5 py-0.5 font-semibold ring-1 ring-inset ${getPriorityBadge()}`}
            >
              {notification.priority}
            </span>

            {notification.relatedTrackId && (
              <button
                type="button"
                onClick={handleActionClick}
                className="font-mono font-bold text-[#187e8d] hover:underline"
                title="Track this problem"
              >
                {notification.relatedTrackId}
              </button>
            )}

            <span className="text-slate-400">&bull; {notification.source}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                aria-label="Mark as read"
                title="Mark as read"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                <Check size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              aria-label="Dismiss notification"
              title="Dismiss"
              className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
