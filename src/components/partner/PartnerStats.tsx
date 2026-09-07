import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../common/StatCard'

export interface PartnerStatsProps {
  recommendedCount?: number
  pendingRequestsCount?: number
  activeCollaborationsCount?: number
  supportedProjectsCount?: number
  resourcesContributedCount?: number
  communitiesReachedCount?: string | number
  onCardClick?: (type: string) => void
}

export function PartnerStats({
  recommendedCount = 6,
  pendingRequestsCount = 3,
  activeCollaborationsCount = 3,
  supportedProjectsCount = 3,
  resourcesContributedCount = 9,
  communitiesReachedCount = '41,400',
  onCardClick,
}: PartnerStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div onClick={() => onCardClick?.('recommended')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Recommended Projects"
          value={recommendedCount}
          description="High-affinity AI match"
          icon={Sparkles}
        />
      </div>

      <div onClick={() => onCardClick?.('pending')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Pending Requests"
          value={pendingRequestsCount}
          description="Awaiting action or feedback"
          icon={Clock}
        />
      </div>

      <div onClick={() => onCardClick?.('active')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Active Collaborations"
          value={activeCollaborationsCount}
          description="Currently in progress"
          icon={BriefcaseBusiness}
        />
      </div>

      <div onClick={() => onCardClick?.('supported')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Supported Projects"
          value={supportedProjectsCount}
          description="Completed & verified outcomes"
          icon={CheckCircle2}
        />
      </div>

      <div onClick={() => onCardClick?.('resources')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Resources Contributed"
          value={resourcesContributedCount}
          description="Committed & available"
          icon={Layers}
        />
      </div>

      <div onClick={() => onCardClick?.('communities')} className={onCardClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}>
        <StatCard
          label="Communities Reached"
          value={communitiesReachedCount}
          description="Citizens impacted across states"
          icon={Building2}
        />
      </div>
    </div>
  )
}
