import { useState, useEffect } from 'react'
import { GraduationCap, AlertCircle, Check, X, Trash2, Info } from 'lucide-react'
import { Modal } from '../common/Modal'
import { useFaculty, type FacultyStudentAssignment } from '../../context/FacultyContext'
import type { BackendReportResponse } from '../../services/reportService'

interface FacultyAssignStudentModalProps {
  report: BackendReportResponse | null
  isOpen: boolean
  onClose: () => void
  onAssigned?: (trackId: string, studentName: string) => void
}

export function FacultyAssignStudentModal({
  report,
  isOpen,
  onClose,
  onAssigned,
}: FacultyAssignStudentModalProps) {
  const { getProject, assignStudent, removeStudent, addToProjects } = useFaculty()

  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const projectItem = report ? getProject(report.track_id) : undefined
  const currentAssignment: FacultyStudentAssignment | null | undefined = projectItem?.assignedStudent

  useEffect(() => {
    if (currentAssignment) {
      setStudentName(currentAssignment.studentName || '')
      setStudentId(currentAssignment.studentId || '')
      setNotes(currentAssignment.notes || '')
    } else {
      setStudentName('')
      setStudentId('')
      setNotes('')
    }
    setError(null)
  }, [currentAssignment, report, isOpen])

  if (!report) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!studentName.trim()) {
      setError('Student name is required.')
      return
    }
    if (!studentId.trim()) {
      setError('Student ID or Roll Number is required.')
      return
    }

    // Ensure it's in the faculty project list
    addToProjects(report.track_id)

    // Save assignment
    assignStudent(report.track_id, studentName.trim(), studentId.trim(), notes.trim())

    if (onAssigned) {
      onAssigned(report.track_id, studentName.trim())
    }
    onClose()
  }

  const handleRemove = () => {
    removeStudent(report.track_id)
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Assign Problem to Student"
    >
      <div className="space-y-4">
        {/* Problem Header Info */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-[#187e8d]">{report.track_id}</span>
            <span className="rounded bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">{report.category}</span>
          </div>
          <h4 className="mt-1.5 font-[Manrope] text-sm font-bold text-[#13243b]">{report.problem_title}</h4>
          <p className="mt-1 text-slate-500">
            {report.district}, {report.locality}
          </p>
        </div>

        {/* Temporary Client-Side Notice as per Requirement 10 */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900">
          <div className="flex items-start gap-2">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
            <div className="space-y-1">
              <p className="font-bold">Client-Side Session Storage</p>
              <p className="text-[11px] leading-relaxed text-blue-800">
                This student assignment is stored locally in your browser context. Persistent multi-user team synchronization across university departments will require a dedicated backend assignment API in a future release.
              </p>
            </div>
          </div>
        </div>

        {/* Current assignment status banner */}
        {currentAssignment && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <p className="font-bold flex items-center gap-1.5">
              <Check size={14} className="text-emerald-600" />
              Currently assigned to: {currentAssignment.studentName} ({currentAssignment.studentId})
            </p>
            <p className="mt-1 text-[11px] text-emerald-700">
              Assigned date: {new Date(currentAssignment.assignedDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3.5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="student-name" className="mb-1 block text-xs font-bold text-slate-700">
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Aman Kumar or Priya Sharma"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div>
            <label htmlFor="student-id" className="mb-1 block text-xs font-bold text-slate-700">
              Student ID / Roll Number <span className="text-red-500">*</span>
            </label>
            <input
              id="student-id"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. BT/CSE/2023/042 or 2104089"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div>
            <label htmlFor="student-notes" className="mb-1 block text-xs font-bold text-slate-700">
              Academic Guidance / Project Notes (Optional)
            </label>
            <textarea
              id="student-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Focus on low-cost filtration prototype; submit initial literature survey by Friday."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {currentAssignment ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                <Trash2 size={13} />
                <span>Remove Assignment</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <X size={13} className="inline mr-1" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
              >
                <GraduationCap size={14} />
                <span>{currentAssignment ? 'Update Assignment' : 'Assign Student'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
