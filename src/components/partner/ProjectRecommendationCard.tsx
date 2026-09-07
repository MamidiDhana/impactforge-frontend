import {
  Building2,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PartnerProject } from '../../types'

interface ProjectRecommendationCardProps {
  project: PartnerProject
  onExpressInterest?: (project: PartnerProject) => void
  showAiDisclaimer?: boolean
}

export function ProjectRecommendationCard({
  project,
  onExpressInterest,
  showAiDisclaimer = false,
}: ProjectRecommendationCardProps) {
  const matchColor =
    project.match >= 85
      ? 'bg-teal-50 text-[#187e8d] border-teal-200'
      : project.match >= 75
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-slate-100 text-slate-700 border-slate-200'

  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#b8dfe0] hover:shadow-md">
      <div>
        {/* Top bar with category and AI match */}
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#187e8d]">
            {project.category}
          </span>
          <div className="flex flex-col items-end">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${matchColor}`}
              title="Algorithmic match score based on your stated organizational expertise & resources"
            >
              <Sparkles size={13} className="text-[#187e8d]" />
              {project.match}% Match
            </span>
            <span className="mt-0.5 text-[10px] text-slate-400">AI-assisted affinity</span>
          </div>
        </div>

        {/* Title and Problem */}
        <h3 className="mt-3 font-[Manrope] text-lg font-bold text-[#13243b] line-clamp-1 hover:text-[#187e8d]">
          <Link to={`/partner/projects/${project.id}`}>{project.title}</Link>
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">
          Addressing: <span className="text-slate-700">{project.problemTitle}</span>
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
          {project.description}
        </p>

        {/* Academic & Geographic Context */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <p className="flex items-center gap-2 truncate">
            <Building2 size={14} className="shrink-0 text-[#187e8d]" />
            <span className="truncate font-medium text-slate-700">{project.university}</span>
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 truncate">
              <GraduationCap size={14} className="shrink-0 text-slate-400" />
              <span>{project.facultyLead}</span>
            </p>
            <p className="flex items-center gap-1">
              <MapPin size={13} className="shrink-0 text-slate-400" />
              <span>{project.location}</span>
            </p>
          </div>
        </div>

        {/* Stage and Progress */}
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Stage: {project.stage}</span>
            <span className="font-bold text-[#187e8d]">{project.progress}% completed</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#187e8d] transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {project.beneficiaries.toLocaleString()} beneficiaries
            </span>
            <span>{project.studentTeam}</span>
          </div>
        </div>

        {/* Required capabilities pills */}
        <div className="mt-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Required Support & Capabilities
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {project.requiredSupport.map((req) => (
              <span
                key={req}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        {showAiDisclaimer && (
          <p className="mt-3 text-[11px] italic text-slate-400">
            AI-assisted recommendation — final participation decision belongs to the partner.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/partner/projects/${project.id}`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          View details
          <ChevronRight size={14} />
        </Link>
        {onExpressInterest && (
          <button
            type="button"
            onClick={() => onExpressInterest(project)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1a4a7a]"
          >
            <HeartHandshake size={14} />
            Express Interest
          </button>
        )}
      </div>
    </article>
  )
}
