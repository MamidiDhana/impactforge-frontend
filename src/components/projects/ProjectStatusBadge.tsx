import type { ProjectStatus } from '../../types'
import { StatusBadge } from '../common/StatusBadge'
interface ProjectStatusBadgeProps { status: ProjectStatus }
export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) { return <StatusBadge status={status} /> }