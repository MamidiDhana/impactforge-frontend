import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  MessageSquare,
  Plus,
  Send,
  Star,
  Trash2,
  UserCheck,
  Users,
  AlertCircle,
  FileCheck,
} from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { EmptyState } from '../../components/common/EmptyState'
import { Modal } from '../../components/common/Modal'
import { FormField } from '../../components/forms/FormField'
import { useStudentTeams } from '../../hooks/useStudentTeams'
import { useAuth } from '../../context/AuthContext'
import type { TeamReview } from '../../data/facultyTeams'

export function TeamDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { currentUser } = useAuth()
  const {
    getTeam,
    addTeamComment,
    addTeamReview,
    addTeamMember,
    removeTeamMember,
  } = useStudentTeams()

  const team = getTeam(teamId ?? '')

  // Comment form state
  const [commentText, setCommentText] = useState('')
  const [commentBadge, setCommentBadge] = useState('Faculty Guidance')

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewStatus, setReviewStatus] = useState<TeamReview['status']>('Approved')
  const [reviewFeedback, setReviewFeedback] = useState('')

  // Add Member modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentRole, setNewStudentRole] = useState('')

  // Toast / feedback message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg)
    setTimeout(() => setFeedbackMsg(null), 4500)
  }

  if (!team) {
    return (
      <HEILayout
        title="Team Not Found"
        breadcrumbs={[
          { label: 'University Portal', href: '/university' },
          { label: 'Faculty', href: '/university/faculty' },
          { label: 'Student Teams', href: '/university/faculty/teams' },
          { label: 'Not Found' },
        ]}
      >
        <PageContainer>
          <EmptyState
            icon={AlertCircle}
            title="Team Not Found"
            description={`Could not locate a student team with identifier "${teamId}".`}
            action={
              <Link
                to="/university/faculty/teams"
                className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2 text-sm font-bold text-white"
              >
                <ArrowLeft size={16} />
                <span>Return to Student Teams</span>
              </Link>
            }
          />
        </PageContainer>
      </HEILayout>
    )
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const authorName = currentUser?.name || 'Faculty Mentor'
    const authorRole =
      currentUser?.role === 'faculty' ? 'Faculty Mentor' : 'University Administrator'

    addTeamComment(team.id, authorName, authorRole, commentText.trim(), commentBadge)
    setCommentText('')
    showFeedback('Faculty comment posted successfully.')
  }

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewFeedback.trim()) return

    const reviewerName = currentUser?.name || 'Faculty Reviewer'
    const reviewerRole =
      currentUser?.role === 'faculty' ? 'Faculty Lead' : 'Academic Board Reviewer'

    addTeamReview(team.id, {
      reviewerName,
      reviewerRole,
      rating: reviewRating,
      feedback: reviewFeedback.trim(),
      status: reviewStatus,
    })

    setIsReviewOpen(false)
    setReviewFeedback('')
    showFeedback('Team performance review recorded successfully.')
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName.trim()) return

    const formatted = `${newStudentName.trim()}${
      newStudentRole.trim() ? ` (${newStudentRole.trim()})` : ''
    }`
    addTeamMember(team.id, formatted)

    setIsAddMemberOpen(false)
    setNewStudentName('')
    setNewStudentRole('')
    showFeedback(`Student "${newStudentName.trim()}" added to ${team.name}.`)
  }

  const handleRemoveMember = (member: string) => {
    removeTeamMember(team.id, member)
    showFeedback(`Student "${member}" removed from roster.`)
  }

  const progressVal = team.progress ?? 50

  return (
    <HEILayout
      title={team.name}
      breadcrumbs={[
        { label: 'University Portal', href: '/university' },
        { label: 'Faculty', href: '/university/faculty' },
        { label: 'Student Teams', href: '/university/faculty/teams' },
        { label: team.name },
      ]}
    >
      <PageContainer>
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/university/faculty/teams"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#12365a]"
          >
            <ArrowLeft size={14} />
            <span>Back to Student Teams</span>
          </Link>
        </div>

        <PageHeader
          title={team.name}
          description={`Team ID: ${team.id} · Problem/Project: ${team.project}`}
          breadcrumbs={[
            { label: 'University Portal', href: '/university' },
            { label: 'Faculty', href: '/university/faculty' },
            { label: 'Student Teams', href: '/university/faculty/teams' },
            { label: team.name },
          ]}
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#12365a] bg-white px-3.5 py-2 text-xs font-bold text-[#12365a] shadow-xs transition hover:bg-slate-50"
              >
                <FileCheck size={14} />
                <span>Submit Review</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1a4a7a]"
              >
                <Plus size={14} />
                <span>Add Student Member</span>
              </button>
            </div>
          }
        />

        {feedbackMsg && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
          >
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="mb-8 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                Team ID: {team.id}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  team.status === 'Working'
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : team.status === 'Active'
                    ? 'border border-blue-200 bg-blue-50 text-blue-700'
                    : 'border border-amber-200 bg-amber-50 text-amber-700'
                }`}
              >
                {team.status}
              </span>
              {team.department && (
                <span className="text-xs text-slate-500">· {team.department}</span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              {team.description ||
                `Interdisciplinary student innovation team actively executing on ${team.project}.`}
            </p>

            <div className="grid gap-3 pt-2 sm:grid-cols-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-[#187e8d] shrink-0" />
                <span>
                  Faculty Mentor: <strong>{team.facultyMentor}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-[#187e8d] shrink-0" />
                <span>
                  Team Leader:{' '}
                  <strong>{team.leadStudent || team.students[0] || 'Unassigned'}</strong>
                </span>
              </div>
              {team.meetingSchedule && (
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#187e8d] shrink-0" />
                  <span>Weekly Sync: {team.meetingSchedule}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FolderKanban size={15} className="text-[#187e8d] shrink-0" />
                <span>
                  Related Project: <strong>{team.project}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="flex flex-col justify-between rounded-xl border border-[#b8dfe0] bg-[#f2fafb] p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#187e8d]">
                  Milestone Execution
                </span>
                <span className="text-lg font-extrabold text-[#13243b]">{progressVal}%</span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                <div
                  className="h-full rounded-full bg-[#187e8d] transition-all"
                  style={{ width: `${progressVal}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Completed Milestones:{' '}
                <strong className="text-slate-800">{team.completedMilestones ?? 1}</strong> stages
                verified.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#d0ecee] text-xs flex justify-between items-center text-slate-500">
              <span>{team.students.length} active researchers</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                Cohort Good Standing
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Left Column Roster & Capabilities, Right Column Comments & Reviews */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left 7 cols: Members Roster & Capabilities */}
          <div className="space-y-6 lg:col-span-7">
            {/* Members Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Users className="text-[#187e8d]" size={18} />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Team Members & Roles ({team.students.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#187e8d] hover:underline"
                >
                  <Plus size={14} />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {team.students.map((student, idx) => {
                  const isLeader =
                    team.leadStudent && student.includes(team.leadStudent.split(' ')[0])

                  return (
                    <div
                      key={`${student}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs transition hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-8 place-items-center rounded-full bg-[#d9eeee] font-bold text-[#12365a]">
                          {student.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{student}</p>
                          <p className="text-[11px] text-slate-400">
                            Registered Contributor · Active Status
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLeader && (
                          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                            Team Lead
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(student)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove from roster"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Demonstrated Capabilities & Gaps */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Capabilities & Innovation Focus
              </h3>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Demonstrated Skills
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="rounded-lg bg-[#e8f5f5] px-3 py-1 text-xs font-semibold text-[#187e8d]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {team.missingCapabilities && team.missingCapabilities.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Identified Resource / Skill Gaps
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.missingCapabilities.map((gap) => (
                      <span
                        key={gap}
                        className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 cols: Reviews & Faculty Guidance Feed */}
          <div className="space-y-6 lg:col-span-5">
            {/* Faculty Reviews */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="text-[#187e8d]" size={18} />
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Faculty Reviews ({team.reviews?.length ?? 0})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(true)}
                  className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Add Review
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {(!team.reviews || team.reviews.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No formal reviews recorded yet.</p>
                )}
                {team.reviews?.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-800">{rev.reviewerName}</p>
                        <p className="text-[10px] text-slate-400">
                          {rev.reviewerRole} · {rev.date}
                        </p>
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          rev.status === 'Commended'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : rev.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-amber-400' : 'text-slate-200'}
                        />
                      ))}
                    </div>

                    <p className="text-slate-600 leading-relaxed">{rev.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Comments & Notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="text-[#187e8d]" size={18} />
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Faculty Comments & Guidance
                </h3>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostComment} className="mt-4 space-y-3">
                <div>
                  <textarea
                    rows={3}
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Provide guidance, action items, or feedback to the cohort..."
                    className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={commentBadge}
                    onChange={(e) => setCommentBadge(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#187e8d] focus:outline-none"
                  >
                    <option value="Faculty Guidance">Faculty Guidance</option>
                    <option value="Milestone Update">Milestone Update</option>
                    <option value="Lab Action">Lab Action</option>
                    <option value="Governance">Governance</option>
                  </select>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    <Send size={12} />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>

              {/* Comments Feed */}
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                {(!team.comments || team.comments.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
                )}
                {team.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{comment.authorName}</span>
                        {comment.badge && (
                          <span className="rounded bg-[#e8f5f5] px-1.5 py-0.5 text-[10px] font-bold text-[#187e8d]">
                            {comment.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{comment.date}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Review Modal */}
        <Modal open={isReviewOpen} title="Submit Faculty Review" onClose={() => setIsReviewOpen(false)}>
          <form onSubmit={handlePostReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700">Evaluation Rating</label>
              <div className="mt-1 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setReviewRating(score)}
                    className="p-1"
                  >
                    <Star
                      size={20}
                      fill={score <= reviewRating ? '#f59e0b' : 'none'}
                      className={score <= reviewRating ? 'text-amber-500' : 'text-slate-300'}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-slate-700">{reviewRating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Review Determination</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as TeamReview['status'])}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              >
                <option value="Approved">Approved (Meets Stage Criteria)</option>
                <option value="Commended">Commended (Exceptional Execution)</option>
                <option value="Requires Revision">Requires Revision (Action Items Needed)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700">Detailed Feedback & Notes</label>
              <textarea
                rows={4}
                required
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Describe experimental rigor, design progress, or required rectifications..."
                className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
              >
                Record Review
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Student Member Modal */}
        <Modal
          open={isAddMemberOpen}
          title="Add Student Member to Team"
          onClose={() => setIsAddMemberOpen(false)}
        >
          <form onSubmit={handleAddMember} className="space-y-4 text-xs">
            <FormField
              label="Student Name"
              required
              placeholder="e.g. Divya Prakash"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
            />

            <FormField
              label="Functional Role / Specialization"
              placeholder="e.g. Sensor Calibration, Cloud Backend, UI Testing"
              value={newStudentRole}
              onChange={(e) => setNewStudentRole(e.target.value)}
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#12365a] px-5 py-2 font-bold text-white hover:bg-[#1a4a7a]"
              >
                Add Member
              </button>
            </div>
          </form>
        </Modal>
      </PageContainer>
    </HEILayout>
  )
}
