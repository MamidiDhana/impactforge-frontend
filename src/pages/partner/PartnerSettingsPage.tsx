import { useState, type FormEvent } from 'react'
import {
  Bell,
  CheckCircle2,
  Lock,
  LogOut,
  Save,
  Shield,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PartnerLayout } from '../../layouts/PartnerLayout'
import { PartnerPage } from './PartnerShared'
import { useAuth } from '../../context/AuthContext'

export function PartnerSettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [collaborationAlerts, setCollaborationAlerts] = useState(true)
  const [projectMilestoneAlerts, setProjectMilestoneAlerts] = useState(true)

  // Privacy toggles
  const [publicProfile, setPublicProfile] = useState(true)
  const [allowDirectRequests, setAllowDirectRequests] = useState(true)
  const [showContactDetails, setShowContactDetails] = useState(true)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [feedback, setFeedback] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSavePreferences = (e: FormEvent) => {
    e.preventDefault()
    setFeedback('Notification and privacy preferences successfully saved.')
    setTimeout(() => setFeedback(null), 4000)
  }

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setFeedback('Security credentials updated successfully.')
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <PartnerLayout title="Settings">
      <PartnerPage
        title="Settings"
        description="Configure your organization's notification preferences, privacy visibility, and security."
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Settings' },
        ]}
      >
        <div className="space-y-8 max-w-3xl">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* 1. Notification Preferences */}
          <form
            onSubmit={handleSavePreferences}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="grid size-9 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                <Bell size={18} />
              </span>
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Notification Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Select which updates trigger browser and email notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Email Notifications</p>
                  <p className="text-xs text-slate-500">
                    Receive email digests of new recommended projects and monthly impact summaries.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Collaboration Request Alerts</p>
                  <p className="text-xs text-slate-500">
                    Get instant notifications whenever an institution submits or updates a collaboration request.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={collaborationAlerts}
                  onChange={(e) => setCollaborationAlerts(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Project Milestone Updates</p>
                  <p className="text-xs text-slate-500">
                    Notify when student or faculty teams complete active project milestones.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={projectMilestoneAlerts}
                  onChange={(e) => setProjectMilestoneAlerts(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
              >
                <Save size={13} />
                Save Preferences
              </button>
            </div>
          </form>

          {/* 2. Privacy Settings */}
          <form
            onSubmit={handleSavePreferences}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <Shield size={18} />
              </span>
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Privacy & Profile Visibility
                </h3>
                <p className="text-xs text-slate-500">
                  Control how other network participants discover your organization profile.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Public Organization Profile</p>
                  <p className="text-xs text-slate-500">
                    Allow universities, students, and citizens to view your organization in the public Partner Directory.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Direct Collaboration Inquiries</p>
                  <p className="text-xs text-slate-500">
                    Allow accredited university faculty to propose collaboration requests directly to your team.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowDirectRequests}
                  onChange={(e) => setAllowDirectRequests(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800">Show Designated Contact Details</p>
                  <p className="text-xs text-slate-500">
                    Display direct phone and email contact details to verified HEI faculty leads.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showContactDetails}
                  onChange={(e) => setShowContactDetails(e.target.checked)}
                  className="mt-1 size-4 rounded accent-[#187e8d]"
                />
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
              >
                <Save size={13} />
                Save Privacy Settings
              </button>
            </div>
          </form>

          {/* 3. Change Password Section */}
          <form
            onSubmit={handlePasswordChange}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
                <Lock size={18} />
              </span>
              <div>
                <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500">
                  Update your organizational login credentials.
                </p>
              </div>
            </div>

            {passwordError && (
              <p className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                {passwordError}
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
              >
                <Lock size={13} />
                Update Password
              </button>
            </div>
          </form>

          {/* 4. Session & Logout */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-[Manrope] text-base font-bold text-rose-900">
                Log Out of Organization Account
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                End your partner session on this device. You will need to sign in again to review project requests.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shrink-0"
            >
              <LogOut size={14} />
              Log Out Now
            </button>
          </div>
        </div>
      </PartnerPage>
    </PartnerLayout>
  )
}
