import { WorkspaceNotificationsPage } from '../workspace/WorkspaceNotificationsPage'
import { facultyNotifications } from '../../data/facultyNotifications'
export function FacultyNotificationsPage() { return <WorkspaceNotificationsPage role="faculty" initialItems={facultyNotifications} /> }