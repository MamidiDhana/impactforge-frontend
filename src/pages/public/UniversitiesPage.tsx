import { useMemo, useState } from 'react'
import { Building2, CheckCircle2, GraduationCap, MapPin, Search } from 'lucide-react'
import { universities } from '../../data/universities'
import { PublicLayout } from '../../layouts/PublicLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { EmptyState } from '../../components/common/EmptyState'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'

export function UniversitiesPage() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('All locations')
  const [capability, setCapability] = useState('All capabilities')
  const locations = ['All locations', ...Array.from(new Set(universities.map((item) => item.location.split(', ')[1]))).sort()]
  const capabilities = ['All capabilities', ...Array.from(new Set(universities.flatMap((item) => item.capabilities))).sort()]
  const results = useMemo(() => universities.filter((item) => {
    const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (location === 'All locations' || item.location.endsWith(location)) && (capability === 'All capabilities' || item.capabilities.includes(capability))
  }), [capability, location, search])
  return <PublicLayout><PageContainer><PageHeader title="Universities and HEIs" description="Find academic communities with the capabilities, people, and curiosity to work on public challenges." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Universities' }]} /><div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 md:flex-row"><div className="min-w-56 flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Search universities" /></div><FilterSelect label="Location" value={location} options={locations} onChange={setLocation} /><FilterSelect label="Capability" value={capability} options={capabilities} onChange={setCapability} /></div><p className="mt-6 text-sm text-slate-500">{results.length} universities in the public directory</p>{results.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{results.map((university) => <ResponsiveCard key={university.id} className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]"><GraduationCap size={21} /></span>{university.verified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Verified</span>}</div><h2 className="mt-5 font-[Manrope] text-lg font-bold text-[#13243b]">{university.name}</h2><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><MapPin size={14} className="text-[#187e8d]" />{university.location}</p><p className="mt-4 text-sm leading-6 text-slate-500">{university.description}</p><div className="mt-4 flex flex-wrap gap-2">{university.capabilities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500"><span className="flex items-center gap-2"><GraduationCap size={14} />{university.facultyCount} faculty</span><span className="flex items-center gap-2"><Building2 size={14} />{university.activeProjects} active projects</span></div><button type="button" className="mt-5 rounded-lg border border-[#12365a] px-4 py-2.5 text-sm font-semibold text-[#12365a] hover:bg-slate-50">View profile</button></ResponsiveCard>)}</div> : <div className="mt-4"><EmptyState icon={Search} title="No universities found" description="Try a different search, location, or capability." /></div>}</PageContainer></PublicLayout>
}

interface FilterSelectProps { label: string; value: string; options: string[]; onChange: (value: string) => void }
function FilterSelect({ label, value, options, onChange }: FilterSelectProps) { return <label className="min-w-40 text-xs font-semibold text-slate-600">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-[#187e8d]">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }