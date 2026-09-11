import { Megaphone, X, AlertTriangle, Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { formatRelativeTime } from '../../utils/notificationUtils'

interface AnnouncementBannerProps {
  className?: string
}

export function AnnouncementBanner({ className = '' }: AnnouncementBannerProps) {
  const { userAnnouncements, dismissAnnouncement } = useNotifications()

  if (userAnnouncements.length === 0) return null

  // Display top active announcement
  const announcement = userAnnouncements[0]

  const getTheme = () => {
    switch (announcement.priority) {
      case 'Urgent':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertTriangle size={17} className="text-rose-600 shrink-0" />,
        }
      case 'Important':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Megaphone size={17} className="text-amber-600 shrink-0" />,
        }
      default:
        return {
          bg: 'bg-[#e8f5f5] border-teal-200 text-[#12365a]',
          badge: 'bg-teal-100 text-teal-900 border-teal-200',
          icon: <Bell size={17} className="text-[#187e8d] shrink-0" />,
        }
    }
  }

  const theme = getTheme()

  return (
    <div
      role="region"
      aria-label="Platform Announcement"
      className={`relative flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-xs animate-in fade-in slide-in-from-top-2 ${theme.bg} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5">{theme.icon}</div>
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}
            >
              {announcement.priority} Announcement
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Target: {announcement.audience} &middot; {formatRelativeTime(announcement.createdAt)}
            </span>
          </div>

          <h3 className="font-[Manrope] text-sm font-bold tracking-tight">
            {announcement.title}
          </h3>

          <p className="text-xs leading-relaxed opacity-90 whitespace-normal">
            {announcement.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => dismissAnnouncement(announcement.id)}
        aria-label="Dismiss announcement banner"
        title="Dismiss announcement"
        className="rounded-lg p-1.5 text-slate-400 hover:bg-black/5 hover:text-slate-700 transition shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  )
}
