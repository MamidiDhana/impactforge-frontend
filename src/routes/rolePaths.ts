import type { UserRole } from '../types'

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  citizen: '/citizen/dashboard',
  government: '/government/dashboard',
  hei: '/university',
  faculty: '/university/faculty',
  partner: '/partner/dashboard',
  admin: '/admin/dashboard',
}