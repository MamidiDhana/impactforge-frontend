import type { ProblemStatus } from '../../types'
import { StatusBadge } from '../common/StatusBadge'
interface ProblemStatusBadgeProps { status: ProblemStatus }
export function ProblemStatusBadge({ status }: ProblemStatusBadgeProps) { return <StatusBadge status={status} /> }