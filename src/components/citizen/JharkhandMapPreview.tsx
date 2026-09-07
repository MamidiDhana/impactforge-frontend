import { MapPin, Navigation, Compass } from 'lucide-react'

interface JharkhandMapPreviewProps {
  district: string
  locality?: string
  landmark?: string
  latitude?: number
  longitude?: number
  className?: string
}

const JHARKHAND_BOUNDS = {
  minLat: 22.0,
  maxLat: 25.4,
  minLng: 83.3,
  maxLng: 88.0,
}

export function JharkhandMapPreview({
  district,
  locality,
  landmark,
  latitude = 23.3441,
  longitude = 85.3096,
  className = '',
}: JharkhandMapPreviewProps) {
  const lngPercent =
    ((longitude - JHARKHAND_BOUNDS.minLng) / (JHARKHAND_BOUNDS.maxLng - JHARKHAND_BOUNDS.minLng)) * 100
  const latPercent =
    (1 - (latitude - JHARKHAND_BOUNDS.minLat) / (JHARKHAND_BOUNDS.maxLat - JHARKHAND_BOUNDS.minLat)) * 100

  const pinX = Math.max(12, Math.min(88, lngPercent))
  const pinY = Math.max(12, Math.min(88, latPercent))

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {/* Map Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-[#13243b]">
          <Compass size={14} className="text-[#187e8d]" />
          <span>Jharkhand Geo-Location Preview</span>
        </div>
        <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600">
          Jharkhand, India
        </span>
      </div>

      {/* Visual Map Canvas */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#0c2333] via-[#103043] to-[#12365a]">
        {/* Topography Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #36c5d8 1px, transparent 1px), linear-gradient(to bottom, #36c5d8 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Stylized State Outline */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 300 160"
          preserveAspectRatio="none"
        >
          <path
            d="M 40 40 L 90 20 L 160 25 L 210 40 L 270 50 L 280 90 L 240 120 L 210 150 L 140 140 L 80 130 L 50 100 Z"
            fill="#187e8d"
            stroke="#36c5d8"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </svg>

        {/* Pin Marker */}
        <div
          style={{ left: `${pinX}%`, top: `${pinY}%` }}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
        >
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
              <MapPin size={10} className="fill-white" />
              <span>{district}</span>
            </div>
            <div className="size-1.5 rotate-45 -mt-0.5 bg-red-600" />
            <div className="size-2 rounded-full bg-red-400 animate-ping mt-0.5" />
          </div>
        </div>

        {/* Coordinate badge inside map */}
        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[10px] font-mono text-slate-200 backdrop-blur-sm">
          {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
        </div>
      </div>

      {/* Location Details Footer */}
      <div className="space-y-1 p-3 text-xs text-slate-600">
        <div className="flex items-center justify-between font-semibold text-[#13243b]">
          <span className="flex items-center gap-1">
            <Navigation size={12} className="text-[#187e8d]" />
            {district}
          </span>
          {locality && <span className="font-normal text-slate-500">{locality}</span>}
        </div>
        {landmark && (
          <p className="text-[11px] text-slate-500">
            <strong className="text-slate-700">Landmark:</strong> {landmark}
          </p>
        )}
      </div>
    </div>
  )
}
