import { useMemo, useState } from 'react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage, HEIFilters, HEIProblemCard } from './HEIShared'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { heiProblems } from '../../data/heiProblems'
export function RecommendedProblemsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [selected, setSelected] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const results = useMemo(
    () =>
      heiProblems.filter(
        (item) =>
          `${item.title} ${item.description}`.toLowerCase().includes(search.toLowerCase()) &&
          (category === 'All categories' || item.category === category)
      ),
    [category, search]
  )
  const problem = heiProblems.find((item) => item.id === selected)
  return (
    <HEILayout title="Recommendations">
      <HEIPage
        title="Recommendations"
        description="Explore validated community challenges matched to institutional capabilities."
        breadcrumbs={[
          { label: 'University', href: '/hei/dashboard' },
          { label: 'Recommendations' },
        ]}
      >
        <p className="mb-5 rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4 text-sm text-slate-600">
          Match percentages are <b>Mock AI match</b> results for frontend demonstration only.
        </p>
        <HEIFilters search={search} setSearch={setSearch} category={category} setCategory={setCategory} />
        <p className="mt-5 text-sm text-slate-500">{results.length} recommendations · Demo data</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <HEIProblemCard key={item.id} problem={item} onAccept={() => setSelected(item.id)} />
          ))}
        </div>
        {success && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{success}</p>}
        <ConfirmDialog
          open={Boolean(selected)}
          title="Accept this challenge?"
          description={problem?.title}
          confirmLabel="Accept challenge"
          onCancel={() => setSelected(null)}
          onConfirm={() => {
            setSelected(null)
            setSuccess(`${problem?.title} accepted. Mock challenge status updated.`)
          }}
        >
          <p className="mt-4 text-sm text-slate-500">
            Optional university comment can be added in the next collaboration phase.
          </p>
        </ConfirmDialog>
      </HEIPage>
    </HEILayout>
  )
}