interface FilterSelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="text-xs font-semibold text-slate-600 block">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-[#187e8d]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
