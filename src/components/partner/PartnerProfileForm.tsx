import { useState, type FormEvent } from 'react'
import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  User,
  X,
} from 'lucide-react'
import type { PartnerProfile } from '../../types'

const ORGANIZATION_TYPES = [
  'Industry',
  'MSME',
  'Startup',
  'Research Organization',
  'CSR Foundation',
  'NGO',
  'Technology Provider',
]

interface PartnerProfileFormProps {
  profile: PartnerProfile
  onSave: (updatedProfile: PartnerProfile) => void
}

export function PartnerProfileForm({ profile: initialProfile, onSave }: PartnerProfileFormProps) {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<PartnerProfile>(initialProfile)
  const [savedNotice, setSavedNotice] = useState(false)

  // Tag inputs
  const [newExpertise, setNewExpertise] = useState('')
  const [newResource, setNewResource] = useState('')
  const [newIndustry, setNewIndustry] = useState('')

  const handleAddTag = (
    field: 'expertise' | 'resources' | 'industries',
    value: string,
    clearFn: (val: string) => void
  ) => {
    const trimmed = value.trim()
    if (!trimmed || profile[field].includes(trimmed)) return
    setProfile({
      ...profile,
      [field]: [...profile[field], trimmed],
    })
    clearFn('')
  }

  const handleRemoveTag = (field: 'expertise' | 'resources' | 'industries', item: string) => {
    setProfile({
      ...profile,
      [field]: profile[field].filter((x) => x !== item),
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSave(profile)
    setEditing(false)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 3500)
  }

  return (
    <div className="space-y-6">
      {savedNotice && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          Partner profile successfully updated and saved in local state.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Header with Logo placeholder & Verification */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-[#d9eeee] font-[Manrope] text-2xl font-bold text-[#12365a] shadow-inner">
              <Building2 size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
                  {profile.name}
                </h2>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <ShieldCheck size={14} />
                    Verified Partner
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {profile.type} · {profile.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1a4a7a]"
              >
                Edit Organization Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setProfile(initialProfile)
                    setEditing(false)
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700">Organization Name</label>
            <input
              type="text"
              disabled={!editing}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Organization Type</label>
            <select
              disabled={!editing}
              value={profile.type}
              onChange={(e) => setProfile({ ...profile, type: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            >
              {ORGANIZATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700">Description & Mission</label>
            <textarea
              rows={3}
              disabled={!editing}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Globe size={13} className="text-slate-400" />
              Website URL
            </label>
            <input
              type="url"
              disabled={!editing}
              value={profile.website}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <MapPin size={13} className="text-slate-400" />
              Headquarters / Location
            </label>
            <input
              type="text"
              disabled={!editing}
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <User size={13} className="text-slate-400" />
              Primary Contact Person
            </label>
            <input
              type="text"
              disabled={!editing}
              value={profile.contactPerson ?? ''}
              onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
              placeholder="e.g. Karan Patel (Director of Strategic Partnerships)"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Mail size={13} className="text-slate-400" />
              Official Email
            </label>
            <input
              type="email"
              disabled={!editing}
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Phone size={13} className="text-slate-400" />
              Contact Phone
            </label>
            <input
              type="text"
              disabled={!editing}
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
            />
          </div>
        </div>

        {/* Tag Sections: Areas of Expertise, Available Resources, Industry Sectors */}
        <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
          {/* Expertise */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Areas of Expertise (used for AI Project Matching)
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.expertise.map((exp) => (
                <span
                  key={exp}
                  className="inline-flex items-center gap-1 rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-semibold text-[#187e8d]"
                >
                  {exp}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag('expertise', exp)}
                      className="rounded-full p-0.5 hover:bg-[#b8dfe0]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="mt-3 flex max-w-sm gap-2">
                <input
                  type="text"
                  placeholder="Add expertise (e.g. Edge AI)"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag('expertise', newExpertise, setNewExpertise)
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag('expertise', newExpertise, setNewExpertise)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Available Resources */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Available Resources & Offerings
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.resources.map((res) => (
                <span
                  key={res}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                >
                  {res}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag('resources', res)}
                      className="rounded-full p-0.5 hover:bg-blue-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="mt-3 flex max-w-sm gap-2">
                <input
                  type="text"
                  placeholder="Add resource (e.g. GPU Credits)"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag('resources', newResource, setNewResource)
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag('resources', newResource, setNewResource)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Industry Sectors */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Industry Sectors & Focus Areas
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.industries.map((ind) => (
                <span
                  key={ind}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {ind}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag('industries', ind)}
                      className="rounded-full p-0.5 hover:bg-slate-200"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <div className="mt-3 flex max-w-sm gap-2">
                <input
                  type="text"
                  placeholder="Add industry sector"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag('industries', newIndustry, setNewIndustry)
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#187e8d]"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag('industries', newIndustry, setNewIndustry)}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Plus size={13} />
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => {
                setProfile(initialProfile)
                setEditing(false)
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#12365a] px-5 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
            >
              Save Profile
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
