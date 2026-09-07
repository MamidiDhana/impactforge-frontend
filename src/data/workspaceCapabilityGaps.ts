import type { WorkspaceCapabilityGap } from '../types'

export interface ExtendedCapabilityGap extends WorkspaceCapabilityGap {
  description?: string
  suggestedPartnerType?: string
  impactRisk?: string
  dateIdentified?: string
}

export const workspaceCapabilityGaps: ExtendedCapabilityGap[] = [
  {
    id: 'pcg1',
    project: 'Solar Water Monitoring Pilot',
    required: 'Industrial Telemetry Gateway Packaging',
    currentLevel: 'Custom Acrylic Breadboard Case',
    missing: 'IP66 Weather-sealed and UV-stabilized Enclosure Fabrication',
    severity: 'High',
    suggestedAction: 'Partner with local MSME or Hardware Incubator for injection molding / CNC casing',
    suggestedPartnerType: 'MSME / Precision Manufacturing Partner',
    impactRisk: 'Sensors exposed to monsoon downpours could short-circuit without conformal coating.',
    dateIdentified: '14 Aug 2026',
    status: 'In Review',
  },
  {
    id: 'pcg2',
    project: 'Solar Water Monitoring Pilot',
    required: 'Edge Telemetry MQTT Ingress & Broker Hardening',
    currentLevel: 'Basic HTTP POST script',
    missing: 'TLS Mutual Authentication & Low-bandwidth packet compression',
    severity: 'Medium',
    suggestedAction: 'Utilize CivicGrid Technologies cloud broker credits and engineer mentorship',
    suggestedPartnerType: 'Industry / Technology Provider',
    impactRisk: 'High cellular data SIM cost and vulnerability to packet spoofing.',
    dateIdentified: '20 Aug 2026',
    status: 'Resolved',
  },
  {
    id: 'pcg3',
    project: 'Solar Water Monitoring Pilot',
    required: 'Kannada Community Engagement & Panchayat Liaison',
    currentLevel: 'Engineering students with basic regional fluency',
    missing: 'Formal Gram Panchayat civic resolution facilitation & operator training',
    severity: 'High',
    suggestedAction: 'Coordinate with Rural Development NGO or District Water Mission field facilitators',
    suggestedPartnerType: 'NGO / Grassroots Civic Partner',
    impactRisk: 'Village pump operators may bypass telemetry kiosk if value proposition is not explained.',
    dateIdentified: '22 Aug 2026',
    status: 'Searching',
  },
]