import { useState, type FormEvent } from 'react'
import { CheckCircle2, LockKeyhole, UserRound } from 'lucide-react'
import { CitizenLayout } from '../../layouts/CitizenLayout'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { FormField } from '../../components/forms/FormField'
import { TextAreaField } from '../../components/forms/TextAreaField'
import { useAuth } from '../../context/AuthContext'

export function CitizenProfilePage() {
  const { currentUser, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  if (!currentUser) return null
  const save = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); updateUser({ name: currentUser.name }); setSaved(true); setEditing(false) }
  return (
    <CitizenLayout title="Profile">
      <PageContainer>
        <PageHeader
          title="Profile"
          description="Manage the information shown in your citizen workspace."
          breadcrumbs={[
            { label: 'Citizen', href: '/citizen/dashboard' },
            { label: 'Profile' },
          ]}
          action={
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="rounded-lg bg-[#12365a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1a4a7a]"
            >
              {editing ? 'Cancel editing' : 'Edit profile'}
            </button>
          }
        />
        <form onSubmit={save} className="max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <span className="grid size-16 place-items-center rounded-full bg-[#d9eeee] text-xl font-bold text-[#12365a]">
              <UserRound size={26} />
            </span>
            <div>
              <h2 className="font-[Manrope] text-xl font-bold text-[#13243b]">{currentUser.name}</h2>
              <p className="text-sm capitalize text-slate-500">{currentUser.role} · {currentUser.organization}</p>
            </div>
            <span className="ml-auto hidden items-center gap-1 text-xs font-semibold text-emerald-700 sm:flex">
              <CheckCircle2 size={15} />
              Verified demo profile
            </span>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <FormField label="Full name" defaultValue={currentUser.name} disabled={!editing} />
            <FormField label="Email" type="email" defaultValue={currentUser.email} disabled />
            <FormField label="Phone number" placeholder="Add a phone number" disabled={!editing} />
            <FormField label="Location" placeholder="City, state" disabled={!editing} />
          </div>
          <div className="mt-5">
            <TextAreaField label="Short bio" placeholder="Tell collaborators a little about your community perspective" disabled={!editing} />
          </div>
          {saved && (
            <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={17} />
              Profile changes saved to this mock session.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!editing} className="rounded-lg bg-[#12365a] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              Save changes
            </button>
            <button type="button" onClick={() => undefined} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">
              <LockKeyhole size={16} />
              Change password
            </button>
          </div>
        </form>
      </PageContainer>
    </CitizenLayout>
  )
}
