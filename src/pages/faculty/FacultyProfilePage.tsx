import { useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react'
import { FacultyStudentLayout } from '../../layouts/FacultyStudentLayout'
import { WorkspacePage } from '../workspace/WorkspaceShared'

interface FacultyProfileData {
  name: string
  designation: string
  department: string
  university: string
  email: string
  phone: string
  office: string
  experience: number
  availability: 'Available' | 'Limited' | 'On Sabbatical'
  activeProjects: number
  bio: string
  researchExpertise: string[]
  officeHours: string
}

const initialFacultyProfile: FacultyProfileData = {
  name: 'Dr. Arjun Menon',
  designation: 'Associate Professor & Principal Research Lead',
  department: 'Department of Electrical & Computer Engineering',
  university: 'National Institute of Technology Karnataka (NITK) / COEP',
  email: 'arjun.menon@nitk.edu.in',
  phone: '+91 824 247 4000',
  office: 'Technology Innovation Block, Room 304',
  experience: 14,
  availability: 'Available',
  activeProjects: 3,
  bio: 'Specializing in rural edge telemetry, low-power sensor networks, and decentralized digital infrastructure. Serving as faculty mentor for student innovation teams solving regional water, education, and health challenges.',
  researchExpertise: [
    'Embedded Systems & FreeRTOS',
    'Low-power IoT Telemetry',
    'Rural Edge Computing',
    'Renewable Energy Integration',
    'Community Field Deployments',
  ],
  officeHours: 'Tuesdays & Thursdays, 3:00 PM – 5:00 PM',
}

export function FacultyProfilePage() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState<FacultyProfileData>(initialFacultyProfile)
  const [newExpertise, setNewExpertise] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleAddExpertise = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newExpertise.trim()
    if (!trimmed || profile.researchExpertise.includes(trimmed)) return
    setProfile({
      ...profile,
      researchExpertise: [...profile.researchExpertise, trimmed],
    })
    setNewExpertise('')
  }

  const handleRemoveExpertise = (skill: string) => {
    setProfile({
      ...profile,
      researchExpertise: profile.researchExpertise.filter((s) => s !== skill),
    })
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    setEditing(false)
    setFeedback('Faculty mentor profile changes successfully saved in local state.')
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <FacultyStudentLayout role="faculty" title="Profile">
      <WorkspacePage
        role="faculty"
        title="Profile"
        description="Maintain your academic credentials, research expertise, and mentorship capacity."
        breadcrumbs={[
          { label: 'Faculty', href: '/faculty/dashboard' },
          { label: 'Profile' },
        ]}
      >
        <div className="max-w-4xl space-y-6">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          <form
            onSubmit={handleSave}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Header with avatar, title, and edit toggle */}
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#d9eeee] font-[Manrope] text-2xl font-bold text-[#12365a]">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">
                      {profile.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={13} />
                      Verified Faculty Lead
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile.designation} · {profile.department}
                  </p>
                </div>
              </div>

              <div>
                {!editing ? (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Save Profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile fields grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Designation</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">University / Institution</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.university}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Research Focus & Bio</label>
                <textarea
                  rows={3}
                  disabled={!editing}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Mail size={13} className="text-slate-400" />
                  Institutional Email
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
                  Office Contact Phone
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MapPin size={13} className="text-slate-400" />
                  Office Location
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.office}
                  onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Student Mentorship Availability</label>
                <select
                  disabled={!editing}
                  value={profile.availability}
                  onChange={(e) => setProfile({ ...profile, availability: e.target.value as typeof profile.availability })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                >
                  <option value="Available">Available (Accepting Student Teams)</option>
                  <option value="Limited">Limited (Advisory Only)</option>
                  <option value="On Sabbatical">On Sabbatical / Research Leave</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Consultation & Office Hours</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={profile.officeHours}
                  onChange={(e) => setProfile({ ...profile, officeHours: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                />
              </div>
            </div>

            {/* Research & Technical Expertise Tags */}
            <div className="border-t border-slate-100 pt-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Research Expertise & Domain Competencies
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Used to match validated citizen problems with faculty mentors.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {profile.researchExpertise.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f5] px-3 py-1 text-xs font-bold text-[#187e8d]"
                  >
                    {skill}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(skill)}
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
                    placeholder="Add expertise area (e.g. Battery Energy Storage)"
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-900"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
      </WorkspacePage>
    </FacultyStudentLayout>
  )
}