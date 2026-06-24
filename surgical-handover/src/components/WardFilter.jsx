const WARDS = ['All', 'W10', 'W14', 'W19', 'W20', 'W21', 'W22', 'W27', 'ICU', 'ER', 'Unassigned']

export default function WardFilter({ activeWard, onChange, counts = {} }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
      {WARDS.map(ward => {
        const count = ward === 'All'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[ward] || 0)

        return (
          <button
            key={ward}
            onClick={() => onChange(ward)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeWard === ward
                ? 'bg-hospital-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {ward}
            {count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs leading-none font-bold ${
                activeWard === ward ? 'bg-hospital-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export { WARDS }
