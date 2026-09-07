import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
interface RoleRouteProps { allowedRoles: UserRole[]; children: ReactNode }
export function RoleRoute({ allowedRoles, children }: RoleRouteProps) { const { isAuthenticated, currentUser } = useAuth(); if (!isAuthenticated || !currentUser) return <Navigate to="/login" replace />; if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/unauthorized" replace />; return <>{children}</> }