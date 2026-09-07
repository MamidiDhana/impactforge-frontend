import {
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PartnerProject } from '../../types'

export interface PartnerProjectCardProps {
  project: PartnerProject
  onRequest?: () => void
}

export function PartnerProjectCard({ project, onRequest }: PartnerProjectCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#b8dfe0] hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#187e8d]">
            {project.category}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-[#187e8d]">
            <Sparkles size={12} />
            {project.match}% Match
          </span>
        </div>

        <h3 className="mt-3 font-[Manrope] text-lg font-bold text-[#13243b] line-clamp-1">
          <Link to={`/partner/projects/${project.id}`}>{project.title}</Link>
        </h3>
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">
          Addressing: {project.problemTitle}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
          {project.description}
        </p>

        <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <p className="flex items-center gap-1.5 font-medium text-slate-700">
            <Building2 size={13} className="text-[#187e8d]" />
            {project.university}
          </p>
          <p className="mt-1">
            Faculty Lead: <span className="text-slate-700">{project.facultyLead}</span> · {project.location}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.requiredSupport.map((item) => (
            <span
              key={item}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/partner/projects/${project.id}`}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-[#12365a] px-3 py-2 text-xs font-bold text-[#12365a] hover:bg-[#12365a]/5"
        >
          View details
          <ChevronRight size={14} />
        </Link>
        {onRequest && (
          <button
            type="button"
            onClick={onRequest}
            className="flex-1 rounded-lg bg-[#12365a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1a4a7a]"
          >
            Express Interest
          </button>
        )}
      </div>
    </article>
  )
}
