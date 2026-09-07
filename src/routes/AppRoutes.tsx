import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from '../components/common/LoadingState'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { ROLE_DASHBOARD_PATH } from './rolePaths'
import type { UserRole } from '../types'
import { HomePage } from '../pages/public/HomePage'
import { AboutPage } from '../pages/public/AboutPage'
import { HowItWorksPage } from '../pages/public/HowItWorksPage'
import { ExploreProblemsPage } from '../pages/public/ExploreProblemsPage'
import { ProblemDetailsPage } from '../pages/public/ProblemDetailsPage'
import { UniversitiesPage } from '../pages/public/UniversitiesPage'
import { PartnersPage } from '../pages/public/PartnersPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage'
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage'
import { NotFoundPage } from '../pages/auth/NotFoundPage'
import { CitizenDashboardPage } from '../pages/citizen/CitizenDashboardPage'
import { SubmitProblemPage } from '../pages/citizen/SubmitProblemPage'
import { MyProblemsPage } from '../pages/citizen/MyProblemsPage'
import { CitizenProblemDetailsPage } from '../pages/citizen/CitizenProblemDetailsPage'
import { SimilarProblemsPage } from '../pages/citizen/SimilarProblemsPage'
import { MyProjectsPage } from '../pages/citizen/MyProjectsPage'
import { FeedbackPage } from '../pages/citizen/FeedbackPage'
import { NotificationsPage } from '../pages/citizen/NotificationsPage'
import { CitizenProfilePage } from '../pages/citizen/CitizenProfilePage'
import { GovernmentDashboardPage } from '../pages/government/GovernmentDashboardPage'
import { ProblemQueuePage } from '../pages/government/ProblemQueuePage'
import { ProblemReviewPage } from '../pages/government/ProblemReviewPage'
import { ValidationPage } from '../pages/government/ValidationPage'
import { DuplicateAnalysisPage } from '../pages/government/DuplicateAnalysisPage'
import { ValidatedProblemsPage } from '../pages/government/ValidatedProblemsPage'
import { HEIMatchingPage } from '../pages/government/HEIMatchingPage'
import { GovernmentProjectsPage } from '../pages/government/GovernmentProjectsPage'
import { GovernmentAnalyticsPage } from '../pages/government/GovernmentAnalyticsPage'
import { AuditLogsPage } from '../pages/government/AuditLogsPage'
import { GovernmentNotificationsPage } from '../pages/government/GovernmentNotificationsPage'
import { GovernmentProfilePage } from '../pages/government/GovernmentProfilePage'
import { HEIDashboardPage } from '../pages/hei/HEIDashboardPage'
import { HEIProfilePage } from '../pages/hei/HEIProfilePage'
import { RecommendedProblemsPage } from '../pages/hei/RecommendedProblemsPage'
import { HEIProblemDetailsPage } from '../pages/hei/HEIProblemDetailsPage'
import { AcceptedChallengesPage } from '../pages/hei/AcceptedChallengesPage'
import { FacultyPage } from '../pages/hei/FacultyPage'
import { ResourcesPage } from '../pages/hei/ResourcesPage'
import { CapabilityGapsPage } from '../pages/hei/CapabilityGapsPage'
import { HEIProjectsPage } from '../pages/hei/HEIProjectsPage'
import { CollaborationRequestsPage } from '../pages/hei/CollaborationRequestsPage'
import { HEINotificationsPage } from '../pages/hei/HEINotificationsPage'
import { PartnerDashboardPage } from '../pages/partner/PartnerDashboardPage'
import { PartnerProfilePage } from '../pages/partner/PartnerProfilePage'
import { RecommendedProjectsPage } from '../pages/partner/RecommendedProjectsPage'
import { PartnerProjectDetailsPage } from '../pages/partner/PartnerProjectDetailsPage'
import { CollaborationRequestsPage as PartnerCollaborationRequestsPage } from '../pages/partner/CollaborationRequestsPage'
import { ActiveCollaborationsPage } from '../pages/partner/ActiveCollaborationsPage'
import { SupportedProjectsPage } from '../pages/partner/SupportedProjectsPage'
import { PartnerImpactPage } from '../pages/partner/PartnerImpactPage'
import { PartnerNotificationsPage } from '../pages/partner/PartnerNotificationsPage'
import { PartnerResourcesPage } from '../pages/partner/PartnerResourcesPage'
import { PartnerSettingsPage } from '../pages/partner/PartnerSettingsPage'
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage'
import { FacultyProfilePage } from '../pages/faculty/FacultyProfilePage'
import { FacultyProjectsPage } from '../pages/faculty/FacultyProjectsPage'
import { FacultyProjectDetailsPage } from '../pages/faculty/FacultyProjectDetailsPage'
import { FacultyTeamsPage } from '../pages/faculty/FacultyTeamsPage'
import { MilestonesPage } from '../pages/faculty/MilestonesPage'
import { FacultyCapabilityGapsPage } from '../pages/faculty/FacultyCapabilityGapsPage'
import { FacultyNotificationsPage } from '../pages/faculty/FacultyNotificationsPage'
import { ProjectsPage } from '../pages/project/ProjectsPage'
import { ProjectWorkspacePage } from '../pages/project/ProjectWorkspacePage'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '../pages/admin/AdminUsersPage'
import { AdminRolesPage } from '../pages/admin/AdminRolesPage'
import { AdminOrganizationsPage } from '../pages/admin/AdminOrganizationsPage'
import { AdminTaxonomyPage } from '../pages/admin/AdminTaxonomyPage'
import { AdminAIModelsPage } from '../pages/admin/AdminAIModelsPage'
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage'
import { AdminSystemHealthPage } from '../pages/admin/AdminSystemHealthPage'
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage'

import { CitizenTrackProblemPage } from '../pages/citizen/CitizenTrackProblemPage'
import { AdminHEIRegistryPage } from '../pages/admin/AdminHEIRegistryPage'
import { AdminPartnerRegistryPage } from '../pages/admin/AdminPartnerRegistryPage'

function AuthOnlyRoute({ children }: { children: ReactNode }) { const { isAuthenticated, isInitialized, currentUser } = useAuth(); if (!isInitialized) return <LoadingState rows={1} />; return isAuthenticated && currentUser ? <Navigate to={ROLE_DASHBOARD_PATH[currentUser.role]} replace /> : <>{children}</> }
function roleRoute(role: UserRole, children: ReactNode) { return <ProtectedRoute><RoleRoute allowedRoles={[role]}>{children}</RoleRoute></ProtectedRoute> }
function ProjectIndexRedirect() { const { id } = useParams(); return <Navigate to={`/projects/${id}/overview`} replace /> }

function ProfileRedirect() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  const profilePaths: Record<UserRole, string> = {
    citizen: '/citizen/profile',
    government: '/government/profile',
    hei: '/hei/profile',
    faculty: '/faculty/profile',
    partner: '/partner/profile',
    admin: '/admin/settings',
  }
  return <Navigate to={profilePaths[currentUser.role]} replace />
}

function NotificationsRedirect() {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  const notificationPaths: Record<UserRole, string> = {
    citizen: '/citizen/notifications',
    government: '/government/notifications',
    hei: '/hei/notifications',
    faculty: '/faculty/notifications',
    partner: '/partner/notifications',
    admin: '/admin/audit-logs',
  }
  return <Navigate to={notificationPaths[currentUser.role]} replace />
}

export function AppRoutes() { return <Routes>
  <Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/how-it-works" element={<HowItWorksPage />} /><Route path="/problems" element={<ExploreProblemsPage />} /><Route path="/problems/:id" element={<ProblemDetailsPage />} /><Route path="/universities" element={<UniversitiesPage />} /><Route path="/partners" element={<PartnersPage />} />
  <Route path="/login" element={<AuthOnlyRoute><LoginPage /></AuthOnlyRoute>} /><Route path="/register" element={<AuthOnlyRoute><RegisterPage /></AuthOnlyRoute>} /><Route path="/forgot-password" element={<AuthOnlyRoute><ForgotPasswordPage /></AuthOnlyRoute>} /><Route path="/reset-password" element={<AuthOnlyRoute><ResetPasswordPage /></AuthOnlyRoute>} />
  <Route path="/citizen/dashboard" element={roleRoute('citizen', <CitizenDashboardPage />)} />
  <Route path="/citizen/submit-problem" element={roleRoute('citizen', <SubmitProblemPage />)} />
  <Route path="/citizen/report-problem" element={roleRoute('citizen', <SubmitProblemPage />)} />
  <Route path="/citizen/track" element={roleRoute('citizen', <CitizenTrackProblemPage />)} />
  <Route path="/citizen/track/:trackId" element={roleRoute('citizen', <CitizenTrackProblemPage />)} />
  <Route path="/citizen/problems" element={roleRoute('citizen', <MyProblemsPage />)} />
  <Route path="/citizen/problems/:id" element={roleRoute('citizen', <CitizenProblemDetailsPage />)} />
  <Route path="/citizen/problems/:id/similar" element={roleRoute('citizen', <SimilarProblemsPage />)} />
  <Route path="/citizen/projects" element={roleRoute('citizen', <MyProjectsPage />)} />
  <Route path="/citizen/feedback" element={roleRoute('citizen', <FeedbackPage />)} />
  <Route path="/citizen/notifications" element={roleRoute('citizen', <NotificationsPage />)} />
  <Route path="/citizen/profile" element={roleRoute('citizen', <CitizenProfilePage />)} />
  <Route path="/citizen/settings" element={<Navigate to="/citizen/dashboard" replace />} />
  <Route path="/government/dashboard" element={roleRoute('government', <GovernmentDashboardPage />)} />
  <Route path="/government/problem-queue" element={roleRoute('government', <ProblemQueuePage />)} />
  <Route path="/government/problems/:id/review" element={roleRoute('government', <ProblemReviewPage />)} />
  <Route path="/government/validation" element={roleRoute('government', <ValidationPage />)} />
  <Route path="/government/duplicate-analysis" element={roleRoute('government', <DuplicateAnalysisPage />)} />
  <Route path="/government/validated-problems" element={roleRoute('government', <ValidatedProblemsPage />)} />
  <Route path="/government/hei-matching" element={roleRoute('government', <HEIMatchingPage />)} />
  <Route path="/government/projects" element={roleRoute('government', <GovernmentProjectsPage />)} />
  <Route path="/government/analytics" element={roleRoute('government', <GovernmentAnalyticsPage />)} />
  <Route path="/government/audit-logs" element={roleRoute('government', <AuditLogsPage />)} />
  <Route path="/government/users" element={<Navigate to="/government/dashboard" replace />} />
  <Route path="/government/organizations" element={<Navigate to="/government/dashboard" replace />} />
  <Route path="/government/notifications" element={roleRoute('government', <GovernmentNotificationsPage />)} />
  <Route path="/government/profile" element={roleRoute('government', <GovernmentProfilePage />)} />
  <Route path="/government/settings" element={<Navigate to="/government/dashboard" replace />} />
  <Route path="/hei/dashboard" element={roleRoute('hei', <HEIDashboardPage />)} /><Route path="/hei/profile" element={roleRoute('hei', <HEIProfilePage />)} /><Route path="/hei/recommended-problems" element={roleRoute('hei', <RecommendedProblemsPage />)} /><Route path="/hei/problems/:id" element={roleRoute('hei', <HEIProblemDetailsPage />)} /><Route path="/hei/accepted-challenges" element={roleRoute('hei', <AcceptedChallengesPage />)} /><Route path="/hei/faculty" element={roleRoute('hei', <FacultyPage />)} /><Route path="/hei/resources" element={roleRoute('hei', <ResourcesPage />)} /><Route path="/hei/teams" element={<Navigate to="/hei/dashboard" replace />} /><Route path="/hei/capability-gaps" element={roleRoute('hei', <CapabilityGapsPage />)} /><Route path="/hei/progress" element={roleRoute('hei', <CapabilityGapsPage />)} /><Route path="/hei/projects" element={roleRoute('hei', <HEIProjectsPage />)} /><Route path="/hei/collaboration-requests" element={roleRoute('hei', <CollaborationRequestsPage />)} /><Route path="/hei/notifications" element={roleRoute('hei', <HEINotificationsPage />)} /><Route path="/hei/settings" element={<Navigate to="/hei/dashboard" replace />} />
  <Route path="/partner/dashboard" element={roleRoute('partner', <PartnerDashboardPage />)} /><Route path="/partner/profile" element={roleRoute('partner', <PartnerProfilePage />)} /><Route path="/partner/recommended-projects" element={roleRoute('partner', <RecommendedProjectsPage />)} /><Route path="/partner/project-details" element={roleRoute('partner', <PartnerProjectDetailsPage />)} /><Route path="/partner/project-details/:id" element={roleRoute('partner', <PartnerProjectDetailsPage />)} /><Route path="/partner/projects/:id" element={roleRoute('partner', <PartnerProjectDetailsPage />)} /><Route path="/partner/collaboration-requests" element={roleRoute('partner', <PartnerCollaborationRequestsPage />)} /><Route path="/partner/active-collaborations" element={roleRoute('partner', <ActiveCollaborationsPage />)} /><Route path="/partner/supported-projects" element={roleRoute('partner', <SupportedProjectsPage />)} /><Route path="/partner/resources" element={roleRoute('partner', <PartnerResourcesPage />)} /><Route path="/partner/impact" element={roleRoute('partner', <PartnerImpactPage />)} /><Route path="/partner/notifications" element={roleRoute('partner', <PartnerNotificationsPage />)} /><Route path="/partner/settings" element={roleRoute('partner', <PartnerSettingsPage />)} />
  <Route path="/faculty/dashboard" element={roleRoute('faculty', <FacultyDashboardPage />)} /><Route path="/faculty/profile" element={roleRoute('faculty', <FacultyProfilePage />)} /><Route path="/faculty/projects" element={roleRoute('faculty', <FacultyProjectsPage />)} /><Route path="/faculty/projects/:id" element={roleRoute('faculty', <FacultyProjectDetailsPage />)} /><Route path="/faculty/guidance" element={roleRoute('faculty', <FacultyProjectsPage />)} /><Route path="/faculty/teams" element={roleRoute('faculty', <FacultyTeamsPage />)} /><Route path="/faculty/milestones" element={roleRoute('faculty', <MilestonesPage />)} /><Route path="/faculty/capability-gaps" element={roleRoute('faculty', <FacultyCapabilityGapsPage />)} /><Route path="/faculty/resources" element={roleRoute('faculty', <FacultyCapabilityGapsPage />)} /><Route path="/faculty/reports" element={roleRoute('faculty', <MilestonesPage />)} /><Route path="/faculty/notifications" element={roleRoute('faculty', <FacultyNotificationsPage />)} /><Route path="/faculty/settings" element={<Navigate to="/faculty/dashboard" replace />} />
  <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} /><Route path="/projects/:id" element={<ProtectedRoute><ProjectIndexRedirect /></ProtectedRoute>} /><Route path="/projects/:id/overview" element={<ProtectedRoute><ProjectWorkspacePage section="overview" /></ProtectedRoute>} /><Route path="/projects/:id/team" element={<ProtectedRoute><ProjectWorkspacePage section="team" /></ProtectedRoute>} /><Route path="/projects/:id/milestones" element={<ProtectedRoute><ProjectWorkspacePage section="milestones" /></ProtectedRoute>} /><Route path="/projects/:id/tasks" element={<ProtectedRoute><ProjectWorkspacePage section="tasks" /></ProtectedRoute>} /><Route path="/projects/:id/documents" element={<ProtectedRoute><ProjectWorkspacePage section="documents" /></ProtectedRoute>} /><Route path="/projects/:id/discussions" element={<ProtectedRoute><ProjectWorkspacePage section="discussions" /></ProtectedRoute>} /><Route path="/projects/:id/capability-gaps" element={<ProtectedRoute><ProjectWorkspacePage section="capability-gaps" /></ProtectedRoute>} /><Route path="/projects/:id/partners" element={<ProtectedRoute><ProjectWorkspacePage section="partners" /></ProtectedRoute>} /><Route path="/projects/:id/feedback" element={<ProtectedRoute><ProjectWorkspacePage section="feedback" /></ProtectedRoute>} /><Route path="/projects/:id/impact" element={<ProtectedRoute><ProjectWorkspacePage section="impact" /></ProtectedRoute>} />
  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="/admin/dashboard" element={roleRoute('admin', <AdminDashboardPage />)} />
  <Route path="/admin/users" element={roleRoute('admin', <AdminUsersPage />)} />
  <Route path="/admin/roles" element={roleRoute('admin', <AdminRolesPage />)} />
  <Route path="/admin/organizations" element={roleRoute('admin', <AdminOrganizationsPage />)} />
  <Route path="/admin/hei-registry" element={roleRoute('admin', <AdminHEIRegistryPage />)} />
  <Route path="/admin/partner-registry" element={roleRoute('admin', <AdminPartnerRegistryPage />)} />
  <Route path="/admin/taxonomy" element={roleRoute('admin', <AdminTaxonomyPage />)} />
  <Route path="/admin/ai-models" element={roleRoute('admin', <AdminAIModelsPage />)} />
  <Route path="/admin/audit-logs" element={roleRoute('admin', <AdminAuditLogsPage />)} />
  <Route path="/admin/system-health" element={roleRoute('admin', <AdminSystemHealthPage />)} />
  <Route path="/admin/settings" element={roleRoute('admin', <AdminSettingsPage />)} />
  <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
  <Route path="/student" element={<Navigate to="/faculty/dashboard" replace />} />
  <Route path="/student/*" element={<Navigate to="/faculty/dashboard" replace />} />
  <Route path="/profile" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
  <Route path="/notifications" element={<ProtectedRoute><NotificationsRedirect /></ProtectedRoute>} />
  <Route path="/unauthorized" element={<UnauthorizedPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes> }
