import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const HEI_INTERESTED_STORAGE_KEY = 'impactforge.hei.interested.v1'
const HEI_PROJECTS_STORAGE_KEY = 'impactforge.hei.projects.v1'

interface HEIContextValue {
  interestedTrackIds: string[]
  projectTrackIds: string[]
  isInterested: (trackId: string) => boolean
  toggleInterested: (trackId: string) => boolean
  addInterested: (trackId: string) => void
  removeInterested: (trackId: string) => void
  isInProjects: (trackId: string) => boolean
  toggleProject: (trackId: string) => boolean
  addToProjects: (trackId: string) => void
  removeFromProjects: (trackId: string) => void
}

const HEIContext = createContext<HEIContextValue | undefined>(undefined)

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

export function HEIProvider({ children }: { children: ReactNode }) {
  const [interestedTrackIds, setInterestedTrackIds] = useState<string[]>(() =>
    loadStoredList(HEI_INTERESTED_STORAGE_KEY)
  )
  const [projectTrackIds, setProjectTrackIds] = useState<string[]>(() =>
    loadStoredList(HEI_PROJECTS_STORAGE_KEY)
  )

  useEffect(() => {
    try {
      localStorage.setItem(HEI_INTERESTED_STORAGE_KEY, JSON.stringify(interestedTrackIds))
    } catch {
      // ignore
    }
  }, [interestedTrackIds])

  useEffect(() => {
    try {
      localStorage.setItem(HEI_PROJECTS_STORAGE_KEY, JSON.stringify(projectTrackIds))
    } catch {
      // ignore
    }
  }, [projectTrackIds])

  const isInterested = (trackId: string) => {
    return interestedTrackIds.includes(trackId.toUpperCase().trim())
  }

  const toggleInterested = (trackId: string) => {
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

  const addInterested = (trackId: string) => {
    const id = trackId.toUpperCase().trim()
    setInterestedTrackIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeInterested = (trackId: string) => {
    const id = trackId.toUpperCase().trim()
    setInterestedTrackIds((prev) => prev.filter((item) => item !== id))
  }

  const isInProjects = (trackId: string) => {
    return projectTrackIds.includes(trackId.toUpperCase().trim())
  }

  const toggleProject = (trackId: string) => {
    const id = trackId.toUpperCase().trim()
    let inProject = false
    setProjectTrackIds((prev) => {
      if (prev.includes(id)) {
        inProject = false
        return prev.filter((item) => item !== id)
      } else {
        inProject = true
        return [...prev, id]
      }
    })
    return inProject
  }

  const addToProjects = (trackId: string) => {
    const id = trackId.toUpperCase().trim()
    setProjectTrackIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const removeFromProjects = (trackId: string) => {
    const id = trackId.toUpperCase().trim()
    setProjectTrackIds((prev) => prev.filter((item) => item !== id))
  }

  return (
    <HEIContext.Provider
      value={{
        interestedTrackIds,
        projectTrackIds,
        isInterested,
        toggleInterested,
        addInterested,
        removeInterested,
        isInProjects,
        toggleProject,
        addToProjects,
        removeFromProjects,
      }}
    >
      {children}
    </HEIContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useHEI() {
  const ctx = useContext(HEIContext)
  if (!ctx) {
    throw new Error('useHEI must be used within an HEIProvider')
  }
  return ctx
}
