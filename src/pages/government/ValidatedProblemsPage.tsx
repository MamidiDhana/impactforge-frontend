import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { FilterBar } from '../../components/forms/FilterBar'
import { EmptyState } from '../../components/common/EmptyState'
import { governmentProblems } from '../../data/governmentProblems'
export function ValidatedProblemsPage() {
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('All stages')
  const results = useMemo(
    () =>
      governmentProblems.filter(
        (item) =>
          (item.status === 'Validated' || item.status === 'Converted to Project') &&
          item.title.toLowerCase().includes(search.toLowerCase()) &&
          (stage === 'All stages' || item.currentStage === stage)
      ),
    [search, stage]
  )
  return (
    <GovernmentLayout title="Validated">
      <GovPage
        title="Validated"
        description="Monitor public problems moving toward university and partner matching."
        breadcrumbs={[
          { label: 'Government', href: '/government/dashboard' },
          { label: 'Validated' },
        ]}
      >
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: 'stage',
              label: 'Current stage',
              value: stage,
              options: ['All stages', 'University matching', 'Pilot'].map((value) => ({ label: value, value })),
              onChange: setStage,
            },
          ]}
        />
        <div className="mt-5 grid gap-4">
          {results.length ? (
            results.map((problem) => (
              <article key={problem.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">{problem.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {problem.category} · {problem.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-semibold text-[#187e8d]">
                    {problem.matchingStatus}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {problem.requiredCapabilities.map((capability) => (
                    <span key={capability} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {capability}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    Validated {problem.validationDate} · Stage: {problem.currentStage}
                  </span>
                  <Link to={`/government/problems/${problem.id}/review`} className="font-semibold text-[#187e8d]">
                    View details
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <EmptyState
              icon={Search}
              title="No validated problems found"
              description="Try another stage or search term."
            />
          )}
        </div>
      </GovPage>
    </GovernmentLayout>
  )
}