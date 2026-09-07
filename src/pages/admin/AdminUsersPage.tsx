import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Unlock,
  Users,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'
import { EmptyState } from '../../components/common/EmptyState'
import { adminUsers as initialUsers } from '../../data/adminMockData'
import type { AdminUser } from '../../types/admin'

const ROLES_LIST = [
  'All',
  'admin',
  'government',
  'hei',
  'faculty',
  'partner',
  'citizen',
]

const STATUS_LIST = ['All', 'Active', 'Inactive', 'Suspended', 'Pending']

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedOrg, setSelectedOrg] = useState('All')

  // Modals & form state
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  // New user form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('citizen')
  const [newOrg, setNewOrg] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Unique organizations list
  const organizationsList = useMemo(() => {
    return ['All', ...Array.from(new Set(users.map((u) => u.organization)))]
  }, [users])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.organization.toLowerCase().includes(search.toLowerCase())

      const matchesRole = selectedRole === 'All' || u.role === selectedRole
      const matchesStatus = selectedStatus === 'All' || u.status === selectedStatus
      const matchesOrg = selectedOrg === 'All' || u.organization === selectedOrg

      return matchesSearch && matchesRole && matchesStatus && matchesOrg
    })
  }, [users, search, selectedRole, selectedStatus, selectedOrg])

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  // Handlers
  const handleToggleStatus = (u: AdminUser) => {
    const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active'
    setUsers((prev) =>
      prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item))
    )
    setFeedback(`User ${u.name} has been ${nextStatus === 'Active' ? 'activated' : 'suspended'}.`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setUsers((prev) =>
      prev.map((item) => (item.id === editingUser.id ? editingUser : item))
    )
    setFeedback(`User profile for "${editingUser.name}" updated successfully.`)
    setEditingUser(null)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return

    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      organization: newOrg.trim() || 'Independent Citizen',
      status: 'Active',
      lastActive: 'Just now',
      joinedDate: 'Just now',
      avatar: newName.charAt(0).toUpperCase(),
    }

    setUsers([created, ...users])
    setAddUserOpen(false)
    setNewName('')
    setNewEmail('')
    setNewOrg('')
    setFeedback(`New user "${created.name}" invited successfully!`)
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedRole('All')
    setSelectedStatus('All')
    setSelectedOrg('All')
    setCurrentPage(1)
  }

  return (
    <AdminLayout title="Users">
      <AdminPage
        title="Users"
        description="Inspect, provision, and administer user profiles and roles."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Users' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#12365a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            <Plus size={14} />
            Invite User
          </button>
        }
      >
        <div className="space-y-6">
          {/* Feedback banner */}
          {feedback && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 animate-in fade-in"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by full name, email address, or organization..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#187e8d] focus:outline-none"
                />
              </div>

              {(search || selectedRole !== 'All' || selectedStatus !== 'All' || selectedOrg !== 'All') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-slate-100 text-xs">
              {/* Role filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Filter by Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {ROLES_LIST.map((r) => (
                    <option key={r} value={r}>
                      {r === 'All' ? 'All Roles' : r.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organization filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500">Filter by Organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => {
                    setSelectedOrg(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 focus:border-[#187e8d] focus:outline-none truncate"
                >
                  {organizationsList.map((org) => (
                    <option key={org} value={org}>
                      {org === 'All' ? 'All Organizations' : org}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users match criteria"
              description="Adjust your search terms or filters to locate registered accounts."
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">User & Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Organization</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Active</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedUsers.map((u) => {
                      const isActive = u.status === 'Active'
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 place-items-center rounded-full bg-[#d9eeee] font-bold text-[#12365a] text-xs">
                                {u.avatar ?? u.name.charAt(0)}
                              </span>
                              <div>
                                <p className="font-bold text-slate-800">{u.name}</p>
                                <p className="text-[11px] text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-[220px] truncate">
                            <span className="font-medium text-slate-700">{u.organization}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                u.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : u.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                            {u.lastActive}
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewUser(u)}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                title="View details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingUser({ ...u })}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                title="Edit user"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className={`rounded p-1.5 ${
                                  isActive
                                    ? 'text-amber-600 hover:bg-amber-50'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={isActive ? 'Suspend user' : 'Activate user'}
                              >
                                {isActive ? <Lock size={14} /> : <Unlock size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredUsers.length)} to{' '}
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>
                  <span className="font-bold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1. View User Modal */}
        {viewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-[#d9eeee] font-[Manrope] text-lg font-bold text-[#12365a]">
                  {viewUser.avatar ?? viewUser.name.charAt(0)}
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    {viewUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">{viewUser.email}</p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100 text-xs text-slate-600">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Assigned Role:</span>
                  <span className="font-bold text-slate-800 uppercase">{viewUser.role}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Organization:</span>
                  <span className="font-semibold text-slate-800 text-right">{viewUser.organization}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Account Status:</span>
                  <span className="font-bold text-emerald-700">{viewUser.status}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Member Since:</span>
                  <span className="text-slate-700">{viewUser.joinedDate}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-400">Last Seen Active:</span>
                  <span className="text-slate-700">{viewUser.lastActive}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewUser(null)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                Edit User Account
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update credentials, role authority, and organizational affiliation.
              </p>

              <form onSubmit={handleSaveEditUser} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700">Assigned Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      {ROLES_LIST.filter((r) => r !== 'All').map((r) => (
                        <option key={r} value={r}>
                          {r.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700">Account Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          status: e.target.value as AdminUser['status'],
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      {STATUS_LIST.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Organization Name</label>
                  <input
                    type="text"
                    value={editingUser.organization}
                    onChange={(e) => setEditingUser({ ...editingUser, organization: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
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

        {/* 3. Invite User Modal */}
        {addUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAddUserOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-[#187e8d]">
                  <Shield size={20} />
                </span>
                <div>
                  <h3 className="font-[Manrope] text-lg font-bold text-[#13243b]">
                    Invite Stakeholder User
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provisions login access and sends an onboarding link.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh@university.edu.in"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-[#187e8d] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    >
                      {ROLES_LIST.filter((r) => r !== 'All').map((r) => (
                        <option key={r} value={r}>
                          {r.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700">Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. IIT Madras"
                      value={newOrg}
                      onChange={(e) => setNewOrg(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-[#187e8d] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddUserOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#12365a] px-4 py-2 font-bold text-white hover:bg-[#1a4a7a]"
                  >
                    Send Invitation
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
