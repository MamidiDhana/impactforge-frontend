import { useState } from 'react'
import { CheckCircle2, Handshake } from 'lucide-react'
import { HEILayout } from '../../layouts/HEILayout'
import { HEIPage } from './HEIShared'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { collaborationRequests } from '../../data/collaborationRequests'
export function CollaborationRequestsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [action, setAction] = useState<'Accepted' | 'Rejected' | null>(null)
  const [success, setSuccess] = useState('')
  return (
    <HEILayout title="Requests">
      <HEIPage
        title="Requests"
        description="Review support offers from partners, research organizations, NGOs, CSR organizations, and government departments."
        breadcrumbs={[
          { label: 'University', href: '/hei/dashboard' },
          { label: 'Requests' },
        ]}
      >
        <div className="grid gap-4">
          {collaborationRequests.map((request) => (
            <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#187e8d]">
                    {request.organizationType}
                  </p>
                  <h2 className="mt-2 font-[Manrope] text-lg font-bold text-[#13243b]">{request.organization}</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {request.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {request.relatedProject} · {request.requestedSupport}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{request.message}</p>
              <p className="mt-3 text-xs text-slate-400">{request.date}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelected(request.id)
                    setAction('Accepted')
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"
                >
                  <Handshake size={14} />
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(request.id)
                    setAction('Rejected')
                  }}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Reject
                </button>
                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                  More information
                </button>
              </div>
            </article>
          ))}
        </div>
        {success && (
          <p role="status" className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle2 size={17} />
            {success}
          </p>
        )}
        <ConfirmDialog
          open={Boolean(selected)}
          title={`${action} collaboration request?`}
          description="This is a simulated frontend action."
          destructive={action === 'Rejected'}
          confirmLabel={action ?? 'Confirm'}
          onCancel={() => setSelected(null)}
          onConfirm={() => {
            setSelected(null)
            setSuccess(`Request ${action?.toLowerCase()} successfully.`)
          }}
        />
      </HEIPage>
    </HEILayout>
  )
}