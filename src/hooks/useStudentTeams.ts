import { useState, useEffect, useCallback } from 'react'
import {
  facultyTeams as initialTeams,
  type ExtendedWorkspaceTeam,
  type FacultyComment,
  type TeamReview,
} from '../data/facultyTeams'

const STORAGE_KEY = 'impactforge.faculty.teams.v2'
const UPDATE_EVENT = 'impactforge:teams-updated'

function loadTeams(): ExtendedWorkspaceTeam[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // fallback
  }
  return initialTeams
}

function saveTeams(teams: ExtendedWorkspaceTeam[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teams))
    window.dispatchEvent(new Event(UPDATE_EVENT))
  } catch {
    // fallback
  }
}

export function useStudentTeams() {
  const [teams, setTeams] = useState<ExtendedWorkspaceTeam[]>(loadTeams)

  useEffect(() => {
    const handleUpdate = () => {
      setTeams(loadTeams())
    }
    window.addEventListener(UPDATE_EVENT, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener(UPDATE_EVENT, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const getTeam = useCallback(
    (teamId: string) => {
      return teams.find((t) => t.id === teamId || t.id.toLowerCase() === teamId.toLowerCase())
    },
    [teams]
  )

  const addTeamComment = useCallback(
    (
      teamId: string,
      authorName: string,
      authorRole: string,
      content: string,
      badge: string = 'Faculty Feedback'
    ) => {
      setTeams((prev) => {
        const updated = prev.map((t) => {
          if (t.id === teamId || t.id.toLowerCase() === teamId.toLowerCase()) {
            const newComment: FacultyComment = {
              id: `com-${Date.now()}`,
              authorName,
              authorRole,
              date: new Date().toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              content,
              badge,
            }
            return {
              ...t,
              comments: [newComment, ...(t.comments ?? [])],
            }
          }
          return t
        })
        saveTeams(updated)
        return updated
      })
    },
    []
  )

  const addTeamReview = useCallback(
    (teamId: string, review: Omit<TeamReview, 'id' | 'date'>) => {
      setTeams((prev) => {
        const updated = prev.map((t) => {
          if (t.id === teamId || t.id.toLowerCase() === teamId.toLowerCase()) {
            const newReview: TeamReview = {
              ...review,
              id: `rev-${Date.now()}`,
              date: new Date().toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            }
            return {
              ...t,
              reviews: [newReview, ...(t.reviews ?? [])],
            }
          }
          return t
        })
        saveTeams(updated)
        return updated
      })
    },
    []
  )

  const addTeamMember = useCallback((teamId: string, memberFormatted: string) => {
    setTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === teamId || t.id.toLowerCase() === teamId.toLowerCase()) {
          const newStudents = [...t.students, memberFormatted]
          return {
            ...t,
            students: newStudents,
            studentCount: newStudents.length,
          }
        }
        return t
      })
      saveTeams(updated)
      return updated
    })
  }, [])

  const removeTeamMember = useCallback((teamId: string, memberFormatted: string) => {
    setTeams((prev) => {
      const updated = prev.map((t) => {
        if (t.id === teamId || t.id.toLowerCase() === teamId.toLowerCase()) {
          const newStudents = t.students.filter((s) => s !== memberFormatted)
          return {
            ...t,
            students: newStudents,
            studentCount: Math.max(0, newStudents.length),
          }
        }
        return t
      })
      saveTeams(updated)
      return updated
    })
  }, [])

  const createTeam = useCallback(
    (newTeamData: Omit<ExtendedWorkspaceTeam, 'id'> & { id?: string }) => {
      setTeams((prev) => {
        const newTeam: ExtendedWorkspaceTeam = {
          ...newTeamData,
          id: newTeamData.id || `wt-${Date.now()}`,
          students: newTeamData.students || [],
          studentCount: (newTeamData.students || []).length,
          progress: newTeamData.progress ?? 10,
          completedMilestones: newTeamData.completedMilestones ?? 0,
          reviews: newTeamData.reviews ?? [],
          comments: newTeamData.comments ?? [],
        }
        const updated = [newTeam, ...prev]
        saveTeams(updated)
        return updated
      })
    },
    []
  )

  return {
    teams,
    getTeam,
    addTeamComment,
    addTeamReview,
    addTeamMember,
    removeTeamMember,
    createTeam,
  }
}
