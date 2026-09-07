import type { GovernmentUser } from '../types'
export const governmentUsers: GovernmentUser[] = [
  { id: 'u1', name: 'Asha Rao', role: 'Citizen', organization: 'Community representative', verification: 'Verified', accountStatus: 'Active', lastActive: 'Today' },
  { id: 'u2', name: 'Dr. Meera Nair', role: 'Faculty', organization: 'National Institute of Technology Karnataka', verification: 'Verified', accountStatus: 'Active', lastActive: 'Yesterday' },
  { id: 'u3', name: 'Karan Patel', role: 'Partner', organization: 'CivicGrid Technologies', verification: 'Verified', accountStatus: 'Active', lastActive: '22 Aug 2026' },
  { id: 'u4', name: 'Open Neighbourhoods Collective', role: 'Non-profit', organization: 'Pune civic network', verification: 'Pending', accountStatus: 'Active', lastActive: '20 Aug 2026' },
]