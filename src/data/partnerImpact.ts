import type { PartnerImpactRecord } from '../types'

export interface PartnerImpactOverview {
  totalProjectsSupported: number
  totalFundingContributed: string
  totalTechnicalHours: number
  totalBeneficiariesReached: number
  communitiesSupported: number
  projectsCompleted: number
  resourcesProvided: number
  impactScore: number
}

export const partnerImpactOverview: PartnerImpactOverview = {
  totalProjectsSupported: 6,
  totalFundingContributed: '₹12.4L',
  totalTechnicalHours: 680,
  totalBeneficiariesReached: 41400,
  communitiesSupported: 28,
  projectsCompleted: 3,
  resourcesProvided: 18,
  impactScore: 94,
}

export const categoryContributionBreakdown = [
  { category: 'Water and Sanitation', projects: 2, share: 38, value: '₹4.8L + 240 hrs' },
  { category: 'Education & STEM', projects: 1, share: 25, value: '₹3.5L + 120 hrs' },
  { category: 'Healthcare', projects: 1, share: 15, value: '₹1.9L + 80 hrs' },
  { category: 'Waste Management', projects: 1, share: 12, value: '₹1.2L + 140 hrs' },
  { category: 'Civic Infrastructure & Safety', projects: 1, share: 10, value: '₹1.0L + 100 hrs' },
]

export const monthlyContributionActivity = [
  { month: 'Mar 2026', hours: 45, funding: 120000, milestones: 2 },
  { month: 'Apr 2026', hours: 70, funding: 80000, milestones: 3 },
  { month: 'May 2026', hours: 110, funding: 150000, milestones: 4 },
  { month: 'Jun 2026', hours: 140, funding: 420000, milestones: 5 },
  { month: 'Jul 2026', hours: 165, funding: 180000, milestones: 3 },
  { month: 'Aug 2026', hours: 150, funding: 290000, milestones: 4 },
]

export const beneficiaryTestimonials = [
  {
    id: 't1',
    quote: 'The automated fluoride sensors sponsored by CivicGrid gave our panchayat peace of mind. Now, when a filtration cylinder saturates, the operator is alerted before dangerous water reaches a single tap.',
    author: 'Sunil Gowda',
    role: 'Panchayat President, Kolar District',
    project: 'Solar Water Monitoring Pilot',
    rating: 5,
  },
  {
    id: 't2',
    quote: 'Having senior IoT engineers from industry pair with our undergraduate innovators accelerated our hardware development cycle from 8 months to 6 weeks.',
    author: 'Dr. Meera Nair',
    role: 'Faculty Lead, NITK Surathkal',
    project: 'Solar Water Monitoring Pilot',
    rating: 5,
  },
  {
    id: 't3',
    quote: 'Speeding around our school gate was a nightmare every morning. The smart LED crosswalk signals funded by the partner cut violations down to almost zero within the first week of deployment.',
    author: 'Pravat Patnaik',
    role: 'Headmaster, Govt High School, Bhubaneswar',
    project: 'Safe School Crossing Redesign',
    rating: 5,
  },
]

export const partnerImpact: PartnerImpactRecord[] = [
  {
    id: 'pi1',
    project: 'Safe School Crossing Redesign & Traffic Telemetry',
    contributionType: 'Field Telemetry & Traffic AI',
    value: '₹4,20,000 + 60 hrs',
    beneficiaries: 8500,
    outcome: 'Zero student pedestrian collisions and 78% driver speed reduction across 4 school crossings.',
    status: 'Verified Impact',
  },
  {
    id: 'pi2',
    project: 'Solar Water Monitoring Pilot',
    contributionType: 'Sensor Kits & Edge Firmware Mentorship',
    value: '₹3,60,000 demo value + 120 hrs',
    beneficiaries: 18000,
    outcome: 'Real-time telemetry operational in 15 panchayats, cutting contaminated water alerts from 3 weeks to 90 minutes.',
    status: 'Active Field Pilot',
  },
  {
    id: 'pi3',
    project: 'Community Fluoride Filter Recharging Network',
    contributionType: 'IoT Loggers & Saturation Analysis',
    value: '₹2,80,000 + 80 hrs',
    beneficiaries: 12400,
    outcome: 'Prevented filter saturation overflow across 8 habitations; safe drinking water compliance maintained at 99.4%.',
    status: 'Verified Impact',
  },
  {
    id: 'pi4',
    project: 'Offline-First Digital STEM Library',
    contributionType: 'CSR Hardware Seed Grant',
    value: '₹3,50,000 grant',
    beneficiaries: 6400,
    outcome: 'Provisioned 20 micro-server units for tribal ashram schools; content access active for over 6,000 children.',
    status: 'In Progress',
  },
]