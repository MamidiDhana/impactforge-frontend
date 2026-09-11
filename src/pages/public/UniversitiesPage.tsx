import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Search,
  X,
  Mail,
  FlaskConical,
  Wrench,
  Cpu,
  Layers,
  Award,
  ArrowRight,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { universities as defaultUniversities } from '../../data/universities'
import type { University } from '../../types'
import { PublicLayout } from '../../layouts/PublicLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { EmptyState } from '../../components/common/EmptyState'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'

interface BackendHEIRecord {
  hei_id: string
  name: string
  district: string
  state: string
  institution_type: string
  departments?: string[]
  available_skills?: string[]
  technical_domains?: string[]
  laboratories?: string[]
  equipment?: string[]
  software_tools?: string[]
  project_experience?: {
    completed_civic_projects?: number
    active_projects?: number
    complexity_level?: string
    [key: string]: unknown
  }
  available_faculty_capacity?: number
  verification_status?: string
  contact_email?: string | null
}

export function UniversitiesPage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [capability, setCapability] = useState('All capabilities')
  const [universityList, setUniversityList] = useState<University[]>(defaultUniversities)
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)

  // Fetch real HEI registry records from existing backend database
  useEffect(() => {
    let isMounted = true
    const fetchRegistry = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000'
        const res = await fetch(`${apiBase}/api/reports/heis/registry`)
        if (!res.ok) return

        const backendHEIs: BackendHEIRecord[] = await res.json()
        if (!Array.isArray(backendHEIs) || backendHEIs.length === 0 || !isMounted) return

        // Merge live database records with default directory to ensure full capability coverage
        const backendMap = new Map(backendHEIs.map((h) => [h.hei_id, h]))

        const merged: University[] = defaultUniversities.map((uni) => {
          const live = backendMap.get(uni.id) || backendMap.get(uni.hei_id || '')
          if (!live) return uni

          const liveLoc = `${live.district}, ${live.state}`
          return {
            ...uni,
            id: live.hei_id,
            hei_id: live.hei_id,
            name: live.name,
            location: liveLoc,
            district: live.district,
            state: live.state,
            institution_type: live.institution_type,
            departments: live.departments && live.departments.length > 0 ? live.departments : uni.departments,
            available_skills: live.available_skills && live.available_skills.length > 0 ? live.available_skills : uni.available_skills,
            technical_domains: live.technical_domains && live.technical_domains.length > 0 ? live.technical_domains : uni.technical_domains,
            laboratories: live.laboratories && live.laboratories.length > 0 ? live.laboratories : uni.laboratories,
            equipment: live.equipment && live.equipment.length > 0 ? live.equipment : uni.equipment,
            software_tools: live.software_tools && live.software_tools.length > 0 ? live.software_tools : uni.software_tools,
            project_experience: live.project_experience || uni.project_experience,
            facultyCount: live.available_faculty_capacity ?? uni.facultyCount,
            available_faculty_capacity: live.available_faculty_capacity ?? uni.facultyCount,
            activeProjects: live.project_experience?.active_projects ?? uni.activeProjects,
            verified: live.verification_status === 'verified' || uni.verified,
            verification_status: live.verification_status || (uni.verified ? 'verified' : 'unverified'),
            contact_email: live.contact_email || uni.contact_email,
          }
        })

        // Also add any backend HEIs that might not be in the initial default list
        backendHEIs.forEach((live) => {
          if (!merged.some((m) => m.id === live.hei_id || m.hei_id === live.hei_id)) {
            const liveLoc = `${live.district}, ${live.state}`
            const caps = [
              ...(live.technical_domains || []),
              ...(live.available_skills || []).slice(0, 3),
            ].map((c) => c.charAt(0).toUpperCase() + c.slice(1))

            merged.push({
              id: live.hei_id,
              hei_id: live.hei_id,
              name: live.name,
              location: liveLoc,
              district: live.district,
              state: live.state,
              institution_type: live.institution_type,
              description: `Accredited ${live.institution_type} specializing in ${live.technical_domains?.slice(0, 2).join(' and ') || 'civic innovation'} with ${live.available_faculty_capacity || 20} faculty researchers.`,
              capabilities: caps.length > 0 ? caps.slice(0, 4) : ['Engineering', 'Data analytics'],
              departments: live.departments || [],
              available_skills: live.available_skills || [],
              technical_domains: live.technical_domains || [],
              laboratories: live.laboratories || [],
              equipment: live.equipment || [],
              software_tools: live.software_tools || [],
              project_experience: live.project_experience || {
                completed_civic_projects: 10,
                active_projects: 4,
                complexity_level: 'medium',
              },
              facultyCount: live.available_faculty_capacity || 25,
              available_faculty_capacity: live.available_faculty_capacity || 25,
              activeProjects: live.project_experience?.active_projects || 4,
              verified: live.verification_status === 'verified',
              verification_status: live.verification_status || 'unverified',
              contact_email: live.contact_email || null,
            })
          }
        })

        setUniversityList(merged)
      } catch {
        // Retain default directory if API endpoint is temporarily unreachable
      }
    }

    fetchRegistry()
    return () => {
      isMounted = false
    }
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedUniversity) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedUniversity])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUniversity(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Distinct locations from university directory
  const locations = useMemo(() => {
    const locSet = new Set<string>()
    universityList.forEach((item) => {
      if (item.location) {
        locSet.add(item.location)
      }
    })
    return ['All locations', ...Array.from(locSet).sort()]
  }, [universityList])

  // Distinct capabilities from university directory
  const capabilities = useMemo(() => {
    const capSet = new Set<string>()
    universityList.forEach((item) => {
      item.capabilities.forEach((c) => capSet.add(c))
    })
    return ['All capabilities', ...Array.from(capSet).sort()]
  }, [universityList])

  // Filter universities by search, location, and capability
  const results = useMemo(() => {
    return universityList.filter((item) => {
      const fullSearchText = `${item.name} ${item.description} ${item.location} ${item.capabilities.join(' ')} ${item.departments?.join(' ') || ''} ${item.available_skills?.join(' ') || ''}`.toLowerCase()
      const matchesSearch = search.trim() === '' || fullSearchText.includes(search.toLowerCase())

      const matchesLocation =
        location === 'All locations' ||
        item.location === location ||
        item.location.endsWith(location) ||
        item.location.toLowerCase().includes(location.toLowerCase())

      const matchesCapability =
        capability === 'All capabilities' ||
        item.capabilities.some((c) => c.toLowerCase() === capability.toLowerCase()) ||
        item.technical_domains?.some((td) => td.toLowerCase() === capability.toLowerCase()) ||
        item.available_skills?.some((s) => s.toLowerCase() === capability.toLowerCase())

      return matchesSearch && matchesLocation && matchesCapability
    })
  }, [capability, location, search, universityList])

  return (
    <PublicLayout>
      <PageContainer>
        <PageHeader
          title="Universities and HEIs"
          description="Find academic communities with the capabilities, people, and curiosity to work on public challenges."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Universities' }]}
        />

        {/* Filter & Search Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row md:items-center">
          <div className="min-w-56 flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search universities by name, department, or capability"
            />
          </div>
          <FilterSelect
            label="Location"
            value={location}
            options={locations}
            onChange={setLocation}
          />
          <FilterSelect
            label="Capability"
            value={capability}
            options={capabilities}
            onChange={setCapability}
          />
        </div>

        {/* Directory Counter */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            {results.length} {results.length === 1 ? 'university' : 'universities'} in the public directory
          </p>
          {location !== 'All locations' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#187e8d] border border-teal-200">
              <MapPin size={12} /> {location}
            </span>
          )}
        </div>

        {/* Directory Grid */}
        {results.length ? (
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {results.map((university) => (
              <ResponsiveCard
                key={university.id}
                className="group flex h-full flex-col cursor-pointer transition-all duration-200 hover:border-[#187e8d] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#187e8d]/50"
                onClick={() => setSelectedUniversity(university)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d] group-hover:bg-[#187e8d] group-hover:text-white transition-colors">
                    <GraduationCap size={21} />
                  </span>
                  <div className="flex items-center gap-2">
                    {university.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} />
                        Verified
                      </span>
                    )}
                    {university.institution_type && (
                      <span className="hidden sm:inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {university.institution_type}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="mt-5 font-[Manrope] text-lg font-bold text-[#13243b] group-hover:text-[#187e8d] transition-colors">
                  {university.name}
                </h2>

                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MapPin size={14} className="text-[#187e8d]" />
                  {university.location}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
                  {university.description}
                </p>

                {/* Capabilities pills */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {university.capabilities.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Card metrics */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-[#187e8d]" />
                    {university.facultyCount} faculty researchers
                  </span>
                  <span className="flex items-center gap-2">
                    <Building2 size={14} className="text-[#187e8d]" />
                    {university.activeProjects} active projects
                  </span>
                </div>

                {/* Action button */}
                <div className="mt-5 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedUniversity(university)
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-[#12365a] px-4 py-2.5 text-sm font-semibold text-[#12365a] group-hover:bg-[#12365a] group-hover:text-white transition-all shadow-xs"
                  >
                    View profile <ArrowRight size={14} />
                  </button>
                </div>
              </ResponsiveCard>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={Search}
              title="No universities found"
              description="Try a different search keyword, location, or capability filter."
            />
          </div>
        )}

        {/* University Profile Details Modal */}
        {selectedUniversity && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setSelectedUniversity(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="university-modal-title"
          >
            <div
              className="relative my-8 w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl transition-all border border-slate-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedUniversity(null)}
                aria-label="Close profile"
                className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 pr-10">
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-[#e8f5f5] text-[#187e8d]">
                  <GraduationCap size={28} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedUniversity.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} />
                        Verified HEI
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        <ShieldCheck size={13} />
                        Accredited HEI
                      </span>
                    )}
                    {selectedUniversity.institution_type && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#12365a] border border-blue-200">
                        {selectedUniversity.institution_type}
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500">
                      ID: {selectedUniversity.hei_id || selectedUniversity.id}
                    </span>
                  </div>

                  <h2
                    id="university-modal-title"
                    className="mt-2 font-[Manrope] text-xl sm:text-2xl font-bold text-[#13243b]"
                  >
                    {selectedUniversity.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <MapPin size={15} className="text-[#187e8d]" />
                    {selectedUniversity.location}
                  </p>
                </div>
              </div>

              {/* Key Metrics Strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100 text-center">
                <div className="p-2">
                  <p className="text-2xl font-extrabold text-[#12365a] font-[Manrope]">
                    {selectedUniversity.facultyCount}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Faculty Researchers</p>
                </div>
                <div className="p-2">
                  <p className="text-2xl font-extrabold text-[#187e8d] font-[Manrope]">
                    {selectedUniversity.activeProjects}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Active Projects</p>
                </div>
                <div className="p-2">
                  <p className="text-2xl font-extrabold text-indigo-700 font-[Manrope]">
                    {selectedUniversity.project_experience?.completed_civic_projects ?? 15}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">Completed Projects</p>
                </div>
                <div className="p-2">
                  <p className="text-2xl font-extrabold text-amber-700 font-[Manrope] capitalize">
                    {selectedUniversity.project_experience?.complexity_level ?? 'High'}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">R&D Complexity</p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Institutional Profile & Public Mission
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedUniversity.description}
                </p>
              </div>

              {/* Capabilities & Domains */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Layers size={15} className="text-[#187e8d]" /> Core Technical Domains & Focus Areas
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedUniversity.technical_domains && selectedUniversity.technical_domains.length > 0
                    ? selectedUniversity.technical_domains
                    : selectedUniversity.capabilities
                  ).map((domain) => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#187e8d] border border-teal-200 capitalize"
                    >
                      <Award size={13} />
                      {domain}
                    </span>
                  ))}
                </div>
              </div>

              {/* Faculty Expertise & Departments */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <GraduationCap size={15} className="text-[#187e8d]" /> Faculty Expertise & Departments
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedUniversity.departments && selectedUniversity.departments.length > 0 ? (
                    selectedUniversity.departments.map((dept) => (
                      <span
                        key={dept}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                      >
                        {dept}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">
                      Multi-disciplinary faculty across engineering, applied sciences, and civic development.
                    </p>
                  )}
                </div>

                {/* Available Skills */}
                {selectedUniversity.available_skills && selectedUniversity.available_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-500">Key Competencies & Applied Skills:</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedUniversity.available_skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 capitalize"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Institutional Resources */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <FlaskConical size={15} className="text-[#187e8d]" /> Institutional Resources & Lab Facilities
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {/* Laboratories */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#13243b]">
                      <FlaskConical size={14} className="text-emerald-600" /> Research Laboratories
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {selectedUniversity.laboratories && selectedUniversity.laboratories.length > 0 ? (
                        selectedUniversity.laboratories.map((lab) => (
                          <li key={lab} className="flex items-start gap-1.5">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{lab}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">Advanced testing and prototyping laboratories</li>
                      )}
                    </ul>
                  </div>

                  {/* Equipment & Software */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#13243b]">
                      <Wrench size={14} className="text-amber-600" /> Specialized Equipment & Tools
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                      {selectedUniversity.equipment && selectedUniversity.equipment.length > 0 ? (
                        selectedUniversity.equipment.slice(0, 4).map((eq) => (
                          <li key={eq} className="flex items-start gap-1.5">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-500" />
                            <span>{eq}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-400">Field survey telemetry and analytical equipment</li>
                      )}
                    </ul>

                    {selectedUniversity.software_tools && selectedUniversity.software_tools.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                        <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                          <Cpu size={12} className="text-indigo-600" /> Modeling Software:
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {selectedUniversity.software_tools.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Actions Footer */}
              <div className="mt-8 border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {selectedUniversity.contact_email ? (
                    <a
                      href={`mailto:${selectedUniversity.contact_email}`}
                      className="inline-flex items-center gap-1.5 font-medium text-[#187e8d] hover:underline"
                    >
                      <Mail size={14} /> {selectedUniversity.contact_email}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <Mail size={14} /> Institutional liaison available via portal
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedUniversity(null)}
                    className="flex-1 sm:flex-initial rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Close
                  </button>

                  <Link
                    to="/university"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#187e8d] transition-colors shadow-sm"
                  >
                    <Briefcase size={14} />
                    Explore HEI Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </PublicLayout>
  )
}

interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="min-w-44 text-xs font-semibold text-slate-600">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-[#187e8d] focus:ring-1 focus:ring-[#187e8d]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}