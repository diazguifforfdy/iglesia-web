export default function Eventos() {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]
  const daysShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const firstDay = new Date(currentYear, currentMonth, 1).getDay() // 0=Dom
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const offsetMonday = (firstDay + 6) % 7
  const cells: Array<number | null> = [
    ...Array(offsetMonday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]
  const cultoInfo = (weekday: number): string | null => {
    switch (weekday) {
      case 2:
        return 'Martes · Culto de Oración'
      case 4:
        return 'Jueves · Culto de Predicación'
      case 6:
        return 'Sábado · Culto de Predicación'
      case 0:
        return 'Domingo · Culto Dominical'
      default:
        return null
    }
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-primary">Eventos</h1>
      <p className="mt-2 text-gray-700 dark:text-gray-300">Calendario e inscripciones.</p>

      <div className="mt-6 p-6 rounded-2xl border bg-white/70 dark:bg-gray-900/60 backdrop-blur">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold text-primary">Calendario de cultos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {monthNames[currentMonth]} {currentYear}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2 text-center">
          {daysShort.map((d) => (
            <div key={d} className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {d}
            </div>
          ))}
          {cells.map((d, idx) => {
            if (d === null) return <div key={`e-${idx}`} />
            const wd = new Date(currentYear, currentMonth, d).getDay()
            const info = cultoInfo(wd)
            const isCulto = !!info
            return (
              <div
                key={d}
                className={[
                  'rounded-lg border p-1 text-sm text-left h-20 flex flex-col',
                  isCulto
                    ? 'bg-primary text-white ring-1 ring-secondary'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                ].join(' ')}
                title={info || undefined}
              >
                <div className="text-right text-xs opacity-80">{d}</div>
                {isCulto && <div className="mt-1 text-[11px] leading-snug">{info}</div>}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="inline-flex w-3 h-3 rounded bg-primary ring-1 ring-secondary" />
          <span>Días de culto: martes, jueves, sábado y domingo</span>
        </div>
      </div>
    </div>
  )
}
