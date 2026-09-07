import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useProblems } from '../../context/ProblemContext'
import { JHARKHAND_LANGUAGES } from '../../data/jharkhandData'
import type { JharkhandLanguage } from '../../types'

export function CitizenLanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useProblems()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLangInfo = JHARKHAND_LANGUAGES[language]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#187e8d] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#187e8d]/30"
        title="Jharkhand Language Selection"
        aria-label="Change Citizen Portal Language"
      >
        <Globe size={14} className="text-[#187e8d]" />
        {!compact && (
          <span className="max-w-[110px] truncate">
            {currentLangInfo.name} <span className="text-slate-400">({currentLangInfo.nativeName})</span>
          </span>
        )}
        {compact && <span>{language.toUpperCase()}</span>}
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95">
          <div className="border-b border-slate-100 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Jharkhand Regional Languages
          </div>
          <div className="py-1">
            {(Object.keys(JHARKHAND_LANGUAGES) as JharkhandLanguage[]).map((key) => {
              const info = JHARKHAND_LANGUAGES[key]
              const isSelected = language === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLanguage(key)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                    isSelected
                      ? 'bg-[#e8f5f5] font-bold text-[#187e8d]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{info.name}</span>
                    <span className="text-[11px] text-slate-400">{info.nativeName}</span>
                  </div>
                  {isSelected && <Check size={14} className="text-[#187e8d]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
