import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
interface BackButtonProps { label?: string; fallback?: string }
export function BackButton({ label = 'Go back', fallback = '/' }: BackButtonProps) { const navigate = useNavigate(); const goBack = () => { if (window.history.length > 1) navigate(-1); else navigate(fallback) }; return <button type="button" onClick={goBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#12365a]" aria-label={label}><ArrowLeft size={16} />{label}</button> }