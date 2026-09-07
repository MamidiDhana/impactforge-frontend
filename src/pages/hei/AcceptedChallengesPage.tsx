import { Link } from 'react-router-dom'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { heiProblems } from '../../data/heiProblems'
export function AcceptedChallengesPage() {
  return (
    <HEILayout title="Problems">
      <HEIPage
        title="Problems"
        description="Track community challenges your university has chosen to explore."
        breadcrumbs={[
          { label: 'University', href: '/hei/dashboard' },
          { label: 'Problems' },
        ]}
      >
        <div className="grid gap-4">
          {heiProblems.slice(0, 2).map((problem, index) => (
            <article key={problem.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-[Manrope] text-lg font-bold text-[#13243b]">{problem.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Accepted {index === 0 ? '22 Aug 2026' : '19 Aug 2026'} · Faculty assignment{' '}
                    {index === 0 ? 'Dr. Meera Nair' : 'Pending'}
                  </p>
                </div>
                <span className="rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-semibold text-[#187e8d]">
                  {index === 0 ? 'Capability Review' : 'Faculty Assignment Pending'}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>Status: {index === 0 ? 'Active Exploration' : 'Review Pending'}</span>
                <span>·</span>
                <span>Project conversion: {index === 0 ? 'Converted to Project' : 'Pending'}</span>
              </div>
              <Link to={`/hei/problems/${problem.id}`} className="mt-5 inline-flex text-sm font-semibold text-[#187e8d]">
                View details
              </Link>
            </article>
          ))}
        </div>
      </HEIPage>
    </HEILayout>
  )
}