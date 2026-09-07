import { ShieldAlert, ArrowLeft, LayoutDashboard, LogIn } from 'lucide-react'
import { Navigate, Link } from 'react-router-dom'
import { AppLogo } from '../../components/common/AppLogo'
import { PageContainer } from '../../components/common/PageContainer'
import { useAuth } from '../../context/AuthContext'
import { ROLE_DASHBOARD_PATH } from '../../routes/rolePaths'

export function UnauthorizedPage() {
  const { currentUser } = useAuth()

  if ((currentUser?.role as string) === 'student') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <PageContainer className="flex min-h-screen flex-col items-center justify-center text-center">
        <AppLogo />
        <div className="mt-8 grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <ShieldAlert size={32} />
        </div>
        <h1 className="mt-5 font-[Manrope] text-3xl font-extrabold text-[#13243b]">
          Restricted Area
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {currentUser ? (
            <>
              You are signed in as <strong className="text-slate-800 font-semibold">{currentUser.name}</strong> ({currentUser.role}). This section requires elevated or different role permissions.
            </>
          ) : (
            'You do not have permission to access this protected resource. Please sign in with an authorized account.'
          )}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {currentUser && (
            <Link
              to={ROLE_DASHBOARD_PATH[currentUser.role]}
              className="inline-flex items-center gap-2 rounded-lg bg-[#12365a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a4a7a] shadow-xs"
            >
              <LayoutDashboard size={16} />
              Go to Your Dashboard
            </Link>
          )}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <LogIn size={16} />
            Switch Account
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </PageContainer>
    </div>
  )
}