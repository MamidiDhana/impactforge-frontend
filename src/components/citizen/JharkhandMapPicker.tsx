import { useState, useMemo } from 'react'
import { MapPin, Navigation, Compass, CheckCircle2, AlertCircle } from 'lucide-react'
import { JHARKHAND_DISTRICTS } from '../../data/jharkhandData'

interface JharkhandMapPickerProps {
  selectedDistrict: string
  selectedLocality: string
  selectedLandmark: string
  latitude?: number
  longitude?: number
  onDistrictChange: (district: string, lat: number, lng: number) => void
  onLocalityChange: (locality: string) => void
  onLandmarkChange: (landmark: string) => void
  onCoordinatesChange?: (lat: number, lng: number) => void
  error?: string
  sectionTitle?: string
  sectionSubtitle?: string
  restrictedBadge?: string
  stateLabel?: string
  districtLabel?: string
  districtPrompt?: string
  localityLabel?: string
  localityPlaceholder?: string
  landmarkLabel?: string
  landmarkPlaceholder?: string
  mapTitle?: string
  mapHint?: string
  coordinatesLabel?: string
}

// Coordinate boundary bounding box for Jharkhand
const JHARKHAND_BOUNDS = {
  minLat: 22.0,
  maxLat: 25.4,
  minLng: 83.3,
  maxLng: 88.0,
}

export function JharkhandMapPicker({
  selectedDistrict,
  selectedLocality,
  selectedLandmark,
  latitude,
  longitude,
  onDistrictChange,
  onLocalityChange,
  onLandmarkChange,
  onCoordinatesChange,
  error,
  sectionTitle = 'Location Selector (Jharkhand Only)',
  sectionSubtitle = 'Select your Jharkhand district and landmark. Click on the map to pinpoint the exact community location.',
  restrictedBadge = 'Restricted to Jharkhand',
  stateLabel = 'State: Jharkhand (India)',
  districtLabel = 'Jharkhand District',
  districtPrompt = 'Select a district...',
  localityLabel = 'Locality / Village / Town',
  localityPlaceholder = 'e.g. Patratu Block, Namkum, Chas',
  landmarkLabel = 'Address or Landmark',
  landmarkPlaceholder = 'e.g. Near Panchayat Bhavan / Main Road',
  mapTitle = 'Interactive Map Prototype (Jharkhand Grid)',
  mapHint = 'Click map to place pin',
  coordinatesLabel = 'Selected Coordinates:',
}: JharkhandMapPickerProps) {
  const currentDistrictObj = useMemo(() => {
    return JHARKHAND_DISTRICTS.find(
      (d) =>
        d.name.toLowerCase() === selectedDistrict.toLowerCase() ||
        d.id.toLowerCase() === selectedDistrict.toLowerCase() ||
        (selectedDistrict.includes('Jamshedpur') && d.id === 'east-singhbhum')
    ) || JHARKHAND_DISTRICTS[0]
  }, [selectedDistrict])

  const currentLat = latitude || currentDistrictObj.latitude
  const currentLng = longitude || currentDistrictObj.longitude

  // Map coordinates (lat, lng) to SVG percentage (x: 0-100%, y: 0-100%)
  const pinPosition = useMemo(() => {
    const lngPercent =
      ((currentLng - JHARKHAND_BOUNDS.minLng) / (JHARKHAND_BOUNDS.maxLng - JHARKHAND_BOUNDS.minLng)) * 100
    // Invert latitude for screen coords (higher lat = higher up = lower Y)
    const latPercent =
      (1 - (currentLat - JHARKHAND_BOUNDS.minLat) / (JHARKHAND_BOUNDS.maxLat - JHARKHAND_BOUNDS.minLat)) * 100

    return {
      x: Math.max(8, Math.min(92, lngPercent)),
      y: Math.max(8, Math.min(92, latPercent)),
    }
  }, [currentLat, currentLng])

  const [activePin, setActivePin] = useState(pinPosition)

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = (e.clientX - rect.left) / rect.width
    const clickY = (e.clientY - rect.top) / rect.height

    // Calculate approximate lat/long within Jharkhand bounds
    const approxLng = JHARKHAND_BOUNDS.minLng + clickX * (JHARKHAND_BOUNDS.maxLng - JHARKHAND_BOUNDS.minLng)
    const approxLat = JHARKHAND_BOUNDS.maxLat - clickY * (JHARKHAND_BOUNDS.maxLat - JHARKHAND_BOUNDS.minLat)

    // Find nearest Jharkhand district
    let nearest = JHARKHAND_DISTRICTS[0]
    let minDist = Infinity

    JHARKHAND_DISTRICTS.forEach((dist) => {
      const d = Math.hypot(dist.latitude - approxLat, dist.longitude - approxLng)
      if (d < minDist) {
        minDist = d
        nearest = dist
      }
    })

    const finalLat = parseFloat(approxLat.toFixed(4))
    const finalLng = parseFloat(approxLng.toFixed(4))

    setActivePin({ x: clickX * 100, y: clickY * 100 })
    onDistrictChange(nearest.name, finalLat, finalLng)
    if (onCoordinatesChange) {
      onCoordinatesChange(finalLat, finalLng)
    }
  }

  const handleSelectDistrict = (districtName: string) => {
    const found = JHARKHAND_DISTRICTS.find((d) => d.name === districtName)
    if (found) {
      onDistrictChange(found.name, found.latitude, found.longitude)
      if (onCoordinatesChange) {
        onCoordinatesChange(found.latitude, found.longitude)
      }
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-[Manrope] text-base font-bold text-[#13243b]">
              {sectionTitle}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 size={12} /> {restrictedBadge}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {sectionSubtitle}
          </p>
        </div>
        <div className="text-right text-[11px] font-medium text-slate-400">
          <strong className="text-slate-700">{stateLabel}</strong>
        </div>
      </div>

      {/* Form Fields for District & Address */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {districtLabel} <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDistrict || ''}
            onChange={(e) => handleSelectDistrict(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
          >
            <option value="">{districtPrompt}</option>
            {JHARKHAND_DISTRICTS.map((dist) => (
              <option key={dist.id} value={dist.name}>
                {dist.name} ({dist.hindiName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {localityLabel}
          </label>
          <input
            type="text"
            value={selectedLocality}
            onChange={(e) => onLocalityChange(e.target.value)}
            placeholder={localityPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            {landmarkLabel}
          </label>
          <input
            type="text"
            value={selectedLandmark}
            onChange={(e) => onLandmarkChange(e.target.value)}
            placeholder={landmarkPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition focus:border-[#187e8d] focus:outline-none focus:ring-2 focus:ring-[#187e8d]/20"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Interactive Map Visual Mock */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-[#0f2838] to-[#12365a] p-3 text-white shadow-inner">
        {/* Top bar on map */}
        <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Compass size={14} className="text-[#36c5d8]" />
            <span>{mapTitle}</span>
          </div>
          <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-slate-300 backdrop-blur-sm">
            {mapHint}
          </span>
        </div>

        {/* Map Canvas */}
        <div
          onClick={handleMapClick}
          className="group relative h-64 w-full cursor-crosshair overflow-hidden rounded-lg border border-white/10 bg-[#0a1e2d]"
          title="Click to drop marker within Jharkhand"
        >
          {/* Topography Grid Lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, #36c5d8 1px, transparent 1px), linear-gradient(to bottom, #36c5d8 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Jharkhand Region Mock Contour SVG */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="jharkhandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#187e8d" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#12365a" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* Stylized contour of Jharkhand state boundaries */}
            <path
              d="M 60 70 L 120 40 L 220 35 L 290 55 L 360 80 L 370 140 L 320 180 L 280 220 L 190 210 L 110 200 L 70 160 L 50 110 Z"
              fill="url(#jharkhandGrad)"
              stroke="#36c5d8"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            {/* Major river / forest belt accents */}
            <path
              d="M 70 100 Q 180 120 340 120"
              fill="none"
              stroke="#4ecdc4"
              strokeWidth="1.5"
              strokeDasharray="6 3"
              opacity="0.6"
            />
          </svg>

          {/* Major District Label Markers on Map */}
          {JHARKHAND_DISTRICTS.slice(0, 8).map((d) => {
            const isTarget = d.name === selectedDistrict
            const posX =
              ((d.longitude - JHARKHAND_BOUNDS.minLng) / (JHARKHAND_BOUNDS.maxLng - JHARKHAND_BOUNDS.minLng)) * 100
            const posY =
              (1 - (d.latitude - JHARKHAND_BOUNDS.minLat) / (JHARKHAND_BOUNDS.maxLat - JHARKHAND_BOUNDS.minLat)) * 100

            return (
              <div
                key={d.id}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <div
                  className={`size-2 mx-auto rounded-full transition-all ${
                    isTarget ? 'bg-[#36c5d8] ring-4 ring-[#36c5d8]/40 scale-125' : 'bg-slate-500/80'
                  }`}
                />
                <span
                  className={`mt-0.5 block text-[9px] font-medium tracking-tight ${
                    isTarget ? 'font-bold text-[#36c5d8]' : 'text-slate-400'
                  }`}
                >
                  {d.name.split(' ')[0]}
                </span>
              </div>
            )
          })}

          {/* Active Location Marker Pin */}
          <div
            style={{ left: `${activePin.x}%`, top: `${activePin.y}%` }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-all duration-300"
          >
            <div className="relative flex flex-col items-center">
              <div className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
                <MapPin size={10} className="fill-white" />
                <span>{selectedDistrict || 'Jharkhand'}</span>
              </div>
              <div className="size-2 rotate-45 -mt-1 bg-red-600" />
              <div className="size-2 rounded-full bg-red-400 animate-ping mt-0.5" />
            </div>
          </div>
        </div>

        {/* Selected Coordinates Readout Bar */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <Navigation size={13} className="text-[#36c5d8]" />
            <span>
              {coordinatesLabel}{' '}
              <strong className="text-white">
                {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>District: <strong className="text-white">{selectedDistrict || 'None'}</strong></span>
            {selectedLandmark && (
              <span className="truncate max-w-[200px] text-slate-400">
                · {selectedLandmark}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
