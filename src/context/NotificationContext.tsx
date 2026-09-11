import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { useAdmin, type AdminAnnouncement } from './AdminContext'
import {
  type Notification,
  type NotificationPreferencesData,
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATIONS_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
  DISMISSED_ANNOUNCEMENTS_KEY,
  filterNotificationsByRole,
  filterAnnouncementsByRole,
  loadFromLocalStorage,
  saveToLocalStorage,
} from '../utils/notificationUtils'

export interface CreateNotificationInput {
  type: Notification['type']
  title: string
  message: string
  targetRole: Notification['targetRole']
  relatedTrackId?: string
  priority?: Notification['priority']
  source?: Notification['source']
  actionUrl?: string
}

interface NotificationContextValue {
  notifications: Notification[]
  userNotifications: Notification[]
  userAnnouncements: AdminAnnouncement[]
  unreadCount: number
  preferences: NotificationPreferencesData
  notify: (input: CreateNotificationInput) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
  dismissAnnouncement: (id: string) => void
  updatePreferences: (partial: Partial<NotificationPreferencesData>) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

// Initial default seed notifications reflecting real project reports
const INITIAL_SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-seed-001',
    type: 'report_submitted',
    title: 'New Citizen Problem Logged',
    message: 'Water pipeline leak in Doranda, Ranchi registered in state registry.',
    targetRole: ['government', 'admin'],
    relatedTrackId: 'IF-JH-2026-0004',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    dismissed: false,
    priority: 'Normal',
    source: 'Citizen Portal',
    actionUrl: '/citizen/problems/IF-JH-2026-0004',
  },
  {
    id: 'notif-seed-002',
    type: 'status_changed',
    title: 'Report Moved to In Progress',
    message: 'Track ID IF-JH-2026-0001 status changed to "In Progress" with municipal team assigned.',
    targetRole: ['citizen', 'government', 'hei', 'faculty', 'partner', 'admin'],
    relatedTrackId: 'IF-JH-2026-0001',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    dismissed: false,
    priority: 'Important',
    source: 'Government Validator',
    actionUrl: '/citizen/problems/IF-JH-2026-0001',
  },
  {
    id: 'notif-seed-003',
    type: 'assignment_updated',
    title: 'University Challenge Recommendation',
    message: 'Rural drinking water filtration challenge recommended for student pilot development.',
    targetRole: ['hei', 'faculty'],
    relatedTrackId: 'IF-JH-2026-0002',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    read: false,
    dismissed: false,
    priority: 'Normal',
    source: 'HEI Coordination',
    actionUrl: '/hei/dashboard',
  },
  {
    id: 'notif-seed-004',
    type: 'project_updated',
    title: 'CSR Support Opportunity',
    message: 'High urgency community challenge available for technical and resource sponsorship.',
    targetRole: ['partner'],
    relatedTrackId: 'IF-JH-2026-0003',
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    read: false,
    dismissed: false,
    priority: 'Important',
    source: 'Partner Network',
    actionUrl: '/partner/dashboard',
  },
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const { announcements } = useAdmin()

  // Centralized notifications state
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const loaded = loadFromLocalStorage<Notification[]>(NOTIFICATIONS_STORAGE_KEY, [])
    if (loaded.length === 0) {
      saveToLocalStorage(NOTIFICATIONS_STORAGE_KEY, INITIAL_SEED_NOTIFICATIONS)
      return INITIAL_SEED_NOTIFICATIONS
    }
    return loaded
  })

  // Notification preferences
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(() =>
    loadFromLocalStorage<NotificationPreferencesData>(PREFERENCES_STORAGE_KEY, DEFAULT_NOTIFICATION_PREFERENCES)
  )

  // Dismissed announcement IDs
  const [dismissedAnnouncementIds, setDismissedAnnouncementIds] = useState<string[]>(() =>
    loadFromLocalStorage<string[]>(DISMISSED_ANNOUNCEMENTS_KEY, [])
  )

  // Persist notifications on update
  useEffect(() => {
    saveToLocalStorage(NOTIFICATIONS_STORAGE_KEY, notifications)
  }, [notifications])

  // Persist preferences on update
  useEffect(() => {
    saveToLocalStorage(PREFERENCES_STORAGE_KEY, preferences)
  }, [preferences])

  // Persist dismissed announcements on update
  useEffect(() => {
    saveToLocalStorage(DISMISSED_ANNOUNCEMENTS_KEY, dismissedAnnouncementIds)
  }, [dismissedAnnouncementIds])

  // Create a new notification with duplicate prevention
  const notify = useCallback((input: CreateNotificationInput) => {
    setNotifications((prev) => {
      // Check for duplicate recent notification for the same event & trackId
      if (input.relatedTrackId) {
        const isDuplicate = prev.some(
          (n) =>
            n.relatedTrackId === input.relatedTrackId &&
            n.type === input.type &&
            n.title === input.title
        )
        if (isDuplicate) return prev
      }

      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: input.type,
        title: input.title,
        message: input.message,
        targetRole: input.targetRole,
        relatedTrackId: input.relatedTrackId,
        createdAt: new Date().toISOString(),
        read: false,
        dismissed: false,
        priority: input.priority || 'Normal',
        source: input.source || 'System',
        actionUrl: input.actionUrl,
      }

      return [newNotification, ...prev]
    })
  }, [])

  // Mark single notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  // Mark all visible notifications for user as read
  const markAllAsRead = useCallback(() => {
    const userRole = currentUser?.role
    setNotifications((prev) => {
      const visible = filterNotificationsByRole(prev, userRole, preferences)
      const visibleIds = new Set(visible.map((v) => v.id))
      return prev.map((n) => (visibleIds.has(n.id) ? { ...n, read: true } : n))
    })
  }, [currentUser?.role, preferences])

  // Dismiss single notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    )
  }, [])

  // Dismiss an announcement
  const dismissAnnouncement = useCallback((id: string) => {
    setDismissedAnnouncementIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  // Update notification preferences
  const updatePreferences = useCallback((partial: Partial<NotificationPreferencesData>) => {
    setPreferences((prev) => ({ ...prev, ...partial }))
  }, [])

  // Clear all visible notifications
  const clearAll = useCallback(() => {
    const userRole = currentUser?.role
    setNotifications((prev) => {
      const visible = filterNotificationsByRole(prev, userRole, preferences)
      const visibleIds = new Set(visible.map((v) => v.id))
      return prev.map((n) => (visibleIds.has(n.id) ? { ...n, dismissed: true } : n))
    })
  }, [currentUser?.role, preferences])

  // Role-filtered notifications
  const userNotifications = useMemo(
    () => filterNotificationsByRole(notifications, currentUser?.role, preferences),
    [notifications, currentUser?.role, preferences]
  )

  // Role-filtered announcements (reusing AdminContext announcements and localStorage key)
  const userAnnouncements = useMemo(
    () =>
      filterAnnouncementsByRole(
        announcements,
        currentUser?.role,
        dismissedAnnouncementIds,
        preferences
      ),
    [announcements, currentUser?.role, dismissedAnnouncementIds, preferences]
  )

  // Live unread badge count
  const unreadCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications]
  )

  const value = useMemo(
    () => ({
      notifications,
      userNotifications,
      userAnnouncements,
      unreadCount,
      preferences,
      notify,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      dismissAnnouncement,
      updatePreferences,
      clearAll,
    }),
    [
      notifications,
      userNotifications,
      userAnnouncements,
      unreadCount,
      preferences,
      notify,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      dismissAnnouncement,
      updatePreferences,
      clearAll,
    ]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
