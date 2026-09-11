import { useState, useEffect } from 'react'
import {
  X,
  Bell,
  CheckCheck,
  Megaphone,
  Sliders,
  Inbox,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { NotificationItem } from './NotificationItem'
import { NotificationPreferences } from './NotificationPreferences'
import { formatRelativeTime } from '../../utils/notificationUtils'

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

type TabType = 'alerts' | 'announcements' | 'preferences'

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const {
    userNotifications,
    userAnnouncements,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAnnouncement,
    clearAll,
  } = useNotifications()

  const [activeTab, setActiveTab] = useState<TabType>('alerts')
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const displayedNotifications = filterUnreadOnly
    ? userNotifications.filter((n) => !n.read)
    : userNotifications

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-xl bg-[#12365a] text-white shadow-xs">
              <Bell size={16} />
            </span>
            <div>
              <h2
                id="notification-center-title"
                className="font-[Manrope] text-base font-bold text-[#13243b]"
              >
                Notifications & Alerts
              </h2>
              <p className="text-[11px] text-slate-400">
                {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications panel"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition ${
              activeTab === 'alerts'
                ? 'border-[#187e8d] text-[#12365a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell size={14} />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#187e8d] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition ${
              activeTab === 'announcements'
                ? 'border-[#187e8d] text-[#12365a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Megaphone size={14} />
            <span>Announcements</span>
            {userAnnouncements.length > 0 && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                {userAnnouncements.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-bold transition ${
              activeTab === 'preferences'
                ? 'border-[#187e8d] text-[#12365a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders size={14} />
            <span>Preferences</span>
          </button>
        </div>

        {/* Sub-Header Actions for Alerts */}
        {activeTab === 'alerts' && userNotifications.length > 0 && (
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-2 text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnreadOnly}
                onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                className="size-3.5 rounded border-slate-300 accent-[#187e8d]"
              />
              <span className="text-[11px] font-medium">Unread only</span>
            </label>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#187e8d] hover:text-[#12365a] transition"
              >
                <CheckCheck size={13} />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* TAB 1: ALERTS */}
          {activeTab === 'alerts' && (
            <>
              {displayedNotifications.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Inbox size={22} />
                  </div>
                  <h3 className="font-[Manrope] text-sm font-bold text-slate-700">
                    {filterUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {filterUnreadOnly
                      ? 'You are all caught up! Uncheck unread-only to view past alerts.'
                      : 'Activity notifications regarding citizen problems, status updates, and team actions will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayedNotifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkAsRead={markAsRead}
                      onDismiss={dismissNotification}
                      onCloseParent={onClose}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <>
              {userAnnouncements.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                    <Megaphone size={22} />
                  </div>
                  <h3 className="font-[Manrope] text-sm font-bold text-slate-700">
                    No active announcements
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Platform notices broadcast by the Super Admin will appear here when issued.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAnnouncements.map((ann) => (
                    <div
                      key={ann.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          {ann.priority}
                        </span>
                        <button
                          type="button"
                          onClick={() => dismissAnnouncement(ann.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                        >
                          Dismiss
                        </button>
                      </div>
                      <h4 className="font-[Manrope] text-sm font-bold text-[#13243b]">
                        {ann.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ann.message}
                      </p>
                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-slate-100">
                        <span>Audience: {ann.audience}</span>
                        <span>{formatRelativeTime(ann.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === 'preferences' && <NotificationPreferences />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <AlertCircle size={13} className="text-slate-400" />
            <span>Browser-local stream</span>
          </div>

          {activeTab === 'alerts' && userNotifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition"
            >
              <Trash2 size={12} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
