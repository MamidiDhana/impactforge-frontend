import { useState } from 'react'
import { CheckCircle2, GraduationCap, Send } from 'lucide-react'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { SelectField } from '../../components/forms/SelectField'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import { governmentProblems } from '../../data/governmentProblems'
import { heiRecommendations } from '../../data/heiRecommendations'

export function HEIMatchingPage() {
  const [problemId, setProblemId] = useState(governmentProblems[3].id)
  const [sent, setSent] = useState('')
  const problem = governmentProblems.find((item) => item.id === problemId) ?? governmentProblems[3]

  return (
    <GovernmentLayout title="HEI Match">
      <GovPage
        title="HEI Match"
        description="Review universities that may have relevant capabilities for validated problems."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'HEI Match' },
        ]}
      >
        <p className="mb-5 flex gap-3 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-600">
          <GraduationCap className="shrink-0 text-[#187e8d]" />
          <span>
            <b>Mock AI-assisted university recommendations</b>
            <br />
            Recommendations are illustrative and require human review.
          </span>
        </p>
        <div className="max-w-xl">
          <SelectField
            label="Select a validated problem"
            value={problemId}
            onChange={(event) => setProblemId(event.target.value)}
            options={governmentProblems
              .filter((item) => item.status === 'Validated' || item.status === 'Converted to Project')
              .map((item) => ({ label: item.title, value: item.id }))}
          />
        </div>
        <ResponsiveCard className="mt-6">
          <h2 className="font-[Manrope] font-bold text-[#13243b]">Problem summary</h2>
          <p className="mt-2 text-sm text-slate-600">{problem.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {problem.requiredCapabilities.map((capability) => (
              <span key={capability} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {capability}
              </span>
            ))}
          </div>
        </ResponsiveCard>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {heiRecommendations.map((recommendation) => (
            <ResponsiveCard key={recommendation.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-[Manrope] font-bold text-[#13243b]">{recommendation.university}</h2>
                <span className="text-lg font-bold text-[#187e8d]">{recommendation.match}%</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {recommendation.location} · {recommendation.workload} workload
              </p>
              <p className="mt-4 flex-1 text-sm leading-6 text-slate-500">{recommendation.explanation}</p>
              <h3 className="mt-4 text-xs font-bold text-slate-700">Faculty expertise</h3>
              <p className="mt-1 text-xs text-slate-500">{recommendation.facultyExpertise.join(' · ')}</p>
              <h3 className="mt-3 text-xs font-bold text-slate-700">Resources</h3>
              <p className="mt-1 text-xs text-slate-500">{recommendation.resources.join(' · ')}</p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSent(`Recommendation sent to ${recommendation.university}.`)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-semibold text-white"
                >
                  <Send size={13} />
                  Send recommendation
                </button>
                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                  View university
                </button>
              </div>
            </ResponsiveCard>
          ))}
        </div>
        {sent && (
          <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 size={17} />
            {sent}
          </p>
        )}
      </GovPage>
    </GovernmentLayout>
  )
}