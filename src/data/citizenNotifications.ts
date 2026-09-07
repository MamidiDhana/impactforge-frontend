import type { Notification } from '../types'

export const citizenNotifications: Notification[] = [
  {
    id: 'notification-resolved',
    title: 'Problem Resolved',
    description: 'Your problem with Track ID IF-JH-2026-0004 has been resolved. View the final solution and provide your feedback.',
    type: 'status',
    read: false,
    createdAt: 'Today',
    trackId: 'IF-JH-2026-0004',
    problemTitle: 'Solar-powered bilingual digital learning kiosks in Santhal Pargana',
    status: 'Resolved',
    actionUrl: '/citizen/track/IF-JH-2026-0004',
  },
  { id: 'notification-1', title: 'Your problem was validated', description: 'Problem with Track ID IF-JH-2026-0001 has been validated and recommended to HEI network.', type: 'status', read: false, createdAt: 'Today', trackId: 'IF-JH-2026-0001', actionUrl: '/citizen/track/IF-JH-2026-0001' },
  { id: 'notification-2', title: 'A university showed interest', description: 'BIT Mesra Innovation Team accepted your water filtration problem.', type: 'request', read: false, createdAt: 'Yesterday', trackId: 'IF-JH-2026-0001', actionUrl: '/citizen/track/IF-JH-2026-0001' },
  { id: 'notification-3', title: 'Project update received', description: 'The irrigation pilot in Ranchi moved to field testing.', type: 'project', read: true, createdAt: '18 Aug 2026', trackId: 'IF-JH-2026-0002', actionUrl: '/citizen/track/IF-JH-2026-0002' },
  { id: 'notification-4', title: 'More information requested', description: 'Please review the validator note on your school library problem.', type: 'status', read: true, createdAt: '25 Jul 2026' },
]