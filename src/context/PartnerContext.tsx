import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const PARTNER_INTERESTED_STORAGE_KEY = 'impactforge.partner.interested.v1'
const PARTNER_PROJECTS_STORAGE_KEY = 'impactforge.partner.projects.v1'

export type PartnershipStatus =
  | 'Not Contacted'
  | 'Interested'
  | 'Discussion Started'
  | 'Support Confirmed'
  | 'In Progress'
  | 'Completed'

export type PartnerSupportType =
  | 'Funding'
  | 'Technical Support'
  | 'Equipment'
  | 'Mentorship'
  | 'Volunteers'
  | 'Research Support'
  | 'Awareness Campaign'
  | 'Other'

export interface PartnershipDetails {
  organizationName: string
  contactPerson: string
  contactEmail: string
  supportType: PartnerSupportType
  supportCommitment: string
  notes?: string
  updatedAt: string
}

export interface PartnerProjectItem {
  trackId: string
  addedDate: string
  status: PartnershipStatus
  partnership?: PartnershipDetails | null
  partnerNotes?: string
}

interface PartnerContextValue {
  interestedTrackIds: string[]
  partnerProjects: Record<string, PartnerProjectItem>
  isInterested: (trackId: string) => boolean
  toggleInterested: (trackId: string) => boolean
  isSupported: (trackId: string) => boolean
  toggleSupported: (trackId: string) => boolean
  addToSupported: (trackId: string) => void
  removeFromSupported: (trackId: string) => void
  updatePartnershipStatus: (trackId: string, status: PartnershipStatus) => void
  savePartnership: (
    trackId: string,
    details: PartnershipDetails,
    newStatus?: PartnershipStatus
  ) => void
  updatePartnerNotes: (trackId: string, notes: string) => void
  getProject: (trackId: string) => PartnerProjectItem | undefined
}

const PartnerContext = createContext<PartnerContextValue | undefined>(undefined)

function loadStoredList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // fallback
  }
  return []
}

function loadStoredProjects(key: string): Record<string, PartnerProjectItem> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, PartnerProjectItem>
    }
  } catch {
    // fallback
  }
  return {}
}

export function PartnerProvider({ children }: { children: ReactNode }) {
  const [interestedTrackIds, setInterestedTrackIds] = useState<string[]>(() =>
    loadStoredList(PARTNER_INTERESTED_STORAGE_KEY)
  )

  const [partnerProjects, setPartnerProjects] = useState<Record<string, PartnerProjectItem>>(() =>
    loadStoredProjects(PARTNER_PROJECTS_STORAGE_KEY)
  )

  useEffect(() => {
    try {
      localStorage.setItem(PARTNER_INTERESTED_STORAGE_KEY, JSON.stringify(interestedTrackIds))
    } catch {
      // ignore
    }
  }, [interestedTrackIds])

  useEffect(() => {
    try {
      localStorage.setItem(PARTNER_PROJECTS_STORAGE_KEY, JSON.stringify(partnerProjects))
    } catch {
      // ignore
    }
  }, [partnerProjects])

  const isInterested = (trackId: string): boolean => {
    return interestedTrackIds.includes(trackId.toUpperCase().trim())
  }

  const toggleInterested = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    let nowInterested = false
    setInterestedTrackIds((prev) => {
      if (prev.includes(id)) {
        nowInterested = false
        return prev.filter((item) => item !== id)
      } else {
        nowInterested = true
        return [...prev, id]
      }
    })
    return nowInterested
  }

  const isSupported = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    return Boolean(partnerProjects[id])
  }

  const toggleSupported = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    let nowSupported = false
    setPartnerProjects((prev) => {
      if (prev[id]) {
        nowSupported = false
        const next = { ...prev }
        delete next[id]
        return next
      } else {
        nowSupported = true
        return {
          ...prev,
          [id]: {
            trackId: id,
            addedDate: new Date().toISOString(),
            status: 'Interested',
            partnership: null,
          },
        }
      }
    })
    return nowSupported
  }

  const addToSupported = (trackId: string): void => {
    const id = trackId.toUpperCase().trim()
    setPartnerProjects((prev) => {
      if (prev[id]) return prev
      return {
        ...prev,
        [id]: {
          trackId: id,
          addedDate: new Date().toISOString(),
          status: 'Interested',
          partnership: null,
        },
      }
    })
  }

  const removeFromSupported = (trackId: string): void => {
    const id = trackId.toUpperCase().trim()
    setPartnerProjects((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updatePartnershipStatus = (trackId: string, status: PartnershipStatus): void => {
    const id = trackId.toUpperCase().trim()
    setPartnerProjects((prev) => {
      const existing = prev[id] || {
        trackId: id,
        addedDate: new Date().toISOString(),
        status: 'Interested' as PartnershipStatus,
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          status,
        },
      }
    })
  }

  const savePartnership = (
    trackId: string,
    details: PartnershipDetails,
    newStatus?: PartnershipStatus
  ): void => {
    const id = trackId.toUpperCase().trim()
    setPartnerProjects((prev) => {
      const existing = prev[id] || {
        trackId: id,
        addedDate: new Date().toISOString(),
        status: 'Support Confirmed' as PartnershipStatus,
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          status: newStatus || existing.status === 'Not Contacted' || existing.status === 'Interested' ? (newStatus || 'Support Confirmed') : existing.status,
          partnership: details,
          partnerNotes: details.notes || existing.partnerNotes,
        },
      }
    })
  }

  const updatePartnerNotes = (trackId: string, notes: string): void => {
    const id = trackId.toUpperCase().trim()
    setPartnerProjects((prev) => {
      const existing = prev[id] || {
        trackId: id,
        addedDate: new Date().toISOString(),
        status: 'Interested' as PartnershipStatus,
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          partnerNotes: notes.trim(),
        },
      }
    })
  }

  const getProject = (trackId: string): PartnerProjectItem | undefined => {
    const id = trackId.toUpperCase().trim()
    return partnerProjects[id]
  }

  return (
    <PartnerContext.Provider
      value={{
        interestedTrackIds,
        partnerProjects,
        isInterested,
        toggleInterested,
        isSupported,
        toggleSupported,
        addToSupported,
        removeFromSupported,
        updatePartnershipStatus,
        savePartnership,
        updatePartnerNotes,
        getProject,
      }}
    >
      {children}
    </PartnerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePartner() {
  const context = useContext(PartnerContext)
  if (!context) {
    throw new Error('usePartner must be used within a PartnerProvider')
  }
  return context
}
