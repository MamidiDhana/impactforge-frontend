import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  FileSearch,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { ProjectRecommendationCard } from '../../components/partner/ProjectRecommendationCard'
import { ExpressInterestModal } from '../../components/partner/ExpressInterestModal'
import { EmptyState } from '../../components/common/EmptyState'
import { partnerProjects as initialProjects } from '../../data/partnerProjects'
import type { PartnerProject, PartnerCollaborationRequest } from '../../types'

export function RecommendedProjectsPage() {
  const [projects] = useState<PartnerProject[]>(initialProjects)

  // Filters state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [location, setLocation] = useState('All')
  const [stage, setStage] = useState('All')
  const [capability, setCapability] = useState('All')
  const [matchThreshold, setMatchThreshold] = useState('All')
  const [sortBy, setSortBy] = useState<'match' | 'progress' | 'beneficiaries' | 'title'>('match')

  // Modal and feedback state
  const [selectedProject, setSelectedProject] = useState<PartnerProject | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null)

  // Extract unique filter choices
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.category)))], [projects])
  const locations = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.location.split(',')[1]?.trim() || p.location)))], [projects])
  const stages = useMemo(() => ['All', ...Array.from(new Set(projects.map((p) => p.stage)))], [projects])
  const capabilities = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.requiredSupport.forEach((s) => set.add(s)))
    return ['All', ...Array.from(set)]
  }, [projects])

  // Filtered and sorted results
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesSearch =
          search === '' ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()) ||
          p.problemTitle.toLowerCase().includes(search.toLowerCase()) ||
          p.university.toLowerCase().includes(search.toLowerCase())

        const matchesCategory = category === 'All' || p.category === category
        const matchesLocation = location === 'All' || p.location.includes(location)
        const matchesStage = stage === 'All' || p.stage === stage
        const matchesCapability = capability === 'All' || p.requiredSupport.includes(capability)

        let matchesScore = true
        if (matchThreshold === '90+') matchesScore = p.match >= 90
        else if (matchThreshold === '80+') matchesScore = p.match >= 80
        else if (matchThreshold === '70+') matchesScore = p.match >= 70

        return matchesSearch && matchesCategory && matchesLocation && matchesStage && matchesCapability && matchesScore
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.match - a.match
        if (sortBy === 'progress') return b.progress - a.progress
        if (sortBy === 'beneficiaries') return b.beneficiaries - a.beneficiaries
        if (sortBy === 'title') return a.title.localeCompare(b.title)
        return 0
      })
  }, [projects, search, category, location, stage, capability, matchThreshold, sortBy])

  const handleResetFilters = () => {
    setSearch('')
    setCategory('All')
    setLocation('All')
    setStage('All')
    setCapability('All')
    setMatchThreshold('All')
    setSortBy('match')
  }

  const handleExpressInterest = (project: PartnerProject) => {
    setSelectedProject(project)
    setModalOpen(true)
  }

  const handleInterestSubmitted = (req: PartnerCollaborationRequest) => {
    setSuccessFeedback(
      `Your interest in "${req.projectTitle}" has been logged as Pending Review. Faculty lead: ${req.facultyLead}.`
    )
    setTimeout(() => setSuccessFeedback(null), 6000)
  }

  return (
    <PartnerLayout title="Matches">
      <PartnerPage
        title="Matches"
        description="Browse validated university projects aligned with your organization's resources."
        breadcrumbs={[
          { label: 'Industry Partnerships', href: '/partner/dashboard' },
          { label: 'Matches' },
        ]}
      >
        <div className="space-y-6">
          {/* AI Notice Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-[#e8f5f5]/80 p-4 text-xs text-slate-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-teal-100 text-[#187e8d]">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="font-bold text-[#13243b]">AI-Assisted Partner Recommendation Engine</p>
                <p className="text-slate-600">
                  Matches are calculated based on your profile capabilities and required project gaps. Final participation decision belongs entirely to the partner.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-teal-300 bg-white px-3 py-1 text-[11px] font-semibold text-[#187e8d]">
              Live Affinity Algorithm
            </span>
          </div>

          {successFeedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successFeedback}</span>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            {/* Top row: Search input + sort */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects by title, community problem, university, or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="match">Highest Match %</option>
                  <option value="progress">Highest Progress %</option>
                  <option value="beneficiaries">Most Beneficiaries</option>
                  <option value="title">Project Title (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 pt-2 border-t border-slate-100">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Location / State</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Stage */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                >
                  {stages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Capability */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Required Support</label>
                <select
                  value={capability}
                  onChange={(e) => setCapability(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                >
                  {capabilities.map((cap) => (
                    <option key={cap} value={cap}>
                      {cap}
                    </option>
                  ))}
                </select>
              </div>

              {/* Match Percentage Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">AI Match %</label>
                <select
                  value={matchThreshold}
                  onChange={(e) => setMatchThreshold(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                >
                  <option value="All">All Match Scores</option>
                  <option value="90+">90% & Above</option>
                  <option value="80+">80% & Above</option>
                  <option value="70+">70% & Above</option>
                </select>
              </div>
            </div>

            {/* Results count & reset */}
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>
                Showing <strong>{filteredProjects.length}</strong> of {projects.length} recommended projects
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 font-semibold text-[#187e8d] hover:underline"
              >
                <RotateCcw size={12} />
                Reset all filters
              </button>
            </div>
          </div>

          {/* Project Cards Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectRecommendationCard
                  key={project.id}
                  project={project}
                  onExpressInterest={handleExpressInterest}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileSearch}
              title="No projects match your filters"
              action={
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                >
                  <Filter size={14} />
                  Clear Filters & Show All
                </button>
              }
            />
          )}
        </div>

        {/* Express Interest Modal */}
        <ExpressInterestModal
          open={modalOpen}
          project={selectedProject}
          onClose={() => {
            setModalOpen(false)
            setSelectedProject(null)
          }}
          onSubmit={handleInterestSubmitted}
        />
      </PartnerPage>
    </PartnerLayout>
  )
}