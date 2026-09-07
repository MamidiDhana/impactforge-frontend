import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import type { User } from '../../types'
interface UserMenuProps { user: User; onProfile?: () => void; onLogout?: () => void }
export function UserMenu({ user, onProfile, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100"
      >
        <span className="grid size-8 place-items-center rounded-full bg-[#d9eeee] text-sm font-bold text-[#12365a]">
          {user.name.charAt(0)}
        </span>
        <span className="hidden max-w-32 text-sm sm:block">
          <span className="block truncate font-semibold text-slate-700">{user.name}</span>
          <span className="block truncate text-xs text-slate-500">{user.role}</span>
        </span>
        <ChevronDown size={15} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-slate-700">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.organization}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onProfile?.()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <UserRound size={15} />Profile
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onLogout()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} />Log out
            </button>
          )}
        </div>
      )}
    </div>
  )
}