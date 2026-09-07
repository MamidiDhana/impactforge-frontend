import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from '../components/common/LoadingState'
interface ProtectedRouteProps { children: ReactNode }
export function ProtectedRoute({ children }: ProtectedRouteProps) { const { isAuthenticated, isInitialized } = useAuth(); const location = useLocation(); if (!isInitialized) return <LoadingState rows={1} />; if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />; return <>{children}</> }