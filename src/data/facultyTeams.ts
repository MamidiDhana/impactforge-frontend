import type { WorkspaceTeam } from '../types'

export interface ExtendedWorkspaceTeam extends WorkspaceTeam {
  leadStudent?: string
  studentCount?: number
  meetingSchedule?: string
  completedMilestones?: number
}

export const facultyTeams: ExtendedWorkspaceTeam[] = [
  {
    id: 'wt1',
    name: 'AquaSense Innovation Cohort',
    project: 'Solar Water Monitoring Pilot',
    facultyMentor: 'Dr. Meera Nair (Head, Environmental Lab)',
    leadStudent: 'Riya Shah (ECE Final Year)',
    studentCount: 6,
    students: [
      'Riya Shah (Firmware Lead)',
      'Aarav Patel (Mechanical / CAD)',
      'Aditya Rao (Backend & IoT Ingress)',
      'Pooja Verma (Field Deployment)',
      'Sneha Kulkarni (UI/UX & Kannada Localization)',
      'Kunal Deshmukh (Water Quality Sensor Bench)',
    ],
    capabilities: [
      'Embedded C / FreeRTOS',
      'Solar MPPT Electronics',
      'MQTT Protocol',
      '3D CAD & Prototyping',
    ],
    missingCapabilities: [
      'Industrial IP66 Injection Casing',
      'Panchayat Civic Liaison',
    ],
    status: 'Working',
    meetingSchedule: 'Wednesdays at 4:30 PM (Lab 302)',
    completedMilestones: 2,
  },
  {
    id: 'wt2',
    name: 'Learning Commons Cohort',
    project: 'Offline-First Digital STEM Library',
    facultyMentor: 'Dr. Arjun Menon (Dean of Skilling)',
    leadStudent: 'Vikram Jadhav (CSE 3rd Year)',
    studentCount: 5,
    students: [
      'Vikram Jadhav (Full-Stack Dev)',
      'Ananya Deshpande (Curriculum Lead)',
      'Rohan Joshi (Linux Systems Admin)',
      'Tanvi Patil (Marathi Translation)',
      'Sameer Khan (Raspberry Pi Hardware)',
    ],
    capabilities: [
      'Progressive Web Apps (PWA)',
      'Docker on ARM64',
      'Wi-Fi Mesh Routing',
    ],
    missingCapabilities: [
      'Marathi Secondary Science Validation',
      'Tribal School Device Management',
    ],
    status: 'Active',
    meetingSchedule: 'Mondays at 5:00 PM (Seminar Hall B)',
    completedMilestones: 1,
  },
  {
    id: 'wt3',
    name: 'Sanjeevani Informatics Team',
    project: 'Rural Clinic Low-Bandwidth Tele-Triage',
    facultyMentor: 'Dr. Kavya Shah (Health Informatics)',
    leadStudent: 'Dr. Rahul Varma (Public Health Scholar)',
    studentCount: 5,
    students: [
      'Dr. Rahul Varma (Clinical Protocol)',
      'Deepa Nair (Android Developer)',
      'Karthik S (SQLite & Sync Protocol)',
      'Meenakshi Pillai (Field Nurse Liaison)',
      'Vivek Menon (Data Privacy & Testing)',
    ],
    capabilities: [
      'Store-and-Forward Mobile Architecture',
      'ASHA Worker Protocol Usability',
    ],
    missingCapabilities: [
      'DISHA / HIPAA Data Compliance Audit',
      'Cellular Signal Booster Engineering',
    ],
    status: 'Formation Pending',
    meetingSchedule: 'Thursdays at 3:00 PM (Virtual Sync)',
    completedMilestones: 0,
  },
]