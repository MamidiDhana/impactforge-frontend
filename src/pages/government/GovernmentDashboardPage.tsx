import { AlertTriangle, BarChart3, ClipboardCheck, FileSearch, FolderKanban, ShieldCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GovernmentLayout } from '../../layouts/GovernmentLayout'
import { GovPage } from './GovernmentShared'
import { StatCard } from '../../components/common/StatCard'
import { DashboardWelcome } from '../../components/dashboard/DashboardWelcome'
import { SectionHeader } from '../../components/common/SectionHeader'
import { useProblems } from '../../context/ProblemContext'

const statusSummary = [{ label: 'Submitted', value: 14, color: 'bg-indigo-500' }, { label: 'Under Review', value: 12, color: 'bg-sky-500' }, { label: 'Validated', value: 24, color: 'bg-emerald-500' }, { label: 'Rejected', value: 4, color: 'bg-red-500' }, { label: 'Redirected', value: 3, color: 'bg-violet-500' }, { label: 'Converted to Project', value: 7, color: 'bg-teal-500' }]

export function GovernmentDashboardPage() {
  const navigate = useNavigate()
  const { problems } = useProblems()

  return (
    <GovernmentLayout title="Government">
      <GovPage
        title="Government"
        description="Review, validate, and monitor Jharkhand problems"
        breadcrumbs={[{ label: 'Government' }]}
      >
        <div className="space-y-8">
          <DashboardWelcome
            name="Operations Overview"
            description="Review community challenges from Ranchi, Jamshedpur, Dhanbad, and all Jharkhand districts. Validate genuine problems and assign Track IDs for HEI matching."
            action={
              <button
                type="button"
                onClick={() => navigate('/government/problem-queue')}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-[#12365a]"
              >
                Review pending problems
              </button>
            }
          />
          <section>
            <SectionHeader title="Summary overview" description="Jharkhand State Innovation Desk." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total submissions" value="64" description="Across 24 districts" icon={FileSearch} />
              <StatCard label="Pending validation" value="12" description="Awaiting officer review" icon={ClipboardCheck} />
              <StatCard label="Validated problems" value="24" description="Approved for HEI matching" icon={ShieldCheck} />
              <StatCard label="Rejected or redirected" value="7" description="Outside criteria" icon={AlertTriangle} />
              <StatCard label="Active projects" value="14" description="BIT Mesra / NIT Jamshedpur" icon={FolderKanban} />
              <StatCard label="Completed projects" value="2" description="Deployed solutions" icon={BarChart3} />
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionHeader title="Problem status overview" description="Current state distribution." />
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="space-y-4">
                  {statusSummary.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.label}</span>
                        <strong className="text-[#13243b]">{item.value}</strong>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / 64) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <SectionHeader title="Impact snapshot" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl border border-[#b8dfe0] bg-[#e8f5f5] p-4">
                  <Users className="text-[#187e8d]" size={19} />
                  <p className="mt-3 text-xs uppercase text-slate-500">Panchayats & Towns Reached</p>
                  <p className="mt-1 font-[Manrope] text-2xl font-bold text-[#13243b]">28</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase text-slate-500">Jharkhand Citizens Benefited</p>
                  <p className="mt-1 font-[Manrope] text-2xl font-bold text-[#13243b]">31,400</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase text-slate-500">Problems resolved</p>
                  <p className="mt-1 font-[Manrope] text-2xl font-bold text-[#13243b]">9</p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <SectionHeader title="Recent problem submissions" actionText="Open queue" onAction={() => navigate('/government/problem-queue')} />
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="p-4">Track ID</th>
                    <th className="p-4">Problem</th>
                    <th className="p-4">Jharkhand Location</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.slice(0, 4).map((problem) => (
                    <tr key={problem.id} className="border-b border-slate-100 last:border-0">
                      <td className="p-4 font-mono text-xs font-bold text-[#12365a]">{problem.trackId}</td>
                      <td className="p-4 font-semibold text-slate-700">{problem.title}</td>
                      <td className="p-4 text-slate-500">{problem.district ? `${problem.district}, Jharkhand` : problem.location}</td>
                      <td className="p-4 text-slate-500">{problem.category}</td>
                      <td className="p-4">
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{problem.urgency || 'Medium'}</span>
                      </td>
                      <td className="p-4 text-slate-500">{problem.status}</td>
                      <td className="p-4">
                        <button type="button" onClick={() => navigate(`/government/problems/${problem.id}/review`)} className="font-semibold text-[#187e8d] hover:underline">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <SectionHeader title="Pending review" />
              <div className="grid gap-3">
                {problems.slice(0, 3).map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#12365a]">{problem.trackId}</span>
                        <span className="text-slate-300">•</span>
                        <h3 className="font-semibold text-[#13243b]">{problem.title}</h3>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{problem.district}, Jharkhand · Submitted {problem.submittedAt}</p>
                    </div>
                    <button type="button" onClick={() => navigate(`/government/problems/${problem.id}/review`)} className="text-sm font-semibold text-[#187e8d]">
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <SectionHeader title="Recent activity" />
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <ul className="space-y-4 text-sm text-slate-600">
                  {['Problem validated in Ramgarh', 'More information requested for Latehar sub-centre', 'Problem redirected to Water Resources Dept', 'BIT Mesra matched with Arsenic filtration challenge', 'Gumla cold storage project milestone verified'].map((item, index) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1.5 size-2 rounded-full bg-[#1c91a1]" />
                      {item}
                      <span className="ml-auto text-xs text-slate-400">{index + 1}h ago</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
          <section>
            <SectionHeader title="Jharkhand District Alerts" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Ramgarh: High-urgency groundwater contamination challenge requires review',
                'Latehar: 2 remote healthcare connectivity submissions awaiting validation',
                'Dumka: Education bilingual learning project ready for field milestone inspection',
                'Gumla: Cold storage prototype proposal submitted by NIT Jamshedpur',
              ].map((alert) => (
                <div key={alert} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle size={17} className="shrink-0" />
                  {alert}
                </div>
              ))}
            </div>
          </section>
        </div>
      </GovPage>
    </GovernmentLayout>
  )
}
