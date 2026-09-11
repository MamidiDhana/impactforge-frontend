import { useState, useEffect, useCallback } from 'react'
import {
  Edit2,
  Info,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react'
import { AdminSidebar, type AdminSection } from '../../components/admin/AdminSidebar'
import { AdminOverview } from '../../components/admin/AdminOverview'
import { AdminReportsTable } from '../../components/admin/AdminReportsTable'
import { AdminReportDetailsModal } from '../../components/admin/AdminReportDetailsModal'
import { AdminUsersTable } from '../../components/admin/AdminUsersTable'
import { AdminAuditLog } from '../../components/admin/AdminAuditLog'
import { DashboardTopbar } from '../../components/navigation/DashboardTopbar'
import { Modal } from '../../components/common/Modal'
import { AnnouncementBanner } from '../../components/notifications/AnnouncementBanner'
import { useAuth } from '../../context/AuthContext'
import {
  useAdmin,
  type AdminCategory,
  type AdminAnnouncement,
  type AnnouncementAudience,
  type AnnouncementPriority,
  type AdminPortalSettings,
} from '../../context/AdminContext'
import { getReports, type BackendReportResponse } from '../../services/reportService'

export function AdminDashboardPage() {
  const { currentUser, logout } = useAuth()
  const {
    categories,
    addCategory,
    renameCategory,
    toggleCategory,
    deleteCategory,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    settings,
    updateSettings,
  } = useAdmin()

  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // Live reports from PostgreSQL
  const [reports, setReports] = useState<BackendReportResponse[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Selected report for Details modal
  const [selectedReport, setSelectedReport] = useState<BackendReportResponse | null>(null)

  // Toast feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [categoryDesc, setCategoryDesc] = useState('')

  // Announcement Modal State
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncement | null>(null)
  const [annTitle, setAnnTitle] = useState('')
  const [annMessage, setAnnMessage] = useState('')
  const [annAudience, setAnnAudience] = useState<AnnouncementAudience>('All Users')
  const [annPriority, setAnnPriority] = useState<AnnouncementPriority>('Normal')

  // Settings local draft state
  const [settingsDraft, setSettingsDraft] = useState<AdminPortalSettings>(settings)

  useEffect(() => {
    setSettingsDraft(settings)
  }, [settings])

  const notify = (msg: string) => {
    setFeedbackMessage(msg)
    setTimeout(() => setFeedbackMessage(null), 3500)
  }

  // Query live reports from GET /api/reports
  const loadReports = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)

    try {
      const data = await getReports()
      setReports(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend server.'
      setFetchError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  // Category handlers
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    if (editingCategory) {
      renameCategory(editingCategory.id, categoryName.trim())
      notify(`Category renamed to "${categoryName.trim()}".`)
    } else {
      addCategory(categoryName.trim(), categoryDesc.trim())
      notify(`Category "${categoryName.trim()}" added.`)
    }
    setIsCategoryModalOpen(false)
  }

  // Announcement handlers
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle.trim() || !annMessage.trim()) return

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, {
        title: annTitle.trim(),
        message: annMessage.trim(),
        audience: annAudience,
        priority: annPriority,
      })
      notify(`Announcement "${annTitle.trim()}" updated.`)
    } else {
      addAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        audience: annAudience,
        priority: annPriority,
        active: true,
      })
      notify(`Announcement "${annTitle.trim()}" published.`)
    }
    setIsAnnouncementModalOpen(false)
  }

  // Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(settingsDraft)
    notify('Portal configuration saved to browser local storage.')
  }

  const getSectionTitle = (): string => {
    switch (activeSection) {
      case 'overview':
        return 'System Command Overview'
      case 'reports':
        return 'Live Citizen Reports Management'
      case 'users':
        return 'Multi-Stakeholder User Management'
      case 'categories':
        return 'Taxonomy & Problem Categories'
      case 'announcements':
        return 'System Announcements & Alerts'
      case 'audit':
        return 'Chronological Audit Logs'
      case 'settings':
        return 'Portal Governance Settings'
      default:
        return 'System Command Overview'
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f7f9fc]">
      {/* Super Admin Responsive Sidebar */}
      <AdminSidebar
        user={currentUser || undefined}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapsedChange={setCollapsed}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardTopbar
          portalName="Super Admin"
          title={getSectionTitle()}
          breadcrumbs={[{ label: 'Admin', href: '/admin/dashboard' }, { label: getSectionTitle() }]}
          user={currentUser || undefined}
          notificationCount={announcements.filter((a) => a.active).length}
          onNotificationsClick={() => setActiveSection('announcements')}
          onMenuClick={() => setMobileOpen(true)}
          onProfile={() => setActiveSection('settings')}
          onLogout={handleLogout}
          search={
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                Super Admin Console
              </span>
              <button
                type="button"
                onClick={loadReports}
                disabled={isLoading}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                title="Sync reports from PostgreSQL"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin text-[#187e8d]' : ''} />
                <span>{isLoading ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>
            </div>
          }
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Active Announcements */}
          <AnnouncementBanner />

          {/* Feedback Toast */}
          {feedbackMessage && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-sm animate-in fade-in"
            >
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <AdminOverview reports={reports} onSelectSection={setActiveSection} />
          )}

          {/* Section 2: Reports */}
          {activeSection === 'reports' && (
            <AdminReportsTable
              reports={reports}
              isLoading={isLoading}
              fetchError={fetchError}
              onRefresh={loadReports}
              onViewDetails={(r) => setSelectedReport(r)}
              onReportStatusChanged={loadReports}
            />
          )}

          {/* Section 3: Users */}
          {activeSection === 'users' && <AdminUsersTable />}

          {/* Section 4: Categories */}
          {activeSection === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Category management is currently stored in browser local storage for this MVP. Backend taxonomy endpoints can be added in a future release.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <h3 className="font-[Manrope] text-sm font-bold text-[#13243b]">Problem Categories</h3>
                  <p className="text-xs text-slate-500">Configure active domains available for citizen reporting and academic research.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null)
                    setCategoryName('')
                    setCategoryDesc('')
                    setIsCategoryModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className={`rounded-xl border p-4 shadow-sm transition ${
                      c.enabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-[#187e8d]">
                          <Tags size={16} />
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{c.name}</h4>
                          <span
                            className={`inline-block rounded-full px-2 py-0.2 text-[10px] font-bold ${
                              c.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {c.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(c)
                            setCategoryName(c.name)
                            setCategoryDesc(c.description || '')
                            setIsCategoryModalOpen(true)
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="Rename Category"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete Category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {c.description && <p className="mt-2.5 text-xs text-slate-500 line-clamp-2">{c.description}</p>}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleCategory(c.id)}
                        className={`text-[11px] font-bold ${c.enabled ? 'text-amber-700 hover:underline' : 'text-emerald-700 hover:underline'}`}
                      >
                        {c.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Announcements */}
          {activeSection === 'announcements' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-[11px] leading-relaxed text-blue-800">
                  System announcements are stored in browser local storage for this MVP demo.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <h3 className="font-[Manrope] text-sm font-bold text-[#13243b]">Platform Announcements</h3>
                  <p className="text-xs text-slate-500">Publish alerts and targeted advisories to stakeholders.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnnouncement(null)
                    setAnnTitle('')
                    setAnnMessage('')
                    setAnnAudience('All Users')
                    setAnnPriority('Normal')
                    setIsAnnouncementModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
                >
                  <Plus size={14} />
                  <span>Create Announcement</span>
                </button>
              </div>

              <div className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                            Audience: {a.audience}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              a.priority === 'Urgent'
                                ? 'bg-red-50 text-red-700'
                                : a.priority === 'Important'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {a.priority}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              a.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {a.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h4 className="mt-1.5 font-[Manrope] text-sm font-bold text-[#13243b]">{a.title}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAnnouncement(a)
                            setAnnTitle(a.title)
                            setAnnMessage(a.message)
                            setAnnAudience(a.audience)
                            setAnnPriority(a.priority)
                            setIsAnnouncementModalOpen(true)
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAnnouncement(a.id)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                      <span>Created: {new Date(a.createdAt).toLocaleDateString()}</span>
                      <button
                        type="button"
                        onClick={() => toggleAnnouncement(a.id)}
                        className={`font-bold ${a.active ? 'text-amber-700 hover:underline' : 'text-emerald-700 hover:underline'}`}
                      >
                        {a.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Audit Logs */}
          {activeSection === 'audit' && <AdminAuditLog />}

          {/* Section 7: Portal Settings */}
          {activeSection === 'settings' && (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
                <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Portal settings represent client-side demo configurations in local storage. Multi-tenant live configuration requires a server-side configuration API in a future release.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-xs">
                <h3 className="font-[Manrope] text-sm font-bold text-[#13243b]">Platform Governance Parameters</h3>

                <div>
                  <label htmlFor="settings-pname" className="mb-1 block font-bold text-slate-700">
                    Platform Title
                  </label>
                  <input
                    id="settings-pname"
                    type="text"
                    value={settingsDraft.platformName}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, platformName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
                  />
                </div>

                <div>
                  <label htmlFor="settings-pdesc" className="mb-1 block font-bold text-slate-700">
                    Platform Subtitle / Description
                  </label>
                  <textarea
                    id="settings-pdesc"
                    rows={2}
                    value={settingsDraft.platformDescription}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, platformDescription: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
                  />
                </div>

                <div>
                  <label htmlFor="settings-defstatus" className="mb-1 block font-bold text-slate-700">
                    Default Citizen Report Intake Status
                  </label>
                  <select
                    id="settings-defstatus"
                    value={settingsDraft.defaultReportStatus}
                    onChange={(e) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        defaultReportStatus: e.target.value as 'Open' | 'Pending' | 'Under Review',
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
                  >
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settingsDraft.allowNewCitizenSubmissions}
                      onChange={(e) =>
                        setSettingsDraft({ ...settingsDraft, allowNewCitizenSubmissions: e.target.checked })
                      }
                      className="size-4 rounded border-slate-300 accent-[#12365a]"
                    />
                    <span>Allow New Citizen Submissions (Demo Toggle)</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settingsDraft.showAnnouncements}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, showAnnouncements: e.target.checked })}
                      className="size-4 rounded border-slate-300 accent-[#12365a]"
                    />
                    <span>Display System Announcements across Portals</span>
                  </label>

                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={settingsDraft.maintenanceMode}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, maintenanceMode: e.target.checked })}
                      className="size-4 rounded border-slate-300 accent-rose-600"
                    />
                    <span className="text-rose-700">Maintenance Mode Banner (Visual Demo Only)</span>
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
                  >
                    <Save size={14} />
                    <span>Save Platform Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Report Details Modal */}
      <AdminReportDetailsModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        onStatusUpdated={loadReports}
      />

      {/* Category Add/Edit Modal */}
      <Modal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Rename Category' : 'Add Problem Category'}
      >
        <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="cat-name-input" className="mb-1 block font-bold text-slate-700">
              Category Title <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name-input"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Public Safety or Digital Services"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
              required
            />
          </div>

          <div>
            <label htmlFor="cat-desc-input" className="mb-1 block font-bold text-slate-700">
              Description (Optional)
            </label>
            <textarea
              id="cat-desc-input"
              rows={2}
              value={categoryDesc}
              onChange={(e) => setCategoryDesc(e.target.value)}
              placeholder="Scope and examples of issues covered..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#0e2b48]"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Announcement Add/Edit Modal */}
      <Modal
        open={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={editingAnnouncement ? 'Edit Announcement' : 'New Platform Announcement'}
      >
        <form onSubmit={handleSaveAnnouncement} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="ann-title-input" className="mb-1 block font-bold text-slate-700">
              Announcement Title <span className="text-red-500">*</span>
            </label>
            <input
              id="ann-title-input"
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Statewide Innovation Drive 2026 Active"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ann-aud-input" className="mb-1 block font-bold text-slate-700">
                Target Audience
              </label>
              <select
                id="ann-aud-input"
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value as AnnouncementAudience)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
              >
                {(['All Users', 'Citizens', 'Government', 'HEI', 'Faculty', 'Partners'] as AnnouncementAudience[]).map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ann-prio-input" className="mb-1 block font-bold text-slate-700">
                Priority
              </label>
              <select
                id="ann-prio-input"
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as AnnouncementPriority)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
              >
                {(['Normal', 'Important', 'Urgent'] as AnnouncementPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ann-msg-input" className="mb-1 block font-bold text-slate-700">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="ann-msg-input"
              rows={3}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Broadcast advisory details..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#0e2b48]"
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
