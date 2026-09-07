import {
  Calendar,
  Check,
  Edit2,
  FolderGit2,
  Lock,
  Tag,
  Trash2,
} from 'lucide-react'
import type { PartnerResource } from '../../types'
import { PartnerStatusBadge } from './PartnerStatusBadge'

interface ResourceCardProps {
  resource: PartnerResource
  onEdit: (resource: PartnerResource) => void
  onToggleAvailability: (resource: PartnerResource, newAvailability: 'Available' | 'Committed' | 'Limited') => void
  onRemove: (resource: PartnerResource) => void
}

export function ResourceCard({
  resource,
  onEdit,
  onToggleAvailability,
  onRemove,
}: ResourceCardProps) {
  return (
    <article className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f5f5] px-2.5 py-1 text-xs font-bold text-[#187e8d]">
            <Tag size={12} />
            {resource.type}
          </span>
          <div className="flex items-center gap-1.5">
            <PartnerStatusBadge status={resource.availability} />
          </div>
        </div>

        <h3 className="mt-3 font-[Manrope] text-base font-bold text-[#13243b]">
          {resource.name}
        </h3>

        <div className="mt-2 space-y-1.5 text-xs text-slate-500">
          <p className="flex items-center justify-between">
            <span className="text-slate-400">Capacity / Quantity:</span>
            <strong className="text-slate-700">{resource.quantity}</strong>
          </p>

          <p className="flex items-center justify-between">
            <span className="text-slate-400">Contribution State:</span>
            <span className="font-semibold text-slate-600">{resource.contributionStatus}</span>
          </p>

          {resource.relatedProject && (
            <p className="flex items-center gap-1.5 pt-1 text-[#187e8d]">
              <FolderGit2 size={13} className="shrink-0" />
              <span className="truncate font-medium">{resource.relatedProject}</span>
            </p>
          )}

          {resource.notes && (
            <p className="mt-2 rounded bg-slate-50 p-2 text-slate-600 italic">
              {resource.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            Added {resource.addedDate}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(resource)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Edit Resource"
            >
              <Edit2 size={12} />
              Edit
            </button>

            {resource.availability !== 'Available' && (
              <button
                type="button"
                onClick={() => onToggleAvailability(resource, 'Available')}
                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Check size={12} />
                Set Available
              </button>
            )}

            {resource.availability !== 'Committed' && (
              <button
                type="button"
                onClick={() => onToggleAvailability(resource, 'Committed')}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
              >
                <Lock size={11} />
                Set Committed
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(resource)}
            className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            title="Delete resource"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
