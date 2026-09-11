import { useState, useMemo } from 'react'
import {
  Search,
  UserPlus,
  Trash2,
  Edit2,
  Info,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Modal } from '../common/Modal'
import { useAdmin, type AdminUser, type AdminUserRole, type AdminUserStatus } from '../../context/AdminContext'

const ROLES: AdminUserRole[] = [
  'Citizen',
  'Government Official',
  'HEI',
  'Faculty',
  'Partner',
  'Super Admin',
]

const STATUSES: AdminUserStatus[] = ['Active', 'Suspended', 'Pending']

export function AdminUsersTable() {
  const { users, addUser, updateUser, deleteUser } = useAdmin()

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Add / Edit user modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminUserRole>('Citizen')
  const [organization, setOrganization] = useState('')
  const [status, setStatus] = useState<AdminUserStatus>('Active')
  const [formError, setFormError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Delete confirmation
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = u.name.toLowerCase().includes(q)
        const matchEmail = u.email.toLowerCase().includes(q)
        const matchOrg = u.organization.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchOrg) return false
      }

      if (roleFilter && u.role !== roleFilter) {
        return false
      }

      if (statusFilter && u.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const openCreateModal = () => {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setRole('Citizen')
    setOrganization('')
    setStatus('Active')
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (u: AdminUser) => {
    setEditingUserId(u.id)
    setName(u.name)
    setEmail(u.email)
    setRole(u.role)
    setOrganization(u.organization)
    setStatus(u.status)
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Name is required.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid email address is required.')
      return
    }
    if (!organization.trim()) {
      setFormError('Organization / Community name is required.')
      return
    }

    if (editingUserId) {
      updateUser(editingUserId, {
        name: name.trim(),
        email: email.trim(),
        role,
        organization: organization.trim(),
        status,
      })
      showToast(`User "${name}" updated successfully.`)
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        organization: organization.trim(),
        status,
      })
      showToast(`User "${name}" created successfully.`)
    }

    setIsModalOpen(false)
  }

  const confirmDelete = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id)
      showToast(`User "${deletingUser.name}" was removed.`)
      setDeletingUser(null)
    }
  }

  const getStatusBadge = (st: AdminUserStatus) => {
    switch (st) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      case 'Suspended':
        return 'bg-red-50 text-red-700 ring-red-200'
      case 'Pending':
        return 'bg-amber-50 text-amber-700 ring-amber-200'
    }
  }

  const getRoleBadge = (r: AdminUserRole) => {
    switch (r) {
      case 'Super Admin':
        return 'bg-rose-50 text-rose-800 ring-rose-200'
      case 'Government Official':
        return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
      case 'HEI':
        return 'bg-teal-50 text-teal-800 ring-teal-200'
      case 'Faculty':
        return 'bg-blue-50 text-blue-700 ring-blue-200'
      case 'Partner':
        return 'bg-purple-50 text-purple-700 ring-purple-200'
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast message */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MVP Notice as required by Requirement 5 */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-[11px] leading-relaxed text-blue-800">
          User management is currently demo-only because no user-management backend API is available yet. Changes are persisted in your browser&apos;s local storage.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name, email, or organization..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20 sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0e2b48]"
          >
            <UserPlus size={14} />
            <span>Add Demo User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || roleFilter || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('')
                setStatusFilter('')
              }}
              className="ml-auto text-xs font-bold text-[#187e8d] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 pl-4 pr-2">User Name</th>
                <th className="px-3 py-3.5">Email</th>
                <th className="px-3 py-3.5">Role</th>
                <th className="px-3 py-3.5">Organization</th>
                <th className="px-3 py-3.5">Account Status</th>
                <th className="px-3 py-3.5">Created Date</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching search filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/70">
                    <td className="py-3 pl-4 pr-2 font-semibold text-slate-900">
                      {u.name}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-600">
                      {u.email}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{u.organization}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${getStatusBadge(
                          u.status
                        )}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUser(u)}
                          title="Delete User"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUserId ? 'Edit Stakeholder User' : 'Add New Demo Stakeholder'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label htmlFor="user-name" className="mb-1 block text-xs font-bold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Murmu"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div>
            <label htmlFor="user-email" className="mb-1 block text-xs font-bold text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@jharkhand.in"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="user-role" className="mb-1 block text-xs font-bold text-slate-700">
                Platform Role <span className="text-red-500">*</span>
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminUserRole)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="user-status" className="mb-1 block text-xs font-bold text-slate-700">
                Account Status
              </label>
              <select
                id="user-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminUserStatus)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="user-org" className="mb-1 block text-xs font-bold text-slate-700">
              Organization / Department / Community <span className="text-red-500">*</span>
            </label>
            <input
              id="user-org"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. District Rural Development Agency (DRDA)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#187e8d] focus:ring-2 focus:ring-[#187e8d]/20"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e2b48]"
            >
              <span>{editingUserId ? 'Save Changes' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        open={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Confirm User Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete demo user <strong>&ldquo;{deletingUser?.name}&rdquo;</strong> ({deletingUser?.email})? This action will remove the record from your browser storage.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeletingUser(null)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
