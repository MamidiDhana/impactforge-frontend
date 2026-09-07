import { useState } from 'react'
import {
  Check,
  CheckCircle2,
  Edit2,
  KeyRound,
  Lock,
  Plus,
  Shield,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { adminRoles as initialRoles } from '../../data/adminMockData'
import type { AdminRole } from '../../types/admin'

const MODULE_PERMISSIONS_GRID = [
  { module: 'Community Problems', key: 'problems', description: 'Citizen grievance intake & validation' },
  { module: 'Projects & Workspaces', key: 'projects', description: 'Faculty & student sprint spaces' },
  { module: 'Organizations & HEIs', key: 'orgs', description: 'Institutional vetting & credentials' },
  { module: 'User Accounts & Roles', key: 'users', description: 'Platform credentials & invitations' },
  { module: 'AI Models & Analytics', key: 'ai', description: 'Model orchestration & similarity configs' },
  { module: 'Audit Logs & Governance', key: 'audit', description: 'Platform event tracking & logs' },
  { module: 'Platform Core Settings', key: 'settings', description: 'Platform toggles & maintenance' },
]

export function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<AdminRole>(initialRoles[0])
  const [editRoleModal, setEditRoleModal] = useState<AdminRole | null>(null)
  const [addRoleModal, setAddRoleModal] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // Add custom role form state
  const [customRoleName, setCustomRoleName] = useState('')
  const [customRoleDesc, setCustomRoleDesc] = useState('')

  const handleTogglePermission = (
    permKey: keyof AdminRole['permissions']
  ) => {
    const updated = {
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [permKey]: !selectedRole.permissions[permKey],
      },
    }
    setSelectedRole(updated)
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setFeedback(`Permission "${permKey}" updated for role "${selectedRole.name}".`)
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleSaveEditedRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editRoleModal) return
    setRoles((prev) =>
      prev.map((r) => (r.id === editRoleModal.id ? editRoleModal : r))
    )
    if (selectedRole.id === editRoleModal.id) {
      setSelectedRole(editRoleModal)
    }
    setFeedback(`Role "${editRoleModal.name}" updated successfully.`)
    setEditRoleModal(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customRoleName.trim()) return

    const newRole: AdminRole = {
      id: `role-custom-${Date.now()}`,
      name: customRoleName.trim(),
      description: customRoleDesc.trim() || 'Custom organizational permission role.',
      usersCount: 0,
      isSystem: false,
      permissions: {
        read: true,
        create: false,
        update: false,
        delete: false,
        approve: false,
        export: false,
      },
    }

    setRoles([...roles, newRole])
    setSelectedRole(newRole)
    setAddRoleModal(false)
    setCustomRoleName('')
    setCustomRoleDesc('')
    setFeedback(`Custom role "${newRole.name}" created successfully!`)
    setTimeout(() => setFeedback(null), 4000)
  }

  return (
    <AdminLayout title="Roles">
      <AdminPage
        title="Roles"
        description="Configure granular permissions across platform modules for stakeholder roles."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Roles' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setAddRoleModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Plus size={14} />
            Add Custom Role
          </button>
        }
      >
        <div className="space-y-6">
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Master Grid: Roles List (Left) & Permissions Matrix (Right) */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 1. Roles Sidebar List (1 col) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Available Roles ({roles.length})
                </span>
                <span className="text-[11px] font-semibold text-[#187e8d]">
                  Click to inspect
                </span>
              </div>

              <div className="space-y-2">
                {roles.map((r) => {
                  const isSelected = selectedRole.id === r.id
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRole(r)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#187e8d] bg-[#e8f5f5]/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`grid size-7 place-items-center rounded-md text-xs ${
                              r.isSystem
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            <Shield size={14} />
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-[#13243b]">{r.name}</h4>
                            <p className="text-[11px] text-slate-400">
                              {r.isSystem ? 'System Core Role' : 'Custom User Role'}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {r.usersCount} users
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Permissions Matrix & Role Details (2 cols) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Role Header Banner */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                        <KeyRound size={20} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                            {selectedRole.name}
                          </h3>
                          {selectedRole.isSystem && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                              <Lock size={11} /> System Locked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Assigned to {selectedRole.usersCount} active users on ImpactForge
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditRoleModal({ ...selectedRole })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 size={13} />
                      Edit Role Details
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600">
                  {selectedRole.description}
                </p>

                {/* Primary Permission Toggles Row */}
                <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-slate-100 pt-4 text-center">
                  {(['read', 'create', 'update', 'delete', 'approve', 'export'] as const).map(
                    (perm) => {
                      const isAllowed = selectedRole.permissions[perm]
                      return (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => handleTogglePermission(perm)}
                          className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition ${
                            isAllowed
                              ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                              isAllowed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isAllowed ? <Check size={13} /> : <X size={13} />}
                          </span>
                          <span className="mt-1.5 font-bold uppercase text-[10px]">
                            {perm}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {isAllowed ? 'Granted' : 'Restricted'}
                          </span>
                        </button>
                      )
                    }
                  )}
                </div>
              </div>

              {/* Module-Level Permission Matrix Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-[Manrope] text-base font-bold text-[#13243b]">
                      Granular Module Permissions Matrix
                    </h4>
                    <p className="text-xs text-slate-500">
                      Access privilege rules governing individual platform subsystems
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-[#187e8d]">
                    Live ACL
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Platform Module</th>
                        <th className="px-2 py-2.5 text-center">Read</th>
                        <th className="px-2 py-2.5 text-center">Create</th>
                        <th className="px-2 py-2.5 text-center">Update</th>
                        <th className="px-2 py-2.5 text-center">Delete</th>
                        <th className="px-2 py-2.5 text-center">Approve</th>
                        <th className="px-2 py-2.5 text-center">Export</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MODULE_PERMISSIONS_GRID.map((row) => (
                        <tr key={row.key} className="hover:bg-slate-50/70">
                          <td className="px-3 py-3">
                            <p className="font-bold text-slate-800">{row.module}</p>
                            <p className="text-[10px] text-slate-400">{row.description}</p>
                          </td>
                          {(['read', 'create', 'update', 'delete', 'approve', 'export'] as const).map(
                            (perm) => {
                              const isAllowed = selectedRole.permissions[perm]
                              return (
                                <td key={perm} className="px-2 py-3 text-center">
                                  <span
                                    className={`inline-grid size-5 place-items-center rounded-full text-[10px] font-bold ${
                                      isAllowed
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                  >
                                    {isAllowed ? '✓' : '–'}
                                  </span>
                                </td>
                              )
                            }
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Edit Role Modal */}
        {editRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setEditRoleModal(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Edit Role: {editRoleModal.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust descriptive metadata for this role
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveEditedRole} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Role Title</label>
                  <input
                    type="text"
                    required
                    disabled={editRoleModal.isSystem}
                    value={editRoleModal.name}
                    onChange={(e) =>
                      setEditRoleModal({ ...editRoleModal, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-500 focus:border-[#187e8d] focus:outline-none"
                  />
                  {editRoleModal.isSystem && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      Core system role titles cannot be renamed.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Description & Purpose</label>
                  <textarea
                    rows={3}
                    required
                    value={editRoleModal.description}
                    onChange={(e) =>
                      setEditRoleModal({ ...editRoleModal, description: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditRoleModal(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. Add Custom Role Modal */}
        {addRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAddRoleModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-purple-50 text-purple-700">
                  <Shield size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Create Custom Role
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define a tailored privilege profile for specialized teams.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateCustomRole} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSR Compliance Officer"
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Role Purpose & Scope</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Authorized to audit financial disbursements and export quarterly impact filings..."
                    value={customRoleDesc}
                    onChange={(e) => setCustomRoleDesc(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddRoleModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminPage>
    </AdminLayout>
  )
}
