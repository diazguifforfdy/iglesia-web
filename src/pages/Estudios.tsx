import { Link } from 'react-router-dom'
import { ESTUDIOS } from '../data/estudios'
import { useAssetStatus } from '../hooks/useAssetStatus'
import { useMemo, useState } from 'react'

export default function Estudios() {
  const [q, setQ] = useState('')
  const items = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return ESTUDIOS
    return ESTUDIOS.filter((e) => {
      const haystack = [e.titulo, e.descripcion || '', e.categoria || ''].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [q])

  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl text-primary tracking-tight">
          Estudios Bíblicos y Mensajes
        </h1>
        <div className="mx-auto mt-3 h-px w-24 bg-gold/70" />
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Selecciona un estudio para leerlo en línea.
        </p>
      </div>
      <div className="mt-6 max-w-xl mx-auto">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, categoría o descripción"
          className="w-full px-4 py-2.5 rounded-full border bg-white dark:bg-gray-900"
          type="search"
          aria-label="Buscar estudios"
        />
      </div>
      {(items.length === 0 && q === '') ? (
        <div className="mt-6 p-6 rounded-lg border bg-white/70 dark:bg-gray-900/60">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Aún no hay documentos. Sube PDFs a <span className="font-mono">/public/docs/</span> y registra
            sus datos en <span className="font-mono">src/data/estudios.ts</span>.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((e) => {
            const pdfStatus = useAssetStatus(e.pdf)
            const disabled = pdfStatus === 'missing'
            return (
              <Link
                key={e.slug}
                to={disabled ? '#' : `/estudios/${e.slug}`}
                onClick={(ev) => {
                  if (disabled) ev.preventDefault()
                }}
                aria-disabled={disabled}
                className={[
                  'group rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition',
                  disabled ? 'opacity-70 cursor-not-allowed pointer-events-auto' : ''
                ].join(' ')}
                title={disabled ? 'PDF pendiente de subir' : `Leer ${e.titulo}`}
              >
                <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 relative">
                  {e.portada ? (
                    <img
                      src={e.portada}
                      alt={e.titulo}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={(ev) => {
                        ;(ev.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      Sin portada
                    </div>
                  )}
                  {e.categoria && (
                    <span className="absolute bottom-2 left-2 text-[11px] px-2 py-0.5 rounded-full bg-white/90 text-primary border">
                      {e.categoria}
                    </span>
                  )}
                  {disabled && (
                    <div className="absolute top-2 right-2 px-2 py-1 text-[11px] rounded bg-amber-500 text-white shadow">
                      PDF pendiente
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl text-primary">{e.titulo}</h3>
                  {e.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {e.descripcion}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-gold">
                    {disabled ? 'Disponible próximamente' : 'Leer en línea →'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
