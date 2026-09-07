import { useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Lock,
  Mail,
  RotateCcw,
  Save,
  Settings,
  ShieldAlert,
  Users,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { initialAdminSettings } from '../../data/adminMockData'
import type { AdminSettingsState } from '../../types/admin'

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettingsState>(initialAdminSettings)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback('Platform settings and system toggles successfully saved and applied to runtime environment!')
    setTimeout(() => setFeedback(null), 4500)
  }

  const handleConfirmReset = () => {
    setSettings(initialAdminSettings)
    setResetConfirmOpen(false)
    setFeedback('All platform settings have been reverted to system defaults.')
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="Settings">
      <AdminPage
        title="Settings"
        description="Administer global registration policies, authentication, and platform rules."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Settings' },
        ]}
      >
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Maintenance Mode Alert Banner */}
          {settings.maintenanceMode && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-800">
              <AlertTriangle size={20} className="text-rose-600 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Maintenance Mode is currently ACTIVE!</p>
                <p>Public users and standard stakeholders are blocked with a maintenance notice screen.</p>
              </div>
            </div>
          )}

          {/* 1. Platform Settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Settings size={18} className="text-[#187e8d]" />
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Platform Identity & Support
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700">Platform Brand Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Official Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Helpline / Contact Phone</label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700">Default Platform Timezone</label>
                <input
                  type="text"
                  value={settings.defaultTimezone}
                  onChange={(e) => setSettings({ ...settings, defaultTimezone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800 focus:border-[#187e8d] focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. Registration & Verification Settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users size={18} className="text-[#187e8d]" />
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Registration & Institutional Verification Policies
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Open New User Registration</span>
                  <span className="text-slate-500">Allow citizens, students, and faculty to self-register accounts on the portal.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.newUserRegistration}
                  onChange={(e) => setSettings({ ...settings, newUserRegistration: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Organization Verification Requirement</span>
                  <span className="text-slate-500">Require universities, government departments, and CSR partners to be vetted before project access.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.orgVerificationRequired}
                  onChange={(e) => setSettings({ ...settings, orgVerificationRequired: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>
            </div>
          </section>

          {/* 3. Notification Settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Mail size={18} className="text-[#187e8d]" />
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Notification & Dispatch Settings
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Email Notifications Dispatch</span>
                  <span className="text-slate-500">Enable automated outbound transactional emails for validation alerts and milestones.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>
            </div>
          </section>

          {/* 4. Security & Authentication Settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Lock size={18} className="text-[#187e8d]" />
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                Security, Sessions & MFA Policies
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Enforce Two-Factor Authentication (MFA)</span>
                  <span className="text-slate-500">Require TOTP or SMS OTP for Super Admin and Government Validator accounts.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.mfaEnforced}
                  onChange={(e) => setSettings({ ...settings, mfaEnforced: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                <div>
                  <span className="font-bold text-slate-800 block">Session Idle Timeout</span>
                  <span className="text-slate-500">Automatically logs out inactive administrative sessions.</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <input
                    type="number"
                    min={15}
                    max={120}
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })}
                    className="w-16 rounded-md border border-slate-200 px-2 py-1 text-center text-xs"
                  />
                  <span>mins</span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. AI Configuration Settings */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bot size={18} className="text-[#187e8d]" />
              <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
                AI Orchestration & Similarity Parameters
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Automated Problem Categorization</span>
                  <span className="text-slate-500">Automatically tag incoming citizen problems with problem category and SDG goals.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiAutoCategorization}
                  onChange={(e) => setSettings({ ...settings, aiAutoCategorization: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-800 block">Vector Embedding Model Caching</span>
                  <span className="text-slate-500">Cache semantic similarity matrices in Redis to reduce embedding latency.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiModelCaching}
                  onChange={(e) => setSettings({ ...settings, aiModelCaching: e.target.checked })}
                  className="size-4 accent-[#187e8d]"
                />
              </label>

              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Duplicate Problem Similarity Threshold</span>
                  <span className="font-mono font-bold text-[#187e8d] text-sm">
                    {settings.aiSimilarityThreshold}%
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mb-2">
                  Submissions with semantic cosine similarity higher than this will trigger duplicate warnings.
                </p>
                <input
                  type="range"
                  min={60}
                  max={95}
                  value={settings.aiSimilarityThreshold}
                  onChange={(e) => setSettings({ ...settings, aiSimilarityThreshold: Number(e.target.value) })}
                  className="w-full accent-[#187e8d]"
                />
              </div>
            </div>
          </section>

          {/* 6. System Maintenance Mode */}
          <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
              <ShieldAlert size={18} className="text-rose-600" />
              <h3 className="font-[Manrope] text-base font-bold text-rose-950">
                Emergency & System Maintenance Mode
              </h3>
            </div>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 cursor-pointer text-xs">
              <div>
                <span className="font-bold text-rose-900 block">Activate Maintenance Mode</span>
                <span className="text-rose-700">Restricts all public and non-admin routes for system database migrations.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="size-4 accent-rose-600"
              />
            </label>
          </section>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#12365a] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1a4a7a]"
            >
              <Save size={14} />
              Save Settings
            </button>
          </div>
        </form>

        {/* Reset Confirmation Dialog */}
        <ConfirmDialog
          open={resetConfirmOpen}
          title="Reset Platform Settings"
          description="Are you sure you want to revert all platform configurations, AI thresholds, and security toggles to factory defaults?"
          confirmLabel="Revert to Defaults"
          destructive
          onConfirm={handleConfirmReset}
          onCancel={() => setResetConfirmOpen(false)}
        />
      </AdminPage>
    </AdminLayout>
  )
}
