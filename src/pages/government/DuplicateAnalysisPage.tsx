import { useState } from 'react'
import { Bot, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { SelectField } from '../../components/forms/SelectField'
import { duplicateAnalysis } from '../../data/duplicateAnalysis'
export function DuplicateAnalysisPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  return (
    <GovernmentLayout title="Duplicates">
      <GovPage
        title="Duplicates"
        description="Review possible duplicate cases surfaced for human decision-making."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Duplicates' },
        ]}
      >
        <div className="mb-5 flex gap-3 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-600">
          <Bot className="shrink-0 text-[#187e8d]" />
          These similarity results are illustrative. No real AI model has run.
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {duplicateAnalysis.map((item) => (
            <ResponsiveCard key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#187e8d]">{item.status}</p>
                  <h2 className="mt-2 font-[Manrope] font-bold text-[#13243b]">{item.problemTitle}</h2>
                </div>
                <span className="text-xl font-bold text-amber-700">{item.similarity}%</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Possible duplicate: <b>{item.possibleDuplicate}</b>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {item.category} · {item.location}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-500">{item.reason}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className="rounded-lg bg-[#12365a] px-3 py-2 text-xs font-semibold text-white"
                >
                  Mark as duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setSuccess('Marked as not a duplicate.')}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Not a duplicate
                </button>
                <Link
                  to="/government/problem-queue"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Review original
                </Link>
              </div>
            </ResponsiveCard>
          ))}
        </div>
        {success && (
          <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 size={17} />
            {success}
          </p>
        )}
        <ConfirmDialog
          open={Boolean(selected)}
          title="Mark as duplicate?"
          description="Select the original problem that should remain visible."
          confirmLabel="Mark duplicate"
          onCancel={() => setSelected(null)}
          onConfirm={() => {
            setSelected(null)
            setSuccess('Duplicate marked successfully. Mock audit activity added.')
          }}
        >
          <div className="mt-4">
            <SelectField
              label="Original problem"
              options={duplicateAnalysis.map((item) => ({ label: item.possibleDuplicate, value: item.id }))}
            />
          </div>
        </ConfirmDialog>
      </GovPage>
    </GovernmentLayout>
  )
}