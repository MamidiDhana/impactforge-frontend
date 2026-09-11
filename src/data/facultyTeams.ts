import type { WorkspaceTeam } from '../types'

export interface TeamReview {
  id: string
  reviewerName: string
  reviewerRole: string
  rating: number
  date: string
  feedback: string
  status: 'Approved' | 'Requires Revision' | 'Commended'
}

export interface FacultyComment {
  id: string
  authorName: string
  authorRole: string
  date: string
  content: string
  badge?: string
}

export interface ExtendedWorkspaceTeam extends WorkspaceTeam {
  leadStudent?: string
  studentCount?: number
  meetingSchedule?: string
  completedMilestones?: number
  progress?: number
  description?: string
  department?: string
  reviews?: TeamReview[]
  comments?: FacultyComment[]
}

export const facultyTeams: ExtendedWorkspaceTeam[] = [
  {
    id: 'wt1',
    name: 'AquaSense Innovation Cohort',
    project: 'Solar Water Monitoring Pilot',
    description:
      'Developing low-power IoT water purity sensors with solar harvesting to continuously stream water contamination indicators to local health boards.',
    department: 'Environmental Science & Electronics Engineering',
    facultyMentor: 'Dr. Meera Nair (Head, Environmental Lab)',
    leadStudent: 'Riya Shah (ECE Final Year)',
    studentCount: 6,
    progress: 75,
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
    reviews: [
      {
        id: 'rev-1',
        reviewerName: 'Dr. Meera Nair',
        reviewerRole: 'Faculty Mentor',
        rating: 5,
        date: '28 Aug 2026',
        feedback:
          'Excellent progress on the telemetry transmission loop and solar circuit efficiency under low sunlight conditions. Firmware testing exceeded our bench criteria.',
        status: 'Commended',
      },
      {
        id: 'rev-2',
        reviewerName: 'Prof. S. R. Rao',
        reviewerRole: 'Department Chair',
        rating: 4,
        date: '14 Aug 2026',
        feedback:
          'Firmware and sensor calibration verified. Field readiness verification scheduled with the Gram Panchayat representatives.',
        status: 'Approved',
      },
    ],
    comments: [
      {
        id: 'com-1',
        authorName: 'Dr. Meera Nair',
        authorRole: 'Faculty Mentor',
        date: '02 Sep 2026, 11:30 AM',
        content:
          'Please ensure the enclosure seal testing report is finalized before next Wednesday’s deployment dry-run.',
        badge: 'Faculty Note',
      },
      {
        id: 'com-2',
        authorName: 'Dr. Meera Nair',
        authorRole: 'Faculty Mentor',
        date: '20 Aug 2026, 04:15 PM',
        content:
          'Met with the Panchayat technical officer. They have approved mounting the sensor probe at the central tank station.',
        badge: 'Milestone Update',
      },
    ],
  },
  {
    id: 'wt2',
    name: 'Learning Commons Cohort',
    project: 'Offline-First Digital STEM Library',
    description:
      'Engineered localized micro-servers running on Raspberry Pi clusters to distribute interactive science and math modules in remote schools without grid connectivity.',
    department: 'Computer Science & Skilling Education',
    facultyMentor: 'Dr. Arjun Menon (Dean of Skilling)',
    leadStudent: 'Vikram Jadhav (CSE 3rd Year)',
    studentCount: 5,
    progress: 50,
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
    reviews: [
      {
        id: 'rev-3',
        reviewerName: 'Dr. Arjun Menon',
        reviewerRole: 'Faculty Mentor',
        rating: 4,
        date: '25 Aug 2026',
        feedback:
          'Local offline synchronization protocol functions reliably. Secondary school curriculum chapters require formal signoff by the pedagogy committee.',
        status: 'Approved',
      },
    ],
    comments: [
      {
        id: 'com-3',
        authorName: 'Dr. Arjun Menon',
        authorRole: 'Faculty Mentor',
        date: '01 Sep 2026, 09:45 AM',
        content:
          'Sameer and Rohan: Check power draw when streaming video to 15 concurrent tablet clients.',
        badge: 'Lab Action',
      },
    ],
  },
  {
    id: 'wt3',
    name: 'Sanjeevani Informatics Team',
    project: 'Rural Clinic Low-Bandwidth Tele-Triage',
    description:
      'Store-and-forward clinical triage smartphone utility with automated offline decision trees designed for Auxiliary Nurse Midwives in tribal clinics.',
    department: 'Biomedical Informatics & Public Health',
    facultyMentor: 'Dr. Kavya Shah (Health Informatics)',
    leadStudent: 'Dr. Rahul Varma (Public Health Scholar)',
    studentCount: 5,
    progress: 20,
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
    reviews: [
      {
        id: 'rev-4',
        reviewerName: 'Dr. Kavya Shah',
        reviewerRole: 'Faculty Mentor',
        rating: 3,
        date: '10 Aug 2026',
        feedback:
          'Protocol outlines are thorough. Mobile sync engine needs schema optimization before moving into patient testing.',
        status: 'Requires Revision',
      },
    ],
    comments: [
      {
        id: 'com-4',
        authorName: 'Dr. Kavya Shah',
        authorRole: 'Faculty Mentor',
        date: '18 Aug 2026, 02:00 PM',
        content:
          'Ethics review submission completed. Scheduled meeting with district medical officer next Tuesday.',
        badge: 'Governance',
      },
    ],
  },
]