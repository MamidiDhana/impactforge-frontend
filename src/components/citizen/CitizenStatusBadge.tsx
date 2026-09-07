import type { CitizenProblemStatus } from '../../types'
import { StatusBadge } from '../common/StatusBadge'
export function CitizenStatusBadge({ status }: { status: CitizenProblemStatus }) { return <StatusBadge status={status} /> }