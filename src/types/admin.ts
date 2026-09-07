import type { UserRole } from './index'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole | string
  organization: string
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending'
  lastActive: string
  joinedDate: string
  avatar?: string
}

export interface AdminRole {
  id: string
  name: string
  description: string
  usersCount: number
  isSystem: boolean
  permissions: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
    approve: boolean
    export: boolean
  }
}

export interface AdminOrganization {
  id: string
  name: string
  type: 'Universities' | 'Government Departments' | 'Industry Partners' | 'NGOs' | 'Research Institutions'
  contactPerson: string
  email: string
  registrationDate: string
  verificationStatus: 'Verified' | 'Pending' | 'Rejected' | 'More Info Required'
  documentsStatus: 'Verified' | 'Submitted' | 'Missing' | 'Pending'
  location: string
  website?: string
  legalId?: string
}

export interface TaxonomyCategory {
  id: string
  name: string
  type: 'Problem Categories' | 'Technology Categories' | 'Domain Categories' | 'Capability Categories' | 'Skill Tags'
  description: string
  itemCount: number
  parentCategory?: string
  tags: string[]
}

export interface AIModelInfo {
  id: string
  name: string
  purpose: string
  version: string
  status: 'Active' | 'Training' | 'Idle' | 'Maintenance' | 'Inactive'
  lastUpdated: string
  accuracy: number
  confidenceThreshold: number
  requestsToday: number
  avgLatency: string
  description: string
  architecture: string
}

export interface AdminAuditLog {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  module: 'Users' | 'Roles' | 'Organizations' | 'Taxonomy' | 'AI Engine' | 'Security' | 'Platform'
  description: string
  ipAddress: string
  status: 'Success' | 'Warning' | 'Failed'
}

export interface SystemHealthService {
  service: string
  category: 'Core' | 'Database' | 'AI Service' | 'Infrastructure' | 'Search'
  status: 'Operational' | 'Degraded' | 'Down'
  uptime: string
  responseTime: string
  errorRate: string
  lastChecked: string
}

export interface AdminSystemIncident {
  id: string
  title: string
  service: string
  status: 'Resolved' | 'Investigating' | 'Scheduled'
  time: string
  duration: string
  description: string
}

export interface AdminSettingsState {
  platformName: string
  supportEmail: string
  contactPhone: string
  defaultTimezone: string
  maintenanceMode: boolean
  emailNotifications: boolean
  newUserRegistration: boolean
  orgVerificationRequired: boolean
  mfaEnforced: boolean
  sessionTimeoutMinutes: number
  aiAutoCategorization: boolean
  aiSimilarityThreshold: number
  aiModelCaching: boolean
}
