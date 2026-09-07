export interface FacultyStudentMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  skills: string[]
  participationStatus: 'Active' | 'On Leave' | 'Completed' | 'Component Lead'
  projectId: string
  projectName: string
  joinedDate: string
  tasksAssigned: number
  tasksCompleted: number
}

export interface FacultyProjectTask {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assignedStudentId: string
  assignedStudentName: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dueDate: string
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed'
  progress: number
  progressNote?: string
}

export interface FacultyProjectOutput {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  submittedBy: string
  studentId: string
  outputType: string
  submissionDate: string
  reviewStatus: 'Approved' | 'Pending Review' | 'Changes Requested' | 'Rejected'
  reviewerComments?: string
  attachmentName?: string
  version: string
}

export interface FacultyAnnouncement {
  id: string
  title: string
  message: string
  projectId: string
  projectName: string
  author: string
  date: string
  priority: 'Normal' | 'Important' | 'Urgent'
}

export interface StudentPerformanceMetric {
  id: string
  studentName: string
  email: string
  projectName: string
  assignedTasks: number
  completedTasks: number
  pendingTasks: number
  progressPercent: number
  status: 'On Track' | 'Ahead of Schedule' | 'Needs Review' | 'Behind Schedule'
}

export const initialFacultyStudentMembers: FacultyStudentMember[] = [
  {
    id: 'stu-1',
    name: 'Riya Shah',
    email: 'riya.shah@nitk.edu.in',
    role: 'Lead Embedded Hardware Engineer',
    skills: ['IoT Sensors', 'C++', 'Circuit Design', 'Arduino'],
    participationStatus: 'Component Lead',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    joinedDate: '10 Jul 2026',
    tasksAssigned: 6,
    tasksCompleted: 4,
  },
  {
    id: 'stu-2',
    name: 'Aditya Varma',
    email: 'aditya.v@nitk.edu.in',
    role: 'Firmware & Telemetry Specialist',
    skills: ['LoRaWAN', 'Embedded C', 'Battery Optimization'],
    participationStatus: 'Active',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    joinedDate: '12 Jul 2026',
    tasksAssigned: 5,
    tasksCompleted: 4,
  },
  {
    id: 'stu-3',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@nitk.edu.in',
    role: 'Cloud Data Pipeline Developer',
    skills: ['Python', 'MQTT', 'FastAPI', 'PostgreSQL'],
    participationStatus: 'Active',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    joinedDate: '15 Jul 2026',
    tasksAssigned: 4,
    tasksCompleted: 3,
  },
  {
    id: 'stu-4',
    name: 'Kavya Pillai',
    email: 'kavya.p@nitk.edu.in',
    role: 'Field Testing Coordinator',
    skills: ['Quality Assurance', 'Community Surveying', 'Documentation'],
    participationStatus: 'Active',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    joinedDate: '20 Jul 2026',
    tasksAssigned: 3,
    tasksCompleted: 2,
  },
  {
    id: 'stu-5',
    name: 'Siddharth Rao',
    email: 'siddharth.r@nitk.edu.in',
    role: 'Industrial Enclosure Designer',
    skills: ['SolidWorks', '3D Printing', 'Thermal Management'],
    participationStatus: 'On Leave',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    joinedDate: '15 Jul 2026',
    tasksAssigned: 3,
    tasksCompleted: 1,
  },
  {
    id: 'stu-6',
    name: 'Sneha Kulkarni',
    email: 'sneha.k@nitk.edu.in',
    role: 'Frontend UI/UX Developer',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Figma'],
    participationStatus: 'Component Lead',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    joinedDate: '01 Aug 2026',
    tasksAssigned: 5,
    tasksCompleted: 4,
  },
  {
    id: 'stu-7',
    name: 'Manish Hegde',
    email: 'manish.h@nitk.edu.in',
    role: 'Content Curation Specialist',
    skills: ['Curriculum Mapping', 'Pedagogy', 'Metadata Structuring'],
    participationStatus: 'Active',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    joinedDate: '05 Aug 2026',
    tasksAssigned: 4,
    tasksCompleted: 3,
  },
  {
    id: 'stu-8',
    name: 'Pooja Iyer',
    email: 'pooja.i@nitk.edu.in',
    role: 'Edge Server Engineer',
    skills: ['Raspberry Pi', 'Docker', 'Linux', 'Offline Web Caching'],
    participationStatus: 'Active',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    joinedDate: '08 Aug 2026',
    tasksAssigned: 4,
    tasksCompleted: 2,
  },
]

export const initialFacultyProjectTasks: FacultyProjectTask[] = [
  {
    id: 'ftask-1',
    title: 'Validate telemetry optical sensor calibration',
    description: 'Compare prototype optical turbidity readings against laboratory spectrograph measurements in water treatment tanks.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    assignedStudentId: 'stu-1',
    assignedStudentName: 'Riya Shah',
    priority: 'High',
    dueDate: '28 Aug 2026',
    status: 'In Progress',
    progress: 75,
    progressNote: 'Completed lab baseline; calibrating offset in sample chamber.',
  },
  {
    id: 'ftask-2',
    title: 'Bench test LoRaWAN long-range antenna',
    description: 'Measure packet transmission rates and RSSI at 2km, 5km, and 10km line-of-sight test vectors.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    assignedStudentId: 'stu-2',
    assignedStudentName: 'Aditya Varma',
    priority: 'Critical',
    dueDate: '30 Aug 2026',
    status: 'To Do',
    progress: 10,
    progressNote: 'Hardware kit ready; field trip scheduled with gram panchayat team.',
  },
  {
    id: 'ftask-3',
    title: 'MQTT broker security hardening',
    description: 'Implement TLS encryption, dynamic token validation, and rate limiting on telemetry ingestion gateways.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    assignedStudentId: 'stu-3',
    assignedStudentName: 'Ananya Deshmukh',
    priority: 'Medium',
    dueDate: '25 Aug 2026',
    status: 'Review',
    progress: 90,
    progressNote: 'PR submitted with certificates; waiting for faculty mentor signoff.',
  },
  {
    id: 'ftask-4',
    title: 'Draft community field test protocol',
    description: 'Document standard operating procedures for village tap operators to inspect solar telemetry units.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    assignedStudentId: 'stu-4',
    assignedStudentName: 'Kavya Pillai',
    priority: 'Medium',
    dueDate: '22 Aug 2026',
    status: 'Completed',
    progress: 100,
    progressNote: 'Manual printed and shared with regional water board.',
  },
  {
    id: 'ftask-5',
    title: 'IP67 enclosure thermal dissipation simulation',
    description: 'Run finite element analysis on heat sink inside weatherproof outdoor solar battery casing.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    assignedStudentId: 'stu-5',
    assignedStudentName: 'Siddharth Rao',
    priority: 'Low',
    dueDate: '02 Sep 2026',
    status: 'To Do',
    progress: 0,
    progressNote: 'Pending CAD model finalization.',
  },
  {
    id: 'ftask-6',
    title: 'Create regional language educational taxonomy',
    description: 'Categorize primary school science and mathematics modules into Kannada, Hindi, and English tags.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    assignedStudentId: 'stu-7',
    assignedStudentName: 'Manish Hegde',
    priority: 'High',
    dueDate: '29 Aug 2026',
    status: 'Completed',
    progress: 100,
    progressNote: 'Taxonomy validated by state education advisor.',
  },
  {
    id: 'ftask-7',
    title: 'Offline PWA caching service worker',
    description: 'Implement cache storage fallback for video tutorials and interactive quizzes on low-spec tablets.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    assignedStudentId: 'stu-6',
    assignedStudentName: 'Sneha Kulkarni',
    priority: 'Critical',
    dueDate: '01 Sep 2026',
    status: 'In Progress',
    progress: 60,
    progressNote: 'IndexedDB sync working; finalizing background cache eviction policy.',
  },
  {
    id: 'ftask-8',
    title: 'Raspberry Pi captive portal provisioning script',
    description: 'Build automated setup script to deploy local Wi-Fi hotspot and content server in rural schools.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    assignedStudentId: 'stu-8',
    assignedStudentName: 'Pooja Iyer',
    priority: 'High',
    dueDate: '27 Aug 2026',
    status: 'Review',
    progress: 85,
    progressNote: 'Tested on Pi 4 model; verification submitted for mentor review.',
  },
]

export const initialFacultyProjectOutputs: FacultyProjectOutput[] = [
  {
    id: 'fout-1',
    title: 'Optical Sensor Calibration & Lab Benchmarking Report',
    description: 'Comprehensive analysis of 500 test samples measuring pH, turbidity, and chlorine concentrations against standard laboratory baselines.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    submittedBy: 'Riya Shah',
    studentId: 'stu-1',
    outputType: 'Technical Test Report',
    submissionDate: '24 Aug 2026',
    reviewStatus: 'Pending Review',
    reviewerComments: 'Initial draft looks solid. Need Dr. Menon to review error margin graphs before field deployment.',
    attachmentName: 'optical-sensor-calibration-v1.pdf',
    version: 'v1.2',
  },
  {
    id: 'fout-2',
    title: 'LoRaWAN Gateway Network Architecture Specification',
    description: 'System topology, frequency allocation plans, and power budget calculations for 10 rural telemetry nodes.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    submittedBy: 'Aditya Varma',
    studentId: 'stu-2',
    outputType: 'System Architecture',
    submissionDate: '21 Aug 2026',
    reviewStatus: 'Approved',
    reviewerComments: 'Approved by Dr. Menon. Frequency allocation complies with TEC guidelines.',
    attachmentName: 'lorawan-network-arch-spec.pdf',
    version: 'v2.0',
  },
  {
    id: 'fout-3',
    title: 'Gram Panchayat Operator SOP & Hindi Field Guide',
    description: 'Step-by-step visual handbook for ground staff explaining routine maintenance and battery status indicator codes.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    submittedBy: 'Kavya Pillai',
    studentId: 'stu-4',
    outputType: 'User Manual & SOP',
    submissionDate: '18 Aug 2026',
    reviewStatus: 'Changes Requested',
    reviewerComments: 'Please add high-contrast illustrations for nighttime maintenance and simplify section 3 jargon.',
    attachmentName: 'field-operator-sop-draft.pdf',
    version: 'v0.9',
  },
  {
    id: 'fout-4',
    title: 'Offline Digital Learning Content Taxonomy & Metadata Schema',
    description: 'Standardized classification scheme for 1,200 interactive STEM modules mapped to State Curriculum standards.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    submittedBy: 'Manish Hegde',
    studentId: 'stu-7',
    outputType: 'Research Framework',
    submissionDate: '23 Aug 2026',
    reviewStatus: 'Approved',
    reviewerComments: 'Excellent structure. Verified compatibility with DIKSHA learning platform standards.',
    attachmentName: 'stem-taxonomy-curriculum-v1.pdf',
    version: 'v1.0',
  },
  {
    id: 'fout-5',
    title: 'Edge Server Hotspot Firmware Image & Deployment Script',
    description: 'Alpine Linux based lightweight OS image with pre-configured hostapd, dnsmasq, and educational content mirror.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    submittedBy: 'Pooja Iyer',
    studentId: 'stu-8',
    outputType: 'Software Build & Deployment',
    submissionDate: '25 Aug 2026',
    reviewStatus: 'Pending Review',
    reviewerComments: 'Submitted today; awaiting faculty verification on test hardware.',
    attachmentName: 'offline-node-setup-bundle.tar.gz',
    version: 'v1.1-rc',
  },
]

export const initialFacultyAnnouncements: FacultyAnnouncement[] = [
  {
    id: 'fann-1',
    title: 'Mid-term Prototype Demonstration & Partner Review',
    message: 'All team members must finalize telemetry bench test reports by Friday, 29 Aug. Representatives from Rural Water Supply Department will observe live telemetry streams in Lab 304.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    author: 'Dr. Arjun Menon (Faculty Lead)',
    date: '24 Aug 2026',
    priority: 'Important',
  },
  {
    id: 'fann-2',
    title: 'Field Visit Safety & Logistics Guidelines',
    message: 'Transportation for the upcoming field deployment in Chitradurga district will depart from the university main gate at 07:00 AM on Monday. Verify your lab insurance pass.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    author: 'Dr. Arjun Menon (Faculty Lead)',
    date: '20 Aug 2026',
    priority: 'Normal',
  },
  {
    id: 'fann-3',
    title: 'Critical: Component procurement update',
    message: 'Texas Instruments sample shipments have cleared customs and are available in the department inventory store. Component leads can collect allocated chips.',
    projectId: 'wp1',
    projectName: 'Solar Water Monitoring Pilot',
    author: 'Dr. Arjun Menon (Faculty Lead)',
    date: '16 Aug 2026',
    priority: 'Normal',
  },
  {
    id: 'fann-4',
    title: 'Curriculum Alignment Review Workshop',
    message: 'Join online sync with DIKSHA content contributors this Wednesday at 4 PM to validate science module interactive quizzes.',
    projectId: 'wp2',
    projectName: 'Offline School Resource Library',
    author: 'Dr. Meera Nair (Faculty Mentor)',
    date: '22 Aug 2026',
    priority: 'Important',
  },
]

export const initialStudentPerformanceMetrics: StudentPerformanceMetric[] = [
  {
    id: 'spm-1',
    studentName: 'Riya Shah',
    email: 'riya.shah@nitk.edu.in',
    projectName: 'Solar Water Monitoring Pilot',
    assignedTasks: 6,
    completedTasks: 4,
    pendingTasks: 2,
    progressPercent: 78,
    status: 'Ahead of Schedule',
  },
  {
    id: 'spm-2',
    studentName: 'Aditya Varma',
    email: 'aditya.v@nitk.edu.in',
    projectName: 'Solar Water Monitoring Pilot',
    assignedTasks: 5,
    completedTasks: 4,
    pendingTasks: 1,
    progressPercent: 80,
    status: 'On Track',
  },
  {
    id: 'spm-3',
    studentName: 'Ananya Deshmukh',
    email: 'ananya.d@nitk.edu.in',
    projectName: 'Solar Water Monitoring Pilot',
    assignedTasks: 4,
    completedTasks: 3,
    pendingTasks: 1,
    progressPercent: 75,
    status: 'On Track',
  },
  {
    id: 'spm-4',
    studentName: 'Kavya Pillai',
    email: 'kavya.p@nitk.edu.in',
    projectName: 'Solar Water Monitoring Pilot',
    assignedTasks: 3,
    completedTasks: 2,
    pendingTasks: 1,
    progressPercent: 67,
    status: 'Needs Review',
  },
  {
    id: 'spm-5',
    studentName: 'Siddharth Rao',
    email: 'siddharth.r@nitk.edu.in',
    projectName: 'Solar Water Monitoring Pilot',
    assignedTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    progressPercent: 33,
    status: 'Behind Schedule',
  },
  {
    id: 'spm-6',
    studentName: 'Sneha Kulkarni',
    email: 'sneha.k@nitk.edu.in',
    projectName: 'Offline School Resource Library',
    assignedTasks: 5,
    completedTasks: 4,
    pendingTasks: 1,
    progressPercent: 80,
    status: 'Ahead of Schedule',
  },
  {
    id: 'spm-7',
    studentName: 'Manish Hegde',
    email: 'manish.h@nitk.edu.in',
    projectName: 'Offline School Resource Library',
    assignedTasks: 4,
    completedTasks: 3,
    pendingTasks: 1,
    progressPercent: 75,
    status: 'On Track',
  },
  {
    id: 'spm-8',
    studentName: 'Pooja Iyer',
    email: 'pooja.i@nitk.edu.in',
    projectName: 'Offline School Resource Library',
    assignedTasks: 4,
    completedTasks: 2,
    pendingTasks: 2,
    progressPercent: 50,
    status: 'Needs Review',
  },
]
