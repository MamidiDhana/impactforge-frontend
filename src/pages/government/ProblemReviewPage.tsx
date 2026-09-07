import { useState } from 'react'
import { Bot, FileText, Flag, GraduationCap, MapPin, ShieldCheck, Tag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage, SuccessNotice } from './GovernmentShared'
import { CitizenStatusBadge } from '../../components/citizen/CitizenStatusBadge'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { SelectField } from '../../components/forms/SelectField'
import { JharkhandMapPreview } from '../../components/citizen/JharkhandMapPreview'
import { governmentProblems } from '../../data/governmentProblems'
import { heiRecommendations } from '../../data/heiRecommendations'
import { useProblems } from '../../context/ProblemContext'

export function ProblemReviewPage() {
  const { id } = useParams()
  const { problems, updateProblemStatus } = useProblems()

  // Find problem from reactive context or fallback to governmentProblems
  const contextProblem = problems.find((item) => item.id === id || item.trackId === id)
  const govProblem = governmentProblems.find((item) => item.id === id)

  const [dialog, setDialog] = useState<'validate' | 'info' | 'reject' | 'redirect' | null>(null)
  const [success, setSuccess] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [infoQuestion, setInfoQuestion] = useState('')
  const [redirectDept, setRedirectDept] = useState('water')
  const [redirectReason, setRedirectReason] = useState('')

  if (!contextProblem && !govProblem) {
    return (
      <GovernmentLayout title="Problem review">
        <GovPage title="Problem not found">
          <EmptyState
            title="Problem not found"
            action={
              <Link
                to="/government/problem-queue"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-semibold text-white"
              >
                Back to queue
              </Link>
            }
          />
        </GovPage>
      </GovernmentLayout>
    )
  }

  // Merged view object with guaranteed Jharkhand values
  const trackId = contextProblem?.trackId || 'IF-JH-2026-0001'
  const title = contextProblem?.title || govProblem?.title || 'Community Challenge'
  const description = contextProblem?.description || govProblem?.description || ''
  const category = contextProblem?.category || govProblem?.category || 'Water and Sanitation'
  const status = contextProblem?.status || govProblem?.status || 'Submitted'
  const district = contextProblem?.district || 'Ramgarh'
  const locality = contextProblem?.locality || 'Patratu Block'
  const landmark = contextProblem?.landmark || 'Near Panchayat Bhavan'
  const location = contextProblem?.location || `${district}, Jharkhand (${locality})`
  const latitude = contextProblem?.latitude || 23.6300
  const longitude = contextProblem?.longitude || 85.5100
  const affectedPeople = contextProblem?.affectedPeople || govProblem?.affectedPeople || 4800
  const urgency = contextProblem?.urgency || govProblem?.urgency || 'High'
  const citizenLabel = contextProblem?.citizenId ? 'Verified Jharkhand Citizen' : govProblem?.citizenLabel || 'Citizen'
  const requiredCapabilities = contextProblem?.requiredCapabilities || govProblem?.requiredCapabilities || [
    'Water quality monitoring',
    'Community engagement',
  ]
  const attachedFiles = govProblem?.attachedFiles || []
  const problemId = contextProblem?.id || govProblem?.id || id || ''

  const handleValidate = () => {
    updateProblemStatus(
      problemId,
      'Validated',
      3,
      'Problem validated by Jharkhand District Innovation Cell. Approved for University matching.'
    )
    setDialog(null)
    setSuccess('Problem validated successfully. Track ID status updated to "Government Accepted".')
  }

  const handleReject = () => {
    updateProblemStatus(problemId, 'Rejected', 2, rejectReason || 'Does not meet program criteria.')
    setDialog(null)
    setSuccess('Problem rejected. Reason communicated to reporting citizen.')
  }

  const handleInfo = () => {
    updateProblemStatus(
      problemId,
      'More Information Required',
      2,
      infoQuestion || 'Please provide additional site details.'
    )
    setDialog(null)
    setSuccess('Information requested from reporting citizen.')
  }

  const handleRedirect = () => {
    updateProblemStatus(
      problemId,
      'Redirected',
      2,
      `Redirected to ${redirectDept} department: ${redirectReason}`
    )
    setDialog(null)
    setSuccess(`Problem successfully redirected to Jharkhand Department of ${redirectDept}.`)
  }

  return (
    <GovernmentLayout title="Review">
      <GovPage
        title="Review"
        description="Review citizen evidence, inspect Jharkhand geo-location, and make a governance decision."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Review' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#12365a] px-2.5 py-1 font-mono text-xs font-bold text-white tracking-wide">
              {trackId}
            </span>
            <CitizenStatusBadge status={status} />
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Problem Details and Geo-Location Preview */}
          <div className="space-y-6">
            <ResponsiveCard>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                  {title}
                </h2>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#187e8d]">
                  <Tag size={12} /> Track ID: {trackId}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#187e8d]" />
                  {location}
                </span>
                <span>
                  State: <b>Jharkhand, India</b>
                </span>
                <span>
                  District: <b>{district}</b>
                </span>
                <span>
                  Locality: <b>{locality}</b>
                </span>
                <span>
                  Landmark: <b>{landmark}</b>
                </span>
                <span>
                  Category: <b>{category}</b>
                </span>
                <span>
                  Affected people: <b>{affectedPeople.toLocaleString()}</b>
                </span>
                <span>
                  Urgency: <b>{urgency}</b>
                </span>
                <span>
                  Citizen Submitter: <b>{citizenLabel}</b>
                </span>
              </div>
            </ResponsiveCard>

            {/* Requirement 4.B: Government Citizen Location & Map Preview */}
            <ResponsiveCard>
              <h2 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Citizen-Submitted Jharkhand Location Preview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Verified geographical coordinates submitted by citizen for field audit and university site visits.
              </p>

              <div className="mt-4">
                <JharkhandMapPreview
                  district={district}
                  locality={locality}
                  landmark={landmark}
                  latitude={latitude}
                  longitude={longitude}
                />
              </div>

              <div className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
                <div>
                  GPS Coordinates: <b>{latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</b>
                </div>
                <div>
                  Operation Jurisdiction: <b>{district} District Administration</b>
                </div>
              </div>
            </ResponsiveCard>

            <ResponsiveCard>
              <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Evidence and Context
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Existing efforts: Community meetings and local panchayat representations have been attempted.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Expected outcome: A practical, locally maintainable improvement engineered by university faculty and students.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {attachedFiles.length ? (
                  attachedFiles.map((file) => (
                    <span
                      key={file}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600"
                    >
                      <FileText size={14} />
                      {file}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No external documents attached.</span>
                )}
              </div>
            </ResponsiveCard>
          </div>

          {/* Right Column: AI Analysis, HEI Recommendations, and Governance Actions */}
          <div className="space-y-6">
            <ResponsiveCard className="border-[#b8dfe0]">
              <div className="flex items-center gap-3">
                <Bot className="text-[#187e8d]" />
                <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                  AI-Assisted Capabilities Matching
                </h2>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Automated capability extraction for Jharkhand HEI matchmaking. Final governance decision rests with officer.
              </p>
              <div className="mt-5 grid gap-3 text-sm">
                <p>
                  Suggested category: <b>{category}</b>
                </p>
                <p>
                  Suggested priority: <b>{urgency === 'Critical' ? 'High' : 'Medium'}</b>
                </p>
                <p>
                  Duplicate status: <b>No duplicate detected in {district}</b>
                </p>
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-700">Extracted Capabilities</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {requiredCapabilities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-[#e8f5f5] px-3 py-1 text-xs text-[#187e8d]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-700">Recommended State HEIs</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <GraduationCap size={16} className="text-[#187e8d]" />
                {heiRecommendations[0]?.university || 'BIT Mesra, Ranchi'} ·{' '}
                {heiRecommendations[0]?.match || 92}% capability match
              </p>
            </ResponsiveCard>

            <ResponsiveCard>
              <h2 className="font-[Manrope] font-bold text-[#13243b]">
                Jharkhand Governance Review Checklist
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                {[
                  'Problem is located within Jharkhand boundaries',
                  'Location landmark and coordinates are verifiable',
                  'Urgency and affected population are reasonable',
                  'Suitable for state university / HEI solution matching',
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" className="size-4 accent-[#12365a]" defaultChecked />
                    {item}
                  </label>
                ))}
              </div>
            </ResponsiveCard>
          </div>
        </div>

        {success && (
          <div className="mt-6">
            <SuccessNotice>
              <ShieldCheck size={17} />
              {success}
            </SuccessNotice>
          </div>
        )}

        {/* Governance Decision Action Bar */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDialog('validate')}
            className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-800"
          >
            Validate Problem (Accept)
          </button>
          <button
            type="button"
            onClick={() => setDialog('info')}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          >
            Request More Information
          </button>
          <button
            type="button"
            onClick={() => setDialog('reject')}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Reject Problem
          </button>
          <button
            type="button"
            onClick={() => setDialog('redirect')}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Flag size={15} className="mr-1 inline" />
            Redirect
          </button>
          <Link
            to={`/government/duplicate-analysis`}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Similar Problems
          </Link>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={dialog === 'validate'}
          title="Validate and Accept this Problem?"
          description={`Validating this problem will mark Track ID ${trackId} as "Government Accepted" (Stage 4) and qualify it for recommendation to accredited Higher Education Institutions.`}
          confirmLabel="Validate problem"
          onCancel={() => setDialog(null)}
          onConfirm={handleValidate}
        />

        <ConfirmDialog
          open={dialog === 'reject'}
          title="Reject this problem?"
          description="A rejection reason is required and will be communicated to the reporting citizen."
          destructive
          confirmLabel="Reject problem"
          onCancel={() => setDialog(null)}
          onConfirm={handleReject}
        >
          <div className="mt-4">
            <TextAreaField
              label="Rejection reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this challenge cannot be supported under current state criteria..."
            />
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={dialog === 'info'}
          title="Request more information"
          description="Ask the citizen for missing site details or evidence."
          confirmLabel="Send request"
          onCancel={() => setDialog(null)}
          onConfirm={handleInfo}
        >
          <div className="mt-4">
            <TextAreaField
              label="Question or reason"
              value={infoQuestion}
              onChange={(e) => setInfoQuestion(e.target.value)}
              placeholder="Specify what details are missing (e.g. photos, local water test results)..."
            />
          </div>
        </ConfirmDialog>

        <ConfirmDialog
          open={dialog === 'redirect'}
          title="Redirect this problem"
          description="Select a Jharkhand government department to transfer responsibility."
          confirmLabel="Redirect problem"
          onCancel={() => setDialog(null)}
          onConfirm={handleRedirect}
        >
          <div className="mt-4 space-y-3">
            <SelectField
              label="Department"
              value={redirectDept}
              onChange={(e) => setRedirectDept(e.target.value)}
              options={[
                { label: 'Drinking Water and Sanitation Department, Jharkhand', value: 'water' },
                { label: 'Department of Health, Medical Education & Family Welfare', value: 'health' },
                { label: 'Department of School Education and Literacy', value: 'education' },
                { label: 'Agriculture, Animal Husbandry & Co-operative Department', value: 'agriculture' },
                { label: 'Road Construction Department, Jharkhand', value: 'roads' },
              ]}
            />
            <TextAreaField
              label="Redirection reason"
              value={redirectReason}
              onChange={(e) => setRedirectReason(e.target.value)}
              placeholder="Explain why this department is the appropriate authority..."
            />
          </div>
        </ConfirmDialog>
      </GovPage>
    </GovernmentLayout>
  )
}