import { useState } from 'react'
import {
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  Coins,
  Cpu,
  Download,
  GraduationCap,
  Plus,
  Quote,
  Timer,
  Users,
  X,
} from 'lucide-react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { PartnerImpactMetric } from '../../components/partner/PartnerImpactMetric'
import { SectionHeader } from '../../components/common/SectionHeader'
import {
  partnerImpactOverview,
  categoryContributionBreakdown,
  monthlyContributionActivity,
  beneficiaryTestimonials,
  partnerImpact as initialImpactRecords,
} from '../../data/partnerImpact'
import type { PartnerImpactRecord } from '../../types'

export function PartnerImpactPage() {
  const [impactRecords, setImpactRecords] = useState<PartnerImpactRecord[]>(initialImpactRecords)
  const [modalOpen, setModalOpen] = useState(false)
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  // Form State for Submit Impact Update
  const [formProject, setFormProject] = useState('')
  const [formType, setFormType] = useState('Technical Mentorship')
  const [formValue, setFormValue] = useState('')
  const [formBeneficiaries, setFormBeneficiaries] = useState(1000)
  const [formOutcome, setFormOutcome] = useState('')

  const handleDownloadReport = () => {
    setFeedbackNotice('Comprehensive CSR & Technical Impact Report (PDF) compiled and downloaded in mock session!')
    setTimeout(() => setFeedbackNotice(null), 5000)
  }

  const handleSaveImpactUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formProject.trim()) return

    const newRecord: PartnerImpactRecord = {
      id: `pi-${Date.now()}`,
      project: formProject,
      contributionType: formType,
      value: formValue,
      beneficiaries: Number(formBeneficiaries),
      outcome: formOutcome,
      status: 'Verified Impact',
    }

    setImpactRecords([newRecord, ...impactRecords])
    setModalOpen(false)
    setFeedbackNotice(`Impact record for "${formProject}" successfully logged.`)
    setTimeout(() => setFeedbackNotice(null), 5000)
  }

  return (
    <PartnerLayout title="Impact">
      <PartnerPage
        title="Impact"
        description="Quantify the social, technical, and geographic return of your organization's contributions."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Impact' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={14} />
              Log Impact Data
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
            >
              <Download size={14} />
              Download Impact Report
            </button>
          </div>
        }
      >
        <div className="space-y-8">
          {feedbackNotice && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {/* Hero Impact Score Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Award size={14} />
                  Tier-1 Platinum Social Impact Partner
                </span>
                <h2 className="font-[Manrope] text-2xl sm:text-3xl font-extrabold text-[#13243b]">
                  {partnerImpactOverview.totalBeneficiariesReached.toLocaleString()} Citizens Directly Impacted
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Across {partnerImpactOverview.communitiesSupported} habitations and {partnerImpactOverview.totalProjectsSupported} higher education institution research initiatives, your technical mentoring, hardware bundles, and grants have enabled verifiable community progress.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-[#e8f5f5]/80 p-5 border border-teal-200">
                <div className="text-center">
                  <p className="text-xs font-bold text-[#187e8d] uppercase tracking-wider">
                    Partner Impact Score
                  </p>
                  <p className="mt-1 font-[Manrope] text-4xl font-black text-[#13243b]">
                    {partnerImpactOverview.impactScore}
                    <span className="text-lg font-bold text-slate-400">/100</span>
                  </p>
                  <p className="text-[11px] font-semibold text-teal-700 mt-0.5">Top 5% Network Affinity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Impact Metrics - All 6 + supporting */}
          <section>
            <SectionHeader
              title="Verified Impact Metrics"
              description="Aggregate metrics audited against institution milestone submissions and citizen field surveys."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <PartnerImpactMetric
                label="Total Projects Supported"
                value={partnerImpactOverview.totalProjectsSupported}
                subtext="Academic & field co-innovations"
                icon={BarChart3}
                trend="+2 this year"
                color="teal"
              />
              <PartnerImpactMetric
                label="People Benefited"
                value={partnerImpactOverview.totalBeneficiariesReached.toLocaleString()}
                subtext="Direct rural & urban citizens"
                icon={Users}
                trend="+14k Q2 growth"
                color="purple"
              />
              <PartnerImpactMetric
                label="Communities Reached"
                value={partnerImpactOverview.communitiesSupported}
                subtext="Panchayats & municipal clusters"
                icon={Building2}
                trend="4 states active"
                color="amber"
              />
              <PartnerImpactMetric
                label="Resources Contributed"
                value={partnerImpactOverview.resourcesProvided}
                subtext="Hardware units, cloud & toolkits"
                icon={Cpu}
                color="teal"
              />
              <PartnerImpactMetric
                label="Universities Collaborated With"
                value={5}
                subtext="NITK, COEP, TISS, IIT Indore, Anna Univ"
                icon={GraduationCap}
                trend="Top-tier research HEIs"
                color="blue"
              />
              <PartnerImpactMetric
                label="Completed Projects"
                value={partnerImpactOverview.projectsCompleted}
                subtext="Audited & handed to civic bodies"
                icon={CheckCircle2}
                trend="100% completion rate"
                color="emerald"
              />
              <PartnerImpactMetric
                label="Funding Contributed"
                value={partnerImpactOverview.totalFundingContributed}
                subtext="Direct CSR & prototype grants"
                icon={Coins}
                trend="₹11.5L disbursed"
                color="emerald"
              />
              <PartnerImpactMetric
                label="Technical Hours"
                value={`${partnerImpactOverview.totalTechnicalHours} hrs`}
                subtext="Engineering & architecture mentorship"
                icon={Timer}
                trend="6 corporate mentors"
                color="blue"
              />
            </div>
          </section>

          {/* Monthly Contribution Activity & Simple Chart */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Monthly Contribution & Impact Growth Chart
                </h3>
                <p className="text-xs text-slate-500">
                  Visual distribution of engineering hours and disbursements across 2026.
                </p>
              </div>
              <span className="text-xs font-bold text-[#187e8d] bg-[#e8f5f5] px-3 py-1 rounded-full">
                2026 Fiscal Year
              </span>
            </div>

            {/* Interactive SVG Bar Chart Component */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/70 p-5">
              <div className="flex items-end justify-between gap-2 h-44 pt-6">
                {monthlyContributionActivity.map((m) => {
                  const maxHours = 90
                  const heightPercent = Math.round((m.hours / maxHours) * 100)
                  const isHovered = hoveredMonth === m.month

                  return (
                    <div
                      key={m.month}
                      onMouseEnter={() => setHoveredMonth(m.month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div
                        className={`mb-2 transition-all duration-200 text-center ${
                          isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
                        }`}
                      >
                        <span className="rounded bg-[#12365a] px-2 py-1 text-[10px] font-bold text-white shadow-md whitespace-nowrap">
                          {m.hours} hrs · ₹{(m.funding / 100000).toFixed(1)}L
                        </span>
                      </div>

                      {/* Bar with gradient */}
                      <div className="w-full max-w-[36px] bg-slate-200 rounded-t-lg overflow-hidden flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isHovered ? 'bg-[#12365a]' : 'bg-[#187e8d]'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span
                        className={`mt-2 text-[11px] font-bold ${
                          isHovered ? 'text-[#12365a]' : 'text-slate-500'
                        }`}
                      >
                        {m.month.slice(0, 3)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-slate-200/60 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-xs bg-[#187e8d]" />
                  <span>Technical Mentorship Hours (Max 90 hrs/mo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-xs bg-[#12365a]" />
                  <span>Active Sprint Hover Focus</span>
                </div>
              </div>
            </div>
          </section>

          {/* Category-wise Breakdown and Monthly Activity Table */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category-Wise Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Category-Wise Contribution Breakdown
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Resource allocation across civic problem themes
              </p>

              <div className="mt-5 space-y-4">
                {categoryContributionBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.category}</span>
                      <span className="font-semibold text-slate-500">{item.value} ({item.share}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#187e8d]"
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Contribution Breakdown List */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Monthly Contribution Records (2026)
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Disbursements and milestones achieved
              </p>

              <div className="mt-5 space-y-3.5">
                {monthlyContributionActivity.map((m) => (
                  <div key={m.month} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs">
                    <span className="font-bold text-slate-800 w-20">{m.month}</span>
                    <span className="text-slate-600 font-medium">
                      <strong>{m.hours} hrs</strong> mentorship
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      ₹{(m.funding / 100000).toFixed(1)}L grant
                    </span>
                    <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {m.milestones} milestones
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Supported Project Outcomes Table / List */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              Supported Project Outcomes History
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Verified ground-level accomplishments per initiative
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Project Name</th>
                    <th className="pb-3 font-bold">Contribution Details</th>
                    <th className="pb-3 font-bold">Beneficiaries</th>
                    <th className="pb-3 font-bold">Key Outcome</th>
                    <th className="pb-3 font-bold">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {impactRecords.map((rec: PartnerImpactRecord) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-800">{rec.project}</td>
                      <td className="py-3 text-slate-600">{rec.value}</td>
                      <td className="py-3 font-semibold text-slate-700">{rec.beneficiaries.toLocaleString()}</td>
                      <td className="py-3 text-slate-600 max-w-xs">{rec.outcome}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Beneficiary & Academic Feedback */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Beneficiary & Academic Partner Feedback
                </h3>
                <p className="text-xs text-slate-500">
                  Quotes from faculty leads, community representatives, and school heads
                </p>
              </div>
              <Quote size={24} className="text-[#187e8d] opacity-40" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {beneficiaryTestimonials.map((t) => (
                <div key={t.id} className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                  <p className="italic text-slate-700 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 border-t border-slate-200/60 pt-3">
                    <p className="font-bold text-slate-900">{t.author}</p>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                    <p className="mt-1 text-[10px] font-semibold text-[#187e8d]">
                      {t.project}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Impact Update Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Plus size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Log Impact Record
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add verified metrics to your organization profile.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveImpactUpdate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    placeholder="e.g. Solar Water Monitoring Pilot"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Contribution Type</label>
                    <input
                      type="text"
                      required
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      placeholder="e.g. Equipment & Mentorship"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700">Value / Hours</label>
                    <input
                      type="text"
                      required
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="e.g. ₹2.5L + 40 hrs"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Estimated Beneficiaries</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formBeneficiaries}
                    onChange={(e) => setFormBeneficiaries(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Measurable Outcome</label>
                  <textarea
                    rows={3}
                    required
                    value={formOutcome}
                    onChange={(e) => setFormOutcome(e.target.value)}
                    placeholder="Describe specific community improvements or data results..."
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PartnerPage>
    </PartnerLayout>
  )
}