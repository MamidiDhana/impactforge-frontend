import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const FACULTY_INTERESTED_STORAGE_KEY = 'impactforge.faculty.interested.v1'
const FACULTY_PROJECTS_STORAGE_KEY = 'impactforge.faculty.projects.v1'
const HEI_INTERESTED_STORAGE_KEY = 'impactforge.hei.interested.v1'
const HEI_PROJECTS_STORAGE_KEY = 'impactforge.hei.projects.v1'

export type FacultyProjectProgress = 'Not Started' | 'In Progress' | 'Completed'

export interface FacultyStudentAssignment {
  studentName: string
  studentId: string
  assignedDate: string
  notes?: string
}

export interface FacultyProjectItem {
  trackId: string
  addedDate: string
  progress: FacultyProjectProgress
  assignedStudent?: FacultyStudentAssignment | null
}

interface FacultyContextValue {
  interestedTrackIds: string[]
  facultyProjects: Record<string, FacultyProjectItem>
  isInterested: (trackId: string) => boolean
  toggleInterested: (trackId: string) => boolean
  isInProjects: (trackId: string) => boolean
  toggleProject: (trackId: string) => boolean
  addToProjects: (trackId: string) => void
  removeFromProjects: (trackId: string) => void
  assignStudent: (trackId: string, studentName: string, studentId: string, notes?: string) => void
  removeStudent: (trackId: string) => void
  updateProgress: (trackId: string, progress: FacultyProjectProgress) => void
  getProject: (trackId: string) => FacultyProjectItem | undefined
}

const FacultyContext = createContext<FacultyContextValue | undefined>(undefined)

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

function loadStoredProjects(key: string): Record<string, FacultyProjectItem> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, FacultyProjectItem>
    }
  } catch {
    // fallback
  }
  return {}
}

export function FacultyProvider({ children }: { children: ReactNode }) {
  const [interestedTrackIds, setInterestedTrackIds] = useState<string[]>(() =>
    loadStoredList(FACULTY_INTERESTED_STORAGE_KEY)
  )

  const [facultyProjects, setFacultyProjects] = useState<Record<string, FacultyProjectItem>>(() =>
    loadStoredProjects(FACULTY_PROJECTS_STORAGE_KEY)
  )

  useEffect(() => {
    try {
      localStorage.setItem(FACULTY_INTERESTED_STORAGE_KEY, JSON.stringify(interestedTrackIds))
    } catch {
      // ignore
    }
  }, [interestedTrackIds])

  useEffect(() => {
    try {
      localStorage.setItem(FACULTY_PROJECTS_STORAGE_KEY, JSON.stringify(facultyProjects))
    } catch {
      // ignore
    }
  }, [facultyProjects])

  const isInterested = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    if (interestedTrackIds.includes(id)) return true
    const heiInterested = loadStoredList(HEI_INTERESTED_STORAGE_KEY)
    return heiInterested.includes(id)
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

  const isInProjects = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    if (Boolean(facultyProjects[id])) return true
    const heiProjects = loadStoredList(HEI_PROJECTS_STORAGE_KEY)
    return heiProjects.includes(id)
  }

  const toggleProject = (trackId: string): boolean => {
    const id = trackId.toUpperCase().trim()
    let inProject = false
    setFacultyProjects((prev) => {
      if (prev[id]) {
        inProject = false
        const next = { ...prev }
        delete next[id]
        return next
      } else {
        inProject = true
        return {
          ...prev,
          [id]: {
            trackId: id,
            addedDate: new Date().toISOString(),
            progress: 'Not Started',
            assignedStudent: null,
          },
        }
      }
    })
    return inProject
  }

  const addToProjects = (trackId: string): void => {
    const id = trackId.toUpperCase().trim()
    setFacultyProjects((prev) => {
      if (prev[id]) return prev
      return {
        ...prev,
        [id]: {
          trackId: id,
          addedDate: new Date().toISOString(),
          progress: 'Not Started',
          assignedStudent: null,
        },
      }
    })
  }

  const removeFromProjects = (trackId: string): void => {
    const id = trackId.toUpperCase().trim()
    setFacultyProjects((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const assignStudent = (
    trackId: string,
    studentName: string,
    studentId: string,
    notes?: string
  ): void => {
    const id = trackId.toUpperCase().trim()
    setFacultyProjects((prev) => {
      const existing = prev[id] || {
        trackId: id,
        addedDate: new Date().toISOString(),
        progress: 'In Progress' as FacultyProjectProgress,
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          progress: existing.progress === 'Not Started' ? 'In Progress' : existing.progress,
          assignedStudent: {
            studentName: studentName.trim(),
            studentId: studentId.trim(),
            assignedDate: new Date().toISOString(),
            notes: notes?.trim() || undefined,
          },
        },
      }
    })
  }

  const removeStudent = (trackId: string): void => {
    const id = trackId.toUpperCase().trim()
    setFacultyProjects((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      return {
        ...prev,
        [id]: {
          ...existing,
          assignedStudent: null,
        },
      }
    })
  }

  const updateProgress = (trackId: string, progress: FacultyProjectProgress): void => {
    const id = trackId.toUpperCase().trim()
    setFacultyProjects((prev) => {
      const existing = prev[id]
      if (!existing) return prev
      return {
        ...prev,
        [id]: {
          ...existing,
          progress,
        },
      }
    })
  }

  const getProject = (trackId: string): FacultyProjectItem | undefined => {
    const id = trackId.toUpperCase().trim()
    return facultyProjects[id]
  }

  return (
    <FacultyContext.Provider
      value={{
        interestedTrackIds,
        facultyProjects,
        isInterested,
        toggleInterested,
        isInProjects,
        toggleProject,
        addToProjects,
        removeFromProjects,
        assignStudent,
        removeStudent,
        updateProgress,
        getProject,
      }}
    >
      {children}
    </FacultyContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFaculty() {
  const context = useContext(FacultyContext)
  if (!context) {
    throw new Error('useFaculty must be used within a FacultyProvider')
  }
  return context
}
