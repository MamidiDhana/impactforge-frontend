import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { publicProblems } from '../../data/publicProblems'
import { PublicLayout } from '../../layouts/PublicLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { SectionHeader } from '../../components/common/SectionHeader'
import { StatCard } from '../../components/common/StatCard'
import { ProblemCard } from '../../components/problems/ProblemCard'

const workflowStages = [
  {
    step: '01',
    title: 'Community Problem Submission',
    shortDesc: 'Citizens submit real challenges',
    description:
      'Lived-experience problems are documented by citizens and grassroots communities with geo-location, urgency metrics, and evidence.',
    icon: Search,
    tag: 'Grassroots Intake',
    color: 'text-teal-700 bg-teal-50 border-teal-200',
  },
  {
    step: '02',
    title: 'AI Similarity Detection',
    shortDesc: 'Vector clustering & deduplication',
    description:
      'Natural language models cluster duplicates, group common geographic challenges, and prevent redundant effort across districts.',
    icon: Bot,
    tag: 'Milvus & Embeddings',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  {
    step: '03',
    title: 'Government Validation',
    shortDesc: 'Official priority & compliance',
    description:
      'District innovation officers and government validators verify ground reality, compliance, and grant administrative authorization.',
    icon: ShieldCheck,
    tag: 'Civic Priority',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    step: '04',
    title: 'HEI / University Matching',
    shortDesc: 'Academic R&D assignment',
    description:
      'Semantic scoring automatically maps validated challenges to accredited university research labs, engineering faculty, and student teams.',
    icon: GraduationCap,
    tag: 'Academic Rigor',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    step: '05',
    title: 'Capability-Gap Analysis',
    shortDesc: 'Identify missing skills & equipment',
    description:
      'Automated gap analysis pinpoints deficit skills, lab machinery needs, or funding deficits before project execution commences.',
    icon: Target,
    tag: 'De-Risking',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    step: '06',
    title: 'Partner Collaboration',
    shortDesc: 'Industry & CSR sponsorship',
    description:
      'Industry partners, MSMEs, and CSR trusts step in with mentorship, specialized hardware, field testing, and funding support.',
    icon: Handshake,
    tag: 'Tripartite Bridge',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    step: '07',
    title: 'Project Impact Tracking',
    shortDesc: 'Milestones & beneficiary metrics',
    description:
      'Field deliverables, verified milestones, citizen beneficiary counts, and continuous feedback loop ensure lasting community change.',
    icon: HeartHandshake,
    tag: 'Verified Outcomes',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
]

const portalGateways = [
  {
    title: 'Citizen Portal',
    role: 'citizen',
    description: 'Submit neighborhood challenges, monitor verification, and provide feedback.',
    href: '/citizen/dashboard',
    icon: Users,
    badge: 'Civic Voices',
  },
  {
    title: 'Government Portal',
    role: 'government',
    description: 'Validate incoming issues, review duplicate clusters, and match university labs.',
    href: '/government/dashboard',
    icon: ShieldCheck,
    badge: 'District Officers',
  },
  {
    title: 'HEI & University Portal',
    role: 'hei',
    description: 'Accept real-world challenges, assign faculty leads, and form student engineering teams.',
    href: '/hei/dashboard',
    icon: GraduationCap,
    badge: 'Higher Education',
  },
  {
    title: 'Faculty Workspace',
    role: 'faculty',
    description: 'Track milestones, resolve capability gaps, submit deliverables, and deploy solutions.',
    href: '/faculty/dashboard',
    icon: Lightbulb,
    badge: 'Project Workspace',
  },
  {
    title: 'Industry & CSR Partner Portal',
    role: 'partner',
    description: 'Discover high-impact university projects, pledge CSR funds, and offer domain mentorship.',
    href: '/partner/dashboard',
    icon: Handshake,
    badge: 'CSR & Enterprise',
  },
  {
    title: 'Super Admin Console',
    role: 'admin',
    description: 'Manage platform taxonomy, supervise RBAC permissions, and monitor AI model pipelines.',
    href: '/admin/dashboard',
    icon: Cpu,
    badge: 'Ecosystem Control',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <PageContainer className="relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div
            className="absolute -right-32 top-0 size-80 rounded-full bg-[#d9eeee]/60 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5f5] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#187e8d]">
              <Sparkles size={14} /> National Civic Innovation Ecosystem
            </span>

            <h1 className="mt-6 max-w-2xl font-[Manrope] text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-[#13243b] sm:text-5xl lg:text-6xl">
              Turning Community Problems Into <span className="text-[#187e8d]">Measurable Impact</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              ImpactForge bridges citizens, local governments, accredited universities, and CSR partners through AI-driven challenge matching, capability-gap analysis, and verified field project delivery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/problems"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#12365a] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#0e2b48]"
              >
                Explore Validated Problems <ArrowRight size={17} />
              </Link>
              <Link
                to="/citizen/submit-problem"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#12365a] hover:bg-slate-50"
              >
                Submit a Community Problem
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
              <div>
                <p className="font-[Manrope] text-2xl font-bold text-[#13243b]">1,200+</p>
                <p className="text-xs text-slate-500 font-medium">Grassroots Issues</p>
              </div>
              <div>
                <p className="font-[Manrope] text-2xl font-bold text-[#187e8d]">184</p>
                <p className="text-xs text-slate-500 font-medium">HEIs & Research Labs</p>
              </div>
              <div>
                <p className="font-[Manrope] text-2xl font-bold text-emerald-600">340+</p>
                <p className="text-xs text-slate-500 font-medium">Field Projects Active</p>
              </div>
            </div>
          </div>

          {/* Interactive Ecosystem Visual */}
          <div className="relative rounded-2xl border border-slate-200 bg-[#f7f9fc] p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              <span>The ImpactForge Pipeline</span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Architecture
              </span>
            </div>

            <div className="my-6 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-white p-3.5 shadow-xs">
                <span className="grid size-10 place-items-center rounded-lg bg-teal-50 text-teal-700 shrink-0">
                  <Search size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#13243b]">1. Citizen Intake</p>
                    <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                      Grievance Received
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Arsenic groundwater contamination in Ballia district
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-white p-3.5 shadow-xs">
                <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700 shrink-0">
                  <Bot size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#13243b]">2. AI Similarity & Gap Engine</p>
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                      94% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Vector cluster formed; capability gap: Spectrophotometry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs">
                <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700 shrink-0">
                  <GraduationCap size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#13243b]">3. HEI Assignment</p>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                      NIT Karnataka
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Chemical Engineering faculty + 6 student researchers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-xs">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-emerald-700 shrink-0 shadow-xs">
                  <Target size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-emerald-950">4. Field Implementation</p>
                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      14,200 Beneficiaries
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 truncate">
                    Nano-membrane pilot running; water quality alerts active
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Audited by District Administration
              </span>
              <Link to="/how-it-works" className="font-bold text-[#187e8d] hover:text-[#12365a]">
                Learn methodology →
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. Complete 7-Stage Architecture Walkthrough */}
      <PageContainer>
        <section className="py-16 sm:py-20 border-b border-slate-200">
          <SectionHeader
            title="The ImpactForge Engine: From Signal to Sustained Impact"
            description="Our closed-loop system replaces isolated complaints with structured, multi-stakeholder problem solving."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workflowStages.map((stage) => {
              const Icon = stage.icon
              return (
                <div
                  key={stage.step}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[Manrope] text-sm font-extrabold text-[#187e8d]">
                      STAGE {stage.step}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${stage.color}`}>
                      {stage.tag}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-[#12365a]">
                      <Icon size={18} />
                    </span>
                    <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      {stage.title}
                    </h3>
                  </div>

                  <p className="mt-3 flex-1 text-xs leading-5 text-slate-600">
                    {stage.description}
                  </p>
                </div>
              )
            })}

            {/* Quick Summary Card */}
            <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#12365a] to-[#1a4a7a] p-6 text-white shadow-md">
              <div>
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  Continuous Feedback
                </span>
                <h3 className="mt-3 font-[Manrope] text-lg font-bold">
                  Zero Lost Challenges
                </h3>
                <p className="mt-2 text-xs leading-5 text-blue-100">
                  Every submitted grievance is indexed in vector storage, mapped to capability taxonomies, and monitored through deployment milestones.
                </p>
              </div>

              <Link
                to="/register"
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#12365a] hover:bg-blue-50"
              >
                Join the Network <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Role-Based Portals Access Grid */}
        <section className="py-16 sm:py-20 border-b border-slate-200">
          <SectionHeader
            title="Multi-Stakeholder Portals"
            description="Explore dedicated environments tailored for every civic actor."
            actionText="Access Demo Logins"
            onAction={() => navigate('/login')}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portalGateways.map((portal) => {
              const Icon = portal.icon
              return (
                <div
                  key={portal.title}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#187e8d] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="mt-4 font-[Manrope] text-lg font-bold text-[#13243b]">
                    {portal.title}
                  </h3>

                  <p className="mt-2 flex-1 text-xs leading-5 text-slate-500">
                    {portal.description}
                  </p>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={portal.href}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#12365a] hover:text-[#187e8d]"
                    >
                      Open Portal <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/login"
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-600"
                    >
                      Sign in as {portal.role}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 4. Featured Approved Problems */}
        <section className="py-16 sm:py-20 border-b border-slate-200">
          <SectionHeader
            title="Validated Community Challenges"
            description="Active civic problems verified by authorities and awaiting university research teams or industry partners."
            actionText="View all problems"
            onAction={() => navigate('/problems')}
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {publicProblems.slice(0, 6).map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                detailsHref={`/problems/${problem.id}`}
              />
            ))}
          </div>
        </section>

        {/* 5. Platform Telemetry Metrics */}
        <section className="py-16 sm:py-20 border-b border-slate-200">
          <SectionHeader
            title="Measurable Impact Across Ecosystems"
            description="Real-time telemetry showing challenges addressed, collaborative agreements, and verified community outcomes."
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Community Challenges"
              value="1,248"
              trend="+89"
              trendDirection="up"
              description="Submitted this quarter"
              icon={Users}
            />
            <StatCard
              label="Accredited HEIs"
              value="184"
              trend="+18"
              trendDirection="up"
              description="Universities & IITs/NITs"
              icon={Building2}
            />
            <StatCard
              label="Active Collaborations"
              value="412"
              trend="+32"
              trendDirection="up"
              description="HEI + Partner teams"
              icon={Handshake}
            />
            <StatCard
              label="Projects in Progress"
              value="342"
              trend="94.2%"
              trendDirection="up"
              description="On-track milestones"
              icon={Workflow}
            />
          </div>
        </section>

        {/* 6. Call to Action Banner */}
        <section className="my-16 rounded-3xl bg-[#12365a] px-6 py-14 text-center sm:px-12 shadow-xl">
          <h2 className="font-[Manrope] text-3xl font-extrabold text-white sm:text-4xl">
            Have a community challenge that needs solving?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Bring your lived experience to light, find expert faculty mentors, access CSR grants, and build verified solutions that transform neighborhoods.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/citizen/submit-problem"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-[#12365a] hover:bg-blue-50 shadow-md"
            >
              Submit a Problem
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10"
            >
              Join the Platform
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-400/30 px-6 py-3.5 text-sm font-bold hover:bg-teal-500/30"
            >
              Try Demo Logins
            </Link>
          </div>
        </section>
      </PageContainer>
    </PublicLayout>
  )
}