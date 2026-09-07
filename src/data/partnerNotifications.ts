import type { Notification } from '../types'

export interface ExtendedPartnerNotification extends Notification {
  category?: 'request' | 'status' | 'milestone' | 'message' | 'impact'
  actionUrl?: string
}

export const partnerNotifications: ExtendedPartnerNotification[] = [
  {
    id: 'pn1',
    title: 'New AI Project Recommendation (94% Match)',
    description: 'The "Solar Water Monitoring Pilot" at NITK Surathkal has a 94% capability match with your IoT and edge telemetry expertise.',
    type: 'project',
    category: 'request',
    read: false,
    createdAt: '10 minutes ago',
    actionUrl: '/partner/projects/pp1',
  },
  {
    id: 'pn2',
    title: 'Incoming Collaboration Request: Tele-Triage Platform',
    description: 'Dr. Kavya Shah from Tata Institute of Social Sciences submitted a request for technical review of their offline triage sync protocol.',
    type: 'request',
    category: 'request',
    read: false,
    createdAt: '2 hours ago',
    actionUrl: '/partner/collaboration-requests',
  },
  {
    id: 'pn3',
    title: 'Collaboration Request Accepted by COEP',
    description: 'College of Engineering Pune accepted your CSR funding offer of ₹3,50,000 for the Offline-First Digital STEM Library project.',
    type: 'status',
    category: 'status',
    read: false,
    createdAt: 'Yesterday at 4:15 PM',
    actionUrl: '/partner/active-collaborations',
  },
  {
    id: 'pn4',
    title: 'Milestone Completed: Solar Water Kiosk Enclosures',
    description: 'The AquaSense student team completed Milestone 2 ("Solar enclosure weatherproofing & circuit fab") for the Kolar project.',
    type: 'project',
    category: 'milestone',
    read: true,
    createdAt: '3 days ago',
    actionUrl: '/partner/active-collaborations',
  },
  {
    id: 'pn5',
    title: 'New Message from Dr. Meera Nair (NITK)',
    description: '"Thanks for the FreeRTOS guidance. The board power consumption in sleep mode has dropped to 14 microamps."',
    type: 'system',
    category: 'message',
    read: true,
    createdAt: '4 days ago',
    actionUrl: '/partner/active-collaborations',
  },
  {
    id: 'pn6',
    title: 'Quarterly Impact Report Due for Safe School Crossings',
    description: 'Please review and confirm the 6-month post-handover audit metrics for the Bhubaneswar school zone project.',
    type: 'status',
    category: 'impact',
    read: true,
    createdAt: '1 week ago',
    actionUrl: '/partner/impact',
  },
]