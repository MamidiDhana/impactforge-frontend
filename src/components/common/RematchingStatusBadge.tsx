import React from 'react'
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

interface RematchingStatusBadgeProps {
  status?: string | null
  version?: number | null
  className?: string
  showIcon?: boolean
}

export const RematchingStatusBadge: React.FC<RematchingStatusBadgeProps> = ({
  status = 'idle',
  version,
  className,
  showIcon = true,
}) => {
  const normStatus = (status || 'idle').toLowerCase().trim()

  const config = (() => {
    switch (normStatus) {
      case 'running':
        return {
          label: 'Rematching Active',
          color: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-800',
          icon: <RefreshCw className="size-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />,
        }
      case 'completed':
        return {
          label: version && version > 1 ? `Rematched (v${version})` : 'Matches Current',
          color: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800',
          icon: <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
        }
      case 'failed':
        return {
          label: 'Rematch Failed',
          color: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800',
          icon: <AlertCircle className="size-3.5 text-rose-600 dark:text-rose-400" />,
        }
      case 'pending':
        return {
          label: 'Pending Rematch',
          color: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800',
          icon: <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />,
        }
      case 'idle':
      default:
        return {
          label: version && version > 1 ? `Initial Recommendations (v${version})` : 'Standard Matching',
          color: 'bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700',
          icon: <Clock className="size-3.5 text-slate-500" />,
        }
    }
  })()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all',
        config.color,
        className
      )}
      title={`AI Dynamic Re-Matching Status: ${config.label}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {version && version > 1 && normStatus !== 'completed' && (
        <span className="ml-0.5 rounded bg-black/10 px-1 py-0.2 text-[10px] font-bold dark:bg-white/10">
          v{version}
        </span>
      )}
    </span>
  )
}
