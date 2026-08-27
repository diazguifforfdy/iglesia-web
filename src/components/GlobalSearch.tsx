import { useState, useRef, useEffect } from 'react'
import { globalSearch } from '../services/search'

type Props = {
  compact?: boolean
}

export default function GlobalSearch({ compact }: Props) {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  const doSearch = async () => {
    const q = term.trim()
    if (!q) return
    setLoading(true)
    try {
      const r = await globalSearch(q)
      setResults(r)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setResults([])
      }
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  if (compact) {
    return (
      <div ref={ref} className="relative">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">🔎</span>
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
            placeholder="Busca..."
            className="w-44 md:w-64 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            onClick={doSearch}
            disabled={loading || term.trim().length < 2}
            className="hidden md:inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute right-0 mt-2 w-[28rem] max-w-full rounded-lg border bg-white shadow-lg z-50 transform transition duration-200 ease-out">
            <div className="p-2">
              {results.map(r => (
                <a key={r.id || JSON.stringify(r)} href={r.url || '#'} className="block rounded p-2 hover:bg-slate-50 text-sm text-slate-700">
                  <div className="font-semibold">{r.title || 'Sin título'}</div>
                  <div className="text-xs text-slate-500">{r.type} — {(r.content || '').slice(0, 80)}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="overflow-hidden rounded-[28px] border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50 to-slate-50 p-5 shadow-[0_20px_45px_rgba(16,185,129,0.12)] ring-1 ring-emerald-100 md:p-7">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Iglesia Luz y Vida</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Búsqueda rápida</h2>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Sitio completo</span>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">🔎</span>
            <input
              value={term}
              onChange={e => setTerm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
              placeholder="Busca mensajes, eventos, estudios o contenido..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3.5 pl-12 pr-4 text-base text-slate-800 shadow-inner outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          <button
            onClick={doSearch}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-500 hover:to-emerald-600 disabled:cursor-not-allowed disabled:from-emerald-300 disabled:to-emerald-300"
            disabled={loading || term.trim().length < 2}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {results.length === 0 && term.trim().length >= 2 && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-600">No se encontraron resultados para tu búsqueda.</div>
          )}
          {results.map(r => (
            <div key={r.id || JSON.stringify(r)} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{r.type}</div>
              <div className="mt-1 text-lg font-semibold text-slate-800">{r.title || 'Sin título'}</div>
              <div className="mt-1 text-sm leading-6 text-slate-700">{(r.content || '').slice(0, 200)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
