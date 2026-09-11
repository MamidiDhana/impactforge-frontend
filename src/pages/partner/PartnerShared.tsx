import type { ReactNode } from 'react'
import { PageContainer } from '../../components/common/PageContainer'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterBar } from '../../components/forms/FilterBar'
import type { BreadcrumbItem } from '../../components/common/Breadcrumbs'

export {
  PartnerStatusBadge,
  PartnerStats,
  ContributionSummary,
  ProjectRecommendationCard,
  PartnerProjectCard,
  CollaborationRequestCard,
  ResourceCard,
  PartnerImpactMetric,
  PartnerProfileForm,
  PartnerSidebar,
  ExpressInterestModal,
} from '../../components/partner'

interface PartnerPageProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  children: ReactNode
  action?: ReactNode
}

export function PartnerPage({
  title,
  description,
  breadcrumbs,
  children,
  action,
}: PartnerPageProps) {
  const finalBreadcrumbs =
    title === 'Industry Partnerships' || title === 'Partner'
      ? undefined
      : (breadcrumbs?.map((b) => (b.label === 'Dashboard' || b.label === 'Partner' ? { ...b, label: 'Industry Partnerships' } : b)) ?? [
          { label: 'Industry Partnerships', href: '/partner/dashboard' },
          { label: title },
        ])

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={finalBreadcrumbs}
        action={action}
      />
      {children}
    </PageContainer>
  )
}

export function PartnerFilters({
  search,
  setSearch,
  category,
  setCategory,
}: {
  search: string
  setSearch: (value: string) => void
  category: string
  setCategory: (value: string) => void
}) {
  return (
    <FilterBar
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          id: 'category',
          label: 'Category',
          value: category,
          options: [
            'All categories',
            'Water and Sanitation',
            'Education',
            'Healthcare',
            'Renewable Energy',
            'Waste Management',
            'Agriculture',
          ].map((value) => ({ label: value, value })),
          onChange: setCategory,
        },
      ]}
    />
  )
}