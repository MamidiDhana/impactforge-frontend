import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SelectField } from '../../components/forms/SelectField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { RatingStars } from '../../components/feedback/RatingStars'
import { FeedbackCard } from '../../components/feedback/FeedbackCard'
import { citizenProblems } from '../../data/citizenProblems'
export function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [text, setText] = useState('')
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setRating(0)
    setText('')
  }
  return (
    <CitizenLayout title="Feedback">
      <PageContainer>
        <PageHeader
          title="Feedback"
          description="Your perspective helps teams learn whether a solution is useful in the real world."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Feedback' },
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <SelectField
              label="Related problem or project"
              options={citizenProblems.map((problem) => ({ label: problem.title, value: problem.id }))}
              required
            />
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-700">Rating</p>
              <RatingStars value={rating} onChange={setRating} label="Feedback rating" />
              <p className="mt-1 text-xs text-slate-500">Choose a rating from one to five stars.</p>
            </div>
            <div className="mt-5">
              <TextAreaField
                label="Feedback"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="What worked well or what was difficult?"
                required
              />
            </div>
            <div className="mt-5">
              <TextAreaField label="Improvement suggestion" placeholder="Optional suggestion for the team" />
            </div>
            {submitted && (
              <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 size={17} />
                Thank you. Your mock feedback was recorded locally.
              </p>
            )}
            <button
              type="submit"
              disabled={!rating || !text.trim()}
              className="mt-5 w-full rounded-lg bg-[#12365a] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Submit feedback
            </button>
          </form>
          <div>
            <h2 className="mb-4 font-[Manrope] text-lg font-bold text-[#13243b]">Previous feedback</h2>
            <FeedbackCard
              userName="Asha Rao"
              rating={4}
              text="The university team explained the prototype clearly and listened to local context."
              date="18 Aug 2026"
              response="Thank you for helping us improve the pilot."
            />
          </div>
        </div>
      </PageContainer>
    </CitizenLayout>
  )
}