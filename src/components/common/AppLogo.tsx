import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'

interface AppLogoProps { compact?: boolean; href?: string; className?: string }

export function AppLogo({ compact = false, href = '/', className }: AppLogoProps) {
  const content = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#12365a] text-white shadow-sm">
        <ShieldCheck size={20} strokeWidth={2.3} />
      </span>
      {!compact && (
        <span className="font-[Manrope] text-lg font-extrabold tracking-[-0.04em] text-[#13243b] select-none">
          Impact<span className="text-[#187e8d]">Forge</span>
        </span>
      )}
    </>
  )
  return (
    <Link
      to={href}
      aria-label="ImpactForge home"
      className={cn('inline-flex items-center gap-2.5 select-none caret-transparent', className)}
    >
      {content}
    </Link>
  )
}