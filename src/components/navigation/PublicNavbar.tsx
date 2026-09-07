import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { AppLogo } from '../common/AppLogo'
import { UserMenu } from './UserMenu'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Explore Problems', href: '/problems' },
  { label: 'Universities', href: '/universities' },
  { label: 'Partners', href: '/partners' },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const close = () => setOpen(false)
  const signOut = () => {
    logout()
    close()
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <AppLogo />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-[#12365a]' : 'text-slate-500 hover:text-[#12365a]'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {currentUser ? (
            <UserMenu
              user={currentUser}
              onProfile={() => navigate('/profile')}
              onLogout={signOut}
            />
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-[#12365a] hover:bg-slate-50"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#12365a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0e2b48]"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={close}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-[#e8f5f5] text-[#12365a]' : 'text-slate-600'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
            {currentUser ? (
              <>
                <UserMenu
                  user={currentUser}
                  onProfile={() => {
                    navigate('/profile')
                    close()
                  }}
                  onLogout={signOut}
                />
                <button
                  type="button"
                  onClick={signOut}
                  className="ml-auto rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-[#12365a]"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="flex-1 rounded-lg bg-[#12365a] px-3 py-2 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}