import type { WorkspaceCapabilityGap } from '../types'

export interface FacultyExtendedGap extends WorkspaceCapabilityGap {
  description?: string
  suggestedPartnerType?: string
  impactRisk?: string
}

export const facultyCapabilityGaps: FacultyExtendedGap[] = [
  {
    id: 'wg1',
    project: 'Solar Water Monitoring Pilot',
    required: 'Industrial Telemetry Packaging & Enclosure',
    currentLevel: 'Custom Acrylic Case',
    missing: 'IP66 Weather-sealed Enclosure Fabrication',
    severity: 'High',
    suggestedAction: 'Request partner support from hardware incubator or precision MSME',
    suggestedPartnerType: 'MSME / Precision Manufacturing Partner',
    impactRisk: 'Sensors exposed to monsoon rains could fail in field conditions.',
    status: 'Open',
  },
  {
    id: 'wg2',
    project: 'Offline-First Digital STEM Library',
    required: 'Localized Marathi STEM Content Curation',
    currentLevel: 'Open educational repositories (English only)',
    missing: 'Vernacular Marathi secondary school science teacher curriculum alignment',
    severity: 'Medium',
    suggestedAction: 'Assign faculty education specialist from Pune University',
    suggestedPartnerType: 'Academic Specialist / Skilling NGO',
    impactRisk: 'Students in tribal hamlets cannot engage with purely English simulations.',
    status: 'Open',
  },
  {
    id: 'wg3',
    project: 'Rural Clinic Low-Bandwidth Tele-Triage',
    required: 'Clinical Protocol Compliance & DISHA/HIPAA Encryption',
    currentLevel: 'Plaintext offline SQLite database',
    missing: 'Encrypted patient vitals storage and key rotation protocol',
    severity: 'Critical',
    suggestedAction: 'Seek cybersecurity industry advisory or hospital IT partner',
    suggestedPartnerType: 'Technology Provider / Health IT',
    impactRisk: 'Patient health data could breach statutory digital health guidelines.',
    status: 'Open',
  },
  {
    id: 'wg4',
    project: 'Decentralized Organic Waste Bio-Digester',
    required: 'Automated Hydrogen Sulfide (H2S) Scrubber Media Recharging',
    currentLevel: 'Manual periodic chemical washing',
    missing: 'Regenerable iron-sponge filtration system',
    severity: 'Medium',
    suggestedAction: 'Procure commercial catalytic media through municipal grant',
    suggestedPartnerType: 'Municipal Corporation / Cleantech Supplier',
    impactRisk: 'Corrosive H2S gas accelerates burner nozzle degradation.',
    status: 'Open',
  },
]