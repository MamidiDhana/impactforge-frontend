import { CircleHelp, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLogo } from '../../components/common/AppLogo'
import { PageContainer } from '../../components/common/PageContainer'
import { useAuth } from '../../context/AuthContext'
import { ROLE_DASHBOARD_PATH } from '../../routes/rolePaths'

export function NotFoundPage() {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <PageContainer className="flex min-h-screen flex-col items-center justify-center text-center">
        <AppLogo />
        <div className="mt-8 grid size-16 place-items-center rounded-2xl bg-teal-50 text-[#187e8d] border border-teal-200">
          <CircleHelp size={32} />
        </div>
        <h1 className="mt-5 font-[Manrope] text-3xl font-extrabold text-[#13243b]">
          404 - Page Not Found
        </h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          The page or resource you requested could not be located. It might have moved or the address may be mistyped.
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
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </PageContainer>
    </div>
  )
}