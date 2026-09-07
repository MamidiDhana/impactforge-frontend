import type { Notification } from '../types'
export const governmentNotifications: Notification[] = [
  { id: 'gn1', title: 'Three high-priority problems await review', description: 'Review the queue before the next validation cycle.', type: 'status', read: false, createdAt: 'Today' },
  { id: 'gn2', title: 'Duplicate analysis needs attention', description: 'A possible duplicate was detected in Water and Sanitation.', type: 'request', read: false, createdAt: 'Yesterday' },
  { id: 'gn3', title: 'Project milestone delayed', description: 'The water monitoring pilot is behind its prototype milestone.', type: 'project', read: true, createdAt: '20 Aug 2026' },
]