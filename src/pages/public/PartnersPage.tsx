import { useMemo, useState } from 'react'
import { CheckCircle2, Handshake, MapPin, Search } from 'lucide-react'
import { partners } from '../../data/partners'
import { PublicLayout } from '../../layouts/PublicLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { SearchInput } from '../../components/forms/SearchInput'
import { EmptyState } from '../../components/common/EmptyState'
import { ResponsiveCard } from '../../components/common/ResponsiveCard'

export function PartnersPage() {
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All partner types')
  const [location, setLocation] = useState('All locations')
  const [capability, setCapability] = useState('All capabilities')
  const types = ['All partner types', ...Array.from(new Set(partners.map((item) => item.type))).sort()]
  const locations = ['All locations', ...Array.from(new Set(partners.map((item) => item.location.split(', ')[1]))).sort()]
  const capabilities = ['All capabilities', ...Array.from(new Set(partners.flatMap((item) => item.capabilities))).sort()]
  const results = useMemo(() => partners.filter((item) => {
    const matchesSearch = `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (type === 'All partner types' || item.type === type) && (location === 'All locations' || item.location.endsWith(location)) && (capability === 'All capabilities' || item.capabilities.includes(capability))
  }), [capability, location, search, type])
  return <PublicLayout><PageContainer><PageHeader title="Partners for practical collaboration" description="Explore organizations that can contribute expertise, resources, research, funding, or implementation support." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Partners' }]} /><div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-2 xl:grid-cols-4"><div className="md:col-span-2 xl:col-span-1"><SearchInput value={search} onChange={setSearch} placeholder="Search partners" /></div><FilterSelect label="Type" value={type} options={types} onChange={setType} /><FilterSelect label="Location" value={location} options={locations} onChange={setLocation} /><FilterSelect label="Capability" value={capability} options={capabilities} onChange={setCapability} /></div><p className="mt-6 text-sm text-slate-500">{results.length} partners in the public directory</p>{results.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{results.map((partner) => <ResponsiveCard key={partner.id} className="flex h-full flex-col"><div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-lg bg-[#e8f5f5] text-[#187e8d]"><Handshake size={21} /></span>{partner.verified && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Verified</span>}</div><p className="mt-5 text-xs font-bold uppercase tracking-[0.1em] text-[#187e8d]">{partner.type}</p><h2 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b]">{partner.name}</h2><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><MapPin size={14} className="text-[#187e8d]" />{partner.location}</p><p className="mt-4 text-sm leading-6 text-slate-500">{partner.description}</p><p className="mt-4 text-xs font-bold text-slate-700">Capabilities</p><div className="mt-2 flex flex-wrap gap-2">{partner.capabilities.map((item) => <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item}</span>)}</div><p className="mt-4 text-xs font-bold text-slate-700">Collaboration areas</p><p className="mt-2 text-sm text-slate-500">{partner.collaborationAreas.join(' · ')}</p><button type="button" className="mt-5 rounded-lg border border-[#12365a] px-4 py-2.5 text-sm font-semibold text-[#12365a] hover:bg-slate-50">View profile</button></ResponsiveCard>)}</div> : <div className="mt-4"><EmptyState icon={Search} title="No partners found" description="Try a different search or filter combination." /></div>}</PageContainer></PublicLayout>
}

interface FilterSelectProps { label: string; value: string; options: string[]; onChange: (value: string) => void }
function FilterSelect({ label, value, options, onChange }: FilterSelectProps) { return <label className="text-xs font-semibold text-slate-600">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none focus:border-[#187e8d]">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }