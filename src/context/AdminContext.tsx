import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const USERS_STORAGE_KEY = 'impactforge.admin.users.v1'
const CATEGORIES_STORAGE_KEY = 'impactforge.admin.categories.v1'
const ANNOUNCEMENTS_STORAGE_KEY = 'impactforge.admin.announcements.v1'
const AUDIT_STORAGE_KEY = 'impactforge.admin.audit.v1'
const SETTINGS_STORAGE_KEY = 'impactforge.admin.settings.v1'

export type AdminUserRole =
  | 'Citizen'
  | 'Government Official'
  | 'HEI'
  | 'Faculty'
  | 'Partner'
  | 'Super Admin'

export type AdminUserStatus = 'Active' | 'Suspended' | 'Pending'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminUserRole
  organization: string
  status: AdminUserStatus
  createdAt: string
}

export interface AdminCategory {
  id: string
  name: string
  enabled: boolean
  description?: string
}

export type AnnouncementAudience =
  | 'All Users'
  | 'Citizens'
  | 'Government'
  | 'HEI'
  | 'Faculty'
  | 'Partners'

export type AnnouncementPriority = 'Normal' | 'Important' | 'Urgent'

export interface AdminAnnouncement {
  id: string
  title: string
  message: string
  audience: AnnouncementAudience
  priority: AnnouncementPriority
  active: boolean
  createdAt: string
}

export interface AdminAuditEntry {
  id: string
  timestamp: string
  action: string
  targetItem: string
  description: string
  performedBy: string
}

export interface AdminPortalSettings {
  platformName: string
  platformDescription: string
  maintenanceMode: boolean
  allowNewCitizenSubmissions: boolean
  showAnnouncements: boolean
  defaultReportStatus: 'Open' | 'Pending' | 'Under Review'
}

interface AdminContextValue {
  users: AdminUser[]
  categories: AdminCategory[]
  announcements: AdminAnnouncement[]
  auditLogs: AdminAuditEntry[]
  settings: AdminPortalSettings
  addUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => void
  updateUser: (id: string, updates: Partial<AdminUser>) => void
  deleteUser: (id: string) => void
  addCategory: (name: string, description?: string) => void
  renameCategory: (id: string, name: string) => void
  toggleCategory: (id: string) => void
  deleteCategory: (id: string) => void
  addAnnouncement: (announcement: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => void
  updateAnnouncement: (id: string, updates: Partial<AdminAnnouncement>) => void
  toggleAnnouncement: (id: string) => void
  deleteAnnouncement: (id: string) => void
  updateSettings: (settings: Partial<AdminPortalSettings>) => void
  addAuditEntry: (entry: { action: string; targetItem: string; description: string }) => void
  clearAuditLog: () => void
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-001',
    name: 'Asha Rao',
    email: 'asha.rao@jharkhand.in',
    role: 'Citizen',
    organization: 'Ranchi Urban Community',
    status: 'Active',
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'usr-002',
    name: 'Vikram Singh',
    email: 'vikram.singh@jharkhand.gov.in',
    role: 'Government Official',
    organization: 'District Innovation Cell Ranchi',
    status: 'Active',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'usr-003',
    name: 'Dr. Meera Nair',
    email: 'dean.rnd@bitmesra.ac.in',
    role: 'HEI',
    organization: 'Birla Institute of Technology (BIT) Mesra',
    status: 'Active',
    createdAt: '2026-02-01T14:15:00Z',
  },
  {
    id: 'usr-004',
    name: 'Dr. Arjun Menon',
    email: 'prof.menon@tiss.edu',
    role: 'Faculty',
    organization: 'Tata Institute of Social Sciences',
    status: 'Active',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'usr-005',
    name: 'Karan Patel',
    email: 'partner@impactforge.org',
    role: 'Partner',
    organization: 'Tata Steel CSR Foundation',
    status: 'Active',
    createdAt: '2026-02-18T16:45:00Z',
  },
  {
    id: 'usr-006',
    name: 'Super Admin',
    email: 'admin@impactforge.org',
    role: 'Super Admin',
    organization: 'ImpactForge State Cell',
    status: 'Active',
    createdAt: '2026-01-01T08:00:00Z',
  },
]

const DEFAULT_CATEGORIES: AdminCategory[] = [
  { id: 'cat-1', name: 'Water and Sanitation', enabled: true, description: 'Drinking water access, tube well repairs, wastewater management' },
  { id: 'cat-2', name: 'Waste Management', enabled: true, description: 'Solid waste disposal, segregation, composting, industrial runoff' },
  { id: 'cat-3', name: 'Healthcare', enabled: true, description: 'Primary health centres, emergency care, medicine supply' },
  { id: 'cat-4', name: 'Education', enabled: true, description: 'School infrastructure, digital learning, teacher allocation' },
  { id: 'cat-5', name: 'Agriculture', enabled: true, description: 'Irrigation channels, drought mitigation, soil health, crop storage' },
  { id: 'cat-6', name: 'Environment', enabled: true, description: 'Forest conservation, mining dust reduction, afforestation' },
  { id: 'cat-7', name: 'Public Safety', enabled: true, description: 'Street lighting, road hazards, pedestrian crossings' },
  { id: 'cat-8', name: 'Transport', enabled: true, description: 'Rural link roads, bridge maintenance, public bus services' },
  { id: 'cat-9', name: 'Digital Services', enabled: true, description: 'CSC connectivity, government portal access, public Wi-Fi' },
  { id: 'cat-10', name: 'Other', enabled: true, description: 'Cross-cutting community and civic challenges' },
]

const DEFAULT_ANNOUNCEMENTS: AdminAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Statewide Innovation Drive 2026 Active',
    message: 'All 24 Jharkhand districts are now onboarded for direct citizen problem intake and university collaboration.',
    audience: 'All Users',
    priority: 'Important',
    active: true,
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Monsoon Preparedness Focus Call',
    message: 'Higher Education Institutions are requested to prioritize water drainage and rural bridge stability submissions.',
    audience: 'HEI',
    priority: 'Urgent',
    active: true,
    createdAt: '2026-03-05T12:30:00Z',
  },
]

const DEFAULT_AUDIT_LOGS: AdminAuditEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-03-08T10:15:00Z',
    action: 'System Boot',
    targetItem: 'Platform Engine',
    description: 'Initialized ImpactForge Super Admin Management Console',
    performedBy: 'System',
  },
  {
    id: 'aud-002',
    timestamp: '2026-03-08T11:00:00Z',
    action: 'Category Loaded',
    targetItem: 'Taxonomy',
    description: 'Synced 10 core civic problem categories',
    performedBy: 'admin@impactforge.org',
  },
]

const DEFAULT_SETTINGS: AdminPortalSettings = {
  platformName: 'ImpactForge Jharkhand',
  platformDescription: 'State Citizen-to-Government and Academic Impact Platform',
  maintenanceMode: false,
  allowNewCitizenSubmissions: true,
  showAnnouncements: true,
  defaultReportStatus: 'Open',
}

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(() =>
    loadStored<AdminUser[]>(USERS_STORAGE_KEY, DEFAULT_USERS)
  )

  const [categories, setCategories] = useState<AdminCategory[]>(() =>
    loadStored<AdminCategory[]>(CATEGORIES_STORAGE_KEY, DEFAULT_CATEGORIES)
  )

  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(() =>
    loadStored<AdminAnnouncement[]>(ANNOUNCEMENTS_STORAGE_KEY, DEFAULT_ANNOUNCEMENTS)
  )

  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>(() =>
    loadStored<AdminAuditEntry[]>(AUDIT_STORAGE_KEY, DEFAULT_AUDIT_LOGS)
  )

  const [settings, setSettings] = useState<AdminPortalSettings>(() =>
    loadStored<AdminPortalSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)
  )

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    } catch {
      // ignore
    }
  }, [users])

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
    } catch {
      // ignore
    }
  }, [categories])

  useEffect(() => {
    try {
      localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements))
    } catch {
      // ignore
    }
  }, [announcements])

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditLogs))
    } catch {
      // ignore
    }
  }, [auditLogs])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const addAuditEntry = (entry: { action: string; targetItem: string; description: string }) => {
    const newEntry: AdminAuditEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      targetItem: entry.targetItem,
      description: entry.description,
      performedBy: 'admin@impactforge.org',
    }
    setAuditLogs((prev) => [newEntry, ...prev])
  }

  const clearAuditLog = () => {
    setAuditLogs([])
  }

  // Users
  const addUser = (userData: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newUser: AdminUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setUsers((prev) => [newUser, ...prev])
    addAuditEntry({
      action: 'Create User',
      targetItem: newUser.email,
      description: `Created demo user "${newUser.name}" with role ${newUser.role}`,
    })
  }

  const updateUser = (id: string, updates: Partial<AdminUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates }
          addAuditEntry({
            action: 'Update User',
            targetItem: updated.email,
            description: `Updated details/status for user "${updated.name}" (${updated.role})`,
          })
          return updated
        }
        return u
      })
    )
  }

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id)
    if (target) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      addAuditEntry({
        action: 'Delete User',
        targetItem: target.email,
        description: `Deleted demo user "${target.name}" (${target.role})`,
      })
    }
  }

  // Categories
  const addCategory = (name: string, description?: string) => {
    const newCat: AdminCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      enabled: true,
      description: description?.trim() || undefined,
    }
    setCategories((prev) => [...prev, newCat])
    addAuditEntry({
      action: 'Create Category',
      targetItem: newCat.name,
      description: `Added problem category "${newCat.name}"`,
    })
  }

  const renameCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const oldName = c.name
          const updated = { ...c, name: name.trim() }
          addAuditEntry({
            action: 'Rename Category',
            targetItem: updated.name,
            description: `Renamed category "${oldName}" to "${updated.name}"`,
          })
          return updated
        }
        return c
      })
    )
  }

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.enabled
          addAuditEntry({
            action: nextState ? 'Enable Category' : 'Disable Category',
            targetItem: c.name,
            description: `${nextState ? 'Enabled' : 'Disabled'} problem category "${c.name}"`,
          })
          return { ...c, enabled: nextState }
        }
        return c
      })
    )
  }

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id)
    if (target) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      addAuditEntry({
        action: 'Delete Category',
        targetItem: target.name,
        description: `Removed problem category "${target.name}"`,
      })
    }
  }

  // Announcements
  const addAnnouncement = (data: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => {
    const newAnn: AdminAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setAnnouncements((prev) => [newAnn, ...prev])
    addAuditEntry({
      action: 'Create Announcement',
      targetItem: newAnn.title,
      description: `Broadcasted announcement "${newAnn.title}" to ${newAnn.audience}`,
    })
  }

  const updateAnnouncement = (id: string, updates: Partial<AdminAnnouncement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, ...updates }
          addAuditEntry({
            action: 'Update Announcement',
            targetItem: updated.title,
            description: `Updated announcement "${updated.title}"`,
          })
          return updated
        }
        return a
      })
    )
  }

  const toggleAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextState = !a.active
          addAuditEntry({
            action: nextState ? 'Activate Announcement' : 'Deactivate Announcement',
            targetItem: a.title,
            description: `${nextState ? 'Activated' : 'Deactivated'} announcement "${a.title}"`,
          })
          return { ...a, active: nextState }
        }
        return a
      })
    )
  }

  const deleteAnnouncement = (id: string) => {
    const target = announcements.find((a) => a.id === id)
    if (target) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      addAuditEntry({
        action: 'Delete Announcement',
        targetItem: target.title,
        description: `Deleted announcement "${target.title}"`,
      })
    }
  }

  // Settings
  const updateSettings = (updates: Partial<AdminPortalSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates }
      addAuditEntry({
        action: 'Update Settings',
        targetItem: 'Portal Settings',
        description: 'Updated platform configuration in local storage',
      })
      return next
    })
  }

  return (
    <AdminContext.Provider
      value={{
        users,
        categories,
        announcements,
        auditLogs,
        settings,
        addUser,
        updateUser,
        deleteUser,
        addCategory,
        renameCategory,
        toggleCategory,
        deleteCategory,
        addAnnouncement,
        updateAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        updateSettings,
        addAuditEntry,
        clearAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
