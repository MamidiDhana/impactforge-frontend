import {
  Building2,
  Calendar,
  Check,
  Eye,
  HelpCircle,
  MessageSquare,
  User,
  X,
} from 'lucide-react'
import type { PartnerCollaborationRequest } from '../../types'
import { PartnerStatusBadge } from './PartnerStatusBadge'

interface CollaborationRequestCardProps {
  request: PartnerCollaborationRequest
  onView: (request: PartnerCollaborationRequest) => void
  onAccept?: (request: PartnerCollaborationRequest) => void
  onReject?: (request: PartnerCollaborationRequest) => void
  onRequestMoreInfo?: (request: PartnerCollaborationRequest) => void
  onCancel?: (request: PartnerCollaborationRequest) => void
}

export function CollaborationRequestCard({
  request,
  onView,
  onAccept,
  onReject,
  onRequestMoreInfo,
  onCancel,
}: CollaborationRequestCardProps) {
  const isIncoming = request.requestType === 'Incoming Request'
  const isPending = request.status === 'Pending Review' || request.status === 'Sent' || request.status === 'Under Review'

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {request.requestType ?? 'Collaboration Offer'}
            </span>
            <PartnerStatusBadge status={request.status} />
          </div>

          <h3 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b] line-clamp-1">
            {request.projectTitle}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 size={13} className="text-[#187e8d]" />
              {request.university}
            </span>
            <span className="flex items-center gap-1">
              <User size={13} />
              Lead: {request.facultyLead}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar size={13} />
              Submitted {request.requestDate}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3.5 text-xs">
        <div className="grid gap-2 sm:grid-cols-2">
          <p className="text-slate-600">
            <strong className="text-slate-700">Support Area:</strong> {request.requestedSupport}
          </p>
          <p className="text-slate-600">
            <strong className="text-slate-700">Proposed Contribution:</strong> {request.contribution}
          </p>
        </div>
        {request.timeline && (
          <p className="mt-2 border-t border-slate-200/60 pt-2 text-slate-500">
            <strong>Timeline:</strong> {request.timeline}
          </p>
        )}
        <p className="mt-2 text-slate-600 line-clamp-2 italic">
          &ldquo;{request.message}&rdquo;
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => onView(request)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Eye size={13} />
          View Details
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* If incoming request from HEI/student team */}
          {isIncoming && isPending && onAccept && (
            <button
              type="button"
              onClick={() => onAccept(request)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <Check size={13} />
              Accept Request
            </button>
          )}

          {isPending && onRequestMoreInfo && (
            <button
              type="button"
              onClick={() => onRequestMoreInfo(request)}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
            >
              <HelpCircle size={13} />
              Request More Info
            </button>
          )}

          {isIncoming && isPending && onReject && (
            <button
              type="button"
              onClick={() => onReject(request)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              <X size={13} />
              Reject
            </button>
          )}

          {/* If partner submitted this request and wants to cancel/withdraw */}
          {!isIncoming && isPending && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(request)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Cancel Request
            </button>
          )}

          <button
            type="button"
            onClick={() => onView(request)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <MessageSquare size={13} />
            Message Lead
          </button>
        </div>
      </div>
    </article>
  )
}
