import { Sliders, ShieldCheck } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

export function NotificationPreferences() {
  const { preferences, updatePreferences } = useNotifications()

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Sliders size={16} className="text-[#187e8d]" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#13243b]">
          Notification Preferences
        </h4>
      </div>

      <div className="space-y-3 text-xs">
        {/* Toggle 1: State Announcements */}
        <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 cursor-pointer transition">
          <div>
            <span className="font-bold text-slate-800">State Announcements</span>
            <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
              Show priority alerts and administrative broadcasts from the Super Admin cell.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.showAnnouncements}
            onChange={(e) => updatePreferences({ showAnnouncements: e.target.checked })}
            className="size-4 mt-0.5 rounded border-slate-300 accent-[#12365a] cursor-pointer"
          />
        </label>

        {/* Toggle 2: Problem Status Updates */}
        <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 cursor-pointer transition">
          <div>
            <span className="font-bold text-slate-800">Report Status Changes</span>
            <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
              Notify when a citizen report transitions to In Progress, Resolved, or Rejected.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.showReportStatusUpdates}
            onChange={(e) => updatePreferences({ showReportStatusUpdates: e.target.checked })}
            className="size-4 mt-0.5 rounded border-slate-300 accent-[#12365a] cursor-pointer"
          />
        </label>

        {/* Toggle 3: Project & Collaboration Updates */}
        <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 cursor-pointer transition">
          <div>
            <span className="font-bold text-slate-800">Project & Team Updates</span>
            <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
              Alerts regarding faculty guidance, student team formation, and partner commitments.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.showProjectUpdates}
            onChange={(e) => updatePreferences({ showProjectUpdates: e.target.checked })}
            className="size-4 mt-0.5 rounded border-slate-300 accent-[#12365a] cursor-pointer"
          />
        </label>
      </div>

      <div className="flex items-center gap-1.5 rounded-lg bg-blue-50/70 p-2.5 text-[11px] text-blue-900 border border-blue-100">
        <ShieldCheck size={14} className="text-[#187e8d] shrink-0" />
        <span>Settings are stored locally in your browser and respect role permissions.</span>
      </div>
    </div>
  )
}
