import { useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileOutput,
  FolderKanban,
  GraduationCap,
  Handshake,
  Network,
  Search,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'
import { StatCard } from '../../components/common/StatCard'
import { QuickActionCard } from '../../components/dashboard/QuickActionCard'
import { SectionHeader } from '../../components/common/SectionHeader'
import { Modal } from '../../components/common/Modal'
import { facultyProjects } from '../../data/facultyProjects'
import { facultyMilestones } from '../../data/facultyMilestones'
import { facultyCapabilityGaps } from '../../data/facultyCapabilityGaps'
import { facultyTeams } from '../../data/facultyTeams'
import { partnerRequests } from '../../data/partnerRequests'
import {
  initialFacultyProjectOutputs,
  initialFacultyProjectTasks,
  initialStudentPerformanceMetrics,
  type FacultyProjectOutput,
  type StudentPerformanceMetric,
} from '../../data/facultyStudentManagement'

export function FacultyDashboardPage() {
  const navigate = useNavigate()

  // Academic KPIs
  const activeProjectsCount = facultyProjects.length
  const activeTeamsCount = facultyTeams.length
  const openGapsCount = facultyCapabilityGaps.filter((g) => g.status === 'Open').length
  const upcomingMilestonesCount = facultyMilestones.filter((m) => m.status === 'In Progress' || m.status === 'Upcoming').length

  // Student Project Submissions Review State
  const [submissions, setSubmissions] = useState<FacultyProjectOutput[]>(initialFacultyProjectOutputs)
  const [reviewingSubmission, setReviewingSubmission] = useState<FacultyProjectOutput | null>(null)
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Changes Requested' | 'Rejected'>('Approved')
  const [reviewNote, setReviewNote] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  // Student Performance Table State
  const [metrics] = useState<StudentPerformanceMetric[]>(initialStudentPerformanceMetrics)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState('All')

  // Calculate Student Progress Tracking metrics
  const totalStudentTasks = initialFacultyProjectTasks.length
  const completedStudentTasks = initialFacultyProjectTasks.filter((t) => t.status === 'Completed').length
  const inProgressStudentTasks = initialFacultyProjectTasks.filter((t) => t.status === 'In Progress').length
  const inReviewStudentTasks = initialFacultyProjectTasks.filter((t) => t.status === 'Review').length
  const overdueStudentTasks = 1 // Mock indicator
  const overallCohortProgress = Math.round(
    initialFacultyProjectTasks.reduce((acc, curr) => acc + curr.progress, 0) / (totalStudentTasks || 1)
  )

  // Filtered Student Performance
  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) => {
      const matchSearch =
        m.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
        m.projectName.toLowerCase().includes(studentSearch.toLowerCase())
      const matchStatus = studentStatusFilter === 'All' || m.status === studentStatusFilter
      return matchSearch && matchStatus
    })
  }, [metrics, studentSearch, studentStatusFilter])

  // Handle Review Submission Submission
  const handleOpenReview = (submission: FacultyProjectOutput) => {
    setReviewingSubmission(submission)
    setReviewDecision(submission.reviewStatus === 'Pending Review' ? 'Approved' : submission.reviewStatus)
    setReviewNote(submission.reviewerComments || '')
  }

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingSubmission) return

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === reviewingSubmission.id
          ? {
              ...sub,
              reviewStatus: reviewDecision,
              reviewerComments: reviewNote.trim() || `Reviewed as ${reviewDecision} by Dr. Menon`,
            }
          : sub
      )
    )

    setFeedback(`Submission "${reviewingSubmission.title}" marked as ${reviewDecision}.`)
    setReviewingSubmission(null)
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleQuickApprove = (id: string, title: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === id
          ? {
              ...sub,
              reviewStatus: 'Approved',
              reviewerComments: 'Quick approved by Faculty Mentor.',
            }
          : sub
      )
    )
    setFeedback(`Approved output "${title}".`)
    setTimeout(() => setFeedback(null), 4500)
  }

  return (
    <FacultyStudentLayout role="faculty" title="Faculty">
      <WorkspacePage
        role="faculty"
        title="Faculty"
        description="Guide teams and monitor project progress"
        breadcrumbs={[{ label: 'Faculty' }]}
      >
        <div className="space-y-8">
          {/* Feedback banner */}
          {feedback && (
            <div
              role="status"
              className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{feedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-bold text-[#187e8d]">
                    <GraduationCap size={14} />
                    Faculty Mentor Workspace
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    National Institute of Technology Karnataka (NITK)
                  </span>
                </div>
                <h2 className="font-[Manrope] text-2xl sm:text-3xl font-extrabold text-[#13243b]">
                  Guiding Student Innovators Toward Ground-Level Community Solutions
                </h2>
                <p className="text-sm leading-relaxed text-slate-600">
                  Manage solution delivery across student teams, assign tasks, review technical deliverables, bridge capability gaps, and track measurable outcomes from initial proposal to field deployment.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/faculty/projects')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1a4a7a]"
                >
                  <FolderKanban size={16} />
                  View All Projects
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/faculty/teams')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Users size={16} />
                  Student Teams
                </button>
              </div>
            </div>
          </div>

          {/* Academic Key Metrics */}
          <section>
            <SectionHeader
              title="Overview & Academic Key Metrics"
              description="Real-time summary of mentored student cohorts, project stages, and capability gaps."
            />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div onClick={() => navigate('/faculty/projects')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Assigned Projects"
                  value={activeProjectsCount}
                  description="Community innovation pilots"
                  icon={FolderKanban}
                />
              </div>
              <div onClick={() => navigate('/faculty/teams')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Active Student Teams"
                  value={activeTeamsCount}
                  description="Multidisciplinary cohorts"
                  icon={Users}
                />
              </div>
              <div onClick={() => navigate('/faculty/milestones')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Upcoming Milestones"
                  value={upcomingMilestonesCount}
                  description="Scheduled project deliverables"
                  icon={ClipboardCheck}
                />
              </div>
              <div onClick={() => navigate('/faculty/capability-gaps')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Open Capability Gaps"
                  value={openGapsCount}
                  description="Requiring partner support"
                  icon={Network}
                />
              </div>
              <div onClick={() => navigate('/faculty/projects')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Partner Collaborations"
                  value={partnerRequests.length}
                  description="Active industry & CSR support"
                  icon={Handshake}
                />
              </div>
              <div onClick={() => navigate('/faculty/projects')} className="cursor-pointer transition-transform hover:-translate-y-0.5">
                <StatCard
                  label="Beneficiaries Reached"
                  value="48,100"
                  description="Target community population"
                  icon={Building2}
                />
              </div>
            </div>
          </section>

          {/* TEAM PROGRESS TRACKING */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                  <ClipboardCheck size={22} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Team Progress Tracking
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live aggregate status of project tasks, active deliverables, and milestone progress
                  </p>
                </div>
              </div>
              <Link
                to="/faculty/projects/wp1"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#187e8d] hover:underline"
              >
                Open Project Workspace &rarr;
              </Link>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <span>Overall Student Cohort Delivery Progress</span>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {completedStudentTasks} of {totalStudentTasks} Tasks Completed
                  </span>
                </span>
                <span className="text-base font-extrabold text-[#187e8d]">{overallCohortProgress}%</span>
              </div>
              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#187e8d] to-teal-500 transition-all duration-500"
                  style={{ width: `${overallCohortProgress}%` }}
                />
              </div>
            </div>

            {/* Progress Summary Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800">Completed Tasks</span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-emerald-700">{completedStudentTasks}</p>
                <span className="text-[11px] text-emerald-600">Verified deliverables</span>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800">In Progress</span>
                  <ClipboardCheck size={16} className="text-blue-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-blue-700">{inProgressStudentTasks}</p>
                <span className="text-[11px] text-blue-600">Active student work</span>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-800">Under Review</span>
                  <FileCheck2 size={16} className="text-purple-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-purple-700">{inReviewStudentTasks}</p>
                <span className="text-[11px] text-purple-600">Awaiting mentor signoff</span>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800">Overdue / Blocked</span>
                  <AlertCircle size={16} className="text-amber-600" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-amber-700">{overdueStudentTasks}</p>
                <span className="text-[11px] text-amber-600">Requires assistance</span>
              </div>
            </div>
          </section>

          {/* PROJECT SUBMISSIONS AND REVIEWS WIDGET */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <FileOutput size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Project Submissions & Faculty Review Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review, approve, or request revisions on prototype deliverables uploaded by team members
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {submissions.filter((s) => s.reviewStatus === 'Pending Review').length} Pending
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4.5 shadow-sm transition hover:border-[#b8dfe0]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {sub.outputType} · {sub.version}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          sub.reviewStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.reviewStatus === 'Pending Review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : sub.reviewStatus === 'Changes Requested'
                                ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {sub.reviewStatus}
                      </span>
                    </div>

                    <h4 className="mt-2.5 font-[Manrope] text-base font-bold text-[#13243b]">
                      {sub.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{sub.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>Project: <strong className="text-slate-800">{sub.projectName}</strong></span>
                      <span>Student: <strong className="text-slate-800">{sub.submittedBy}</strong></span>
                      <span>Submitted: <strong>{sub.submissionDate}</strong></span>
                    </div>

                    {sub.reviewerComments && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100">
                        <strong className="text-slate-700">Faculty feedback:</strong> {sub.reviewerComments}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(sub)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                    >
                      <FileCheck2 size={14} />
                      Review & Feedback
                    </button>
                    {sub.reviewStatus !== 'Approved' && (
                      <button
                        type="button"
                        onClick={() => handleQuickApprove(sub.id, sub.title)}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        <CheckCircle2 size={13} />
                        Quick Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TEAM PERFORMANCE OVERVIEW TABLE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <GraduationCap size={22} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Team Performance Overview (Faculty-Only)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive performance matrix tracking assigned responsibilities, completion rates, and cohort velocity
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search member or project..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Ahead of Schedule">Ahead of Schedule</option>
                  <option value="On Track">On Track</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Behind Schedule">Behind Schedule</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Student Name</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3 text-center">Assigned Tasks</th>
                    <th className="px-4 py-3 text-center">Completed</th>
                    <th className="px-4 py-3 text-center">Pending</th>
                    <th className="px-4 py-3">Completion Rate</th>
                    <th className="px-4 py-3 rounded-r-lg">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMetrics.length > 0 ? (
                    filteredMetrics.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-7 place-items-center rounded-full bg-[#12365a] text-white font-bold text-[11px]">
                              {item.studentName.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{item.studentName}</p>
                              <p className="text-[11px] text-slate-400">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">{item.projectName}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-slate-800">{item.assignedTasks}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-emerald-700">{item.completedTasks}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-amber-700">{item.pendingTasks}</td>
                        <td className="px-4 py-3.5 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                            <span>{item.progressPercent}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.progressPercent >= 75
                                  ? 'bg-emerald-500'
                                  : item.progressPercent >= 50
                                    ? 'bg-[#187e8d]'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              item.status === 'Ahead of Schedule'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'On Track'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : item.status === 'Needs Review'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        No students match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Actions Bar */}
          <section>
            <SectionHeader title="Quick Actions" description="Fast workflows for mentoring and team administration." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <QuickActionCard
                title="View My Projects"
                description="Review timelines, tasks, documents, and stage progress."
                icon={FolderKanban}
                onClick={() => navigate('/faculty/projects')}
              />
              <QuickActionCard
                title="Manage Student Teams"
                description="Assign responsibilities and review student cohort progress."
                icon={Users}
                onClick={() => navigate('/faculty/teams')}
              />
              <QuickActionCard
                title="Review Capability Gaps"
                description="Identify missing technical skills and request partner collaboration."
                icon={Network}
                onClick={() => navigate('/faculty/capability-gaps')}
              />
              <QuickActionCard
                title="Update Milestones"
                description="Verify delivery dates and approve completed milestones."
                icon={ClipboardCheck}
                onClick={() => navigate('/faculty/milestones')}
              />
              <QuickActionCard
                title="Open Project Workspace"
                description="Access deep workspace for Solar Water Monitoring Pilot."
                icon={BriefcaseBusiness}
                onClick={() => navigate('/faculty/projects/wp1')}
              />
              <QuickActionCard
                title="Notifications & Alerts"
                description="Review partner offers and team output submissions."
                icon={Bell}
                onClick={() => navigate('/faculty/notifications')}
              />
            </div>
          </section>

          {/* Assigned Projects Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                  Assigned Community Projects
                </h3>
                <p className="text-xs text-slate-500">
                  Active projects led by your department and mentored student teams
                </p>
              </div>
              <Link
                to="/faculty/projects"
                className="text-xs font-bold text-[#187e8d] hover:underline"
              >
                View all projects ({facultyProjects.length}) →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {facultyProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#b8dfe0] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#187e8d]">
                        {project.category}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Stage: {project.stage}
                      </span>
                    </div>

                    <h4 className="mt-3 font-[Manrope] text-lg font-bold text-[#13243b]">
                      <Link to={`/faculty/projects/${project.id}`} className="hover:text-[#187e8d]">
                        {project.title}
                      </Link>
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                      Problem: <strong className="text-slate-700">{project.problemTitle}</strong>
                    </p>

                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4 rounded-lg bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Completion Progress</span>
                        <span className="font-bold text-[#187e8d]">{project.progress}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-[#187e8d]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Team: {project.studentTeam}</span>
                        <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      <strong>Next Target:</strong> {project.nextMilestone}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <Link
                      to={`/faculty/projects/${project.id}`}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                    >
                      Open Faculty Workspace
                      <ChevronRight size={13} />
                    </Link>
                    <Link
                      to={`/projects/${project.id}/overview`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      General Overview
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Upcoming Milestones Feed */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                  <ClipboardCheck size={18} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                    Upcoming Milestone Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deliverables due across all assigned projects
                  </p>
                </div>
              </div>
              <Link
                to="/faculty/milestones"
                className="text-xs font-bold text-[#187e8d] hover:underline"
              >
                Manage all milestones →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {facultyMilestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-[#13243b]">{milestone.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {milestone.project} · Lead: <span className="font-medium text-slate-700">{milestone.responsible}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={13} />
                      Due {milestone.dueDate}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        milestone.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : milestone.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {milestone.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Modal: Review Student Output */}
        <Modal
          open={Boolean(reviewingSubmission)}
          title={`Review Submission: ${reviewingSubmission?.title || ''}`}
          onClose={() => setReviewingSubmission(null)}
        >
          {reviewingSubmission && (
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
                <p><strong>Student Author:</strong> {reviewingSubmission.submittedBy}</p>
                <p><strong>Project:</strong> {reviewingSubmission.projectName}</p>
                <p><strong>Attachment:</strong> {reviewingSubmission.attachmentName || 'Mock Prototype Package'}</p>
                <p><strong>Description:</strong> {reviewingSubmission.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Review Action *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Approved', 'Changes Requested', 'Rejected'] as const).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setReviewDecision(action)}
                      className={`rounded-lg border py-2 text-xs font-bold transition ${
                        reviewDecision === action
                          ? action === 'Approved'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : action === 'Changes Requested'
                              ? 'border-orange-500 bg-orange-50 text-orange-800'
                              : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Mentor Review Feedback / Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Provide technical feedback, requested calibration changes, or validation remarks..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingSubmission(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  Save Review Decision
                </button>
              </div>
            </form>
          )}
        </Modal>
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}