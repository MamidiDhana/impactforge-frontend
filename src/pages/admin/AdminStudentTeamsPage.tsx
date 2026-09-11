import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ExternalLink,
  Search,
  Users,
  Users2,
} from 'lucide-react'
import { AdminLayout } from '../../layouts/AdminLayout'
import { AdminPage } from '../../components/admin/AdminShared'

interface AdminTeamItem {
  id: string
  teamName: string
  university: string
  problemTitle: string
  leaderName: string
  facultyMentor: string
  membersCount: number
  progress: number
  status: 'Active' | 'Formation Pending' | 'Working' | 'Completed'
}

const DEMO_ADMIN_TEAMS: AdminTeamItem[] = [
  {
    id: 'team-bit-01',
    teamName: 'HydroSpark Innovations',
    university: 'Birla Institute of Technology (BIT) Mesra',
    problemTitle: 'Low-cost filtration for arsenic-heavy rural handpump water',
    leaderName: 'Rohan Sharma',
    facultyMentor: 'Dr. Arjun Menon',
    membersCount: 4,
    progress: 72,
    status: 'Working',
  },
  {
    id: 'team-bit-02',
    teamName: 'CivicGrid Ranchi',
    university: 'Birla Institute of Technology (BIT) Mesra',
    problemTitle: 'Smart pothole geo-tagging and civic road maintenance routing',
    leaderName: 'Sneha Kumari',
    facultyMentor: 'Dr. Meera Nair',
    membersCount: 5,
    progress: 88,
    status: 'Active',
  },
  {
    id: 'team-tiss-01',
    teamName: 'Tribal Health Connect',
    university: 'Tata Institute of Social Sciences (TISS)',
    problemTitle: 'Cold-chain vaccine stock tracking for remote PHC clinics',
    leaderName: 'Amit Soren',
    facultyMentor: 'Dr. Arjun Menon',
    membersCount: 3,
    progress: 54,
    status: 'Working',
  },
  {
    id: 'team-iit-01',
    teamName: 'Suraksha Jal',
    university: 'IIT (ISM) Dhanbad',
    problemTitle: 'Borewell contamination telemetry and early warning alarms',
    leaderName: 'Pooja Verma',
    facultyMentor: 'Prof. S. K. Mahato',
    membersCount: 4,
    progress: 40,
    status: 'Formation Pending',
  },
]

export function AdminStudentTeamsPage() {
  const [teams] = useState<AdminTeamItem[]>(DEMO_ADMIN_TEAMS)
  const [search, setSearch] = useState('')
  const [universityFilter, setUniversityFilter] = useState('All')

  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchSearch =
        search === '' ||
        t.teamName.toLowerCase().includes(search.toLowerCase()) ||
        t.leaderName.toLowerCase().includes(search.toLowerCase()) ||
        t.problemTitle.toLowerCase().includes(search.toLowerCase())

      const matchUni = universityFilter === 'All' || t.university === universityFilter
      return matchSearch && matchUni
    })
  }, [teams, search, universityFilter])

  const universities = useMemo(() => {
    return Array.from(new Set(teams.map((t) => t.university)))
  }, [teams])

  return (
    <AdminLayout title="Student Teams Oversight">
      <AdminPage
        title="Student Innovation Teams"
        description="Monitor higher education student research teams, project progression, and assigned faculty mentors across institutes."
        breadcrumbs={[
          { label: 'Super Admin', href: '/admin/dashboard' },
          { label: 'Student Teams' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#187e8d] border border-teal-200">
              <Users2 size={13} />
              <span>{teams.length} Teams Registered</span>
            </span>
          </div>
        }
      >
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by team name, leader, project..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs outline-none focus:border-[#187e8d] focus:bg-white"
            />
          </div>

          <select
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="All">All Universities & HEIs</option>
            {universities.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Teams Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 py-3.5">Team & University</th>
                  <th className="px-4 py-3.5">Assigned Challenge</th>
                  <th className="px-4 py-3.5">Leader & Mentor</th>
                  <th className="px-4 py-3.5">Members</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 max-w-[220px]">
                      <span className="font-mono text-[10px] font-bold text-[#187e8d]">{team.id}</span>
                      <p className="font-bold text-slate-900 truncate mt-0.5">{team.teamName}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Building2 size={11} className="text-slate-400" />
                        <span>{team.university}</span>
                      </p>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-900 line-clamp-2 leading-relaxed">
                        {team.problemTitle}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{team.leaderName} (Lead)</p>
                      <p className="text-[11px] text-slate-500">Mentor: {team.facultyMentor}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                        <Users size={12} className="text-slate-400" />
                        <span>{team.membersCount} members</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>{team.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#187e8d]"
                            style={{ width: `${team.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-md px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {team.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to="/university/faculty/teams"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[#187e8d] hover:bg-teal-50 transition"
                      >
                        <span>University Portal</span>
                        <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
