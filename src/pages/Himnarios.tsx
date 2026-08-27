import { useEffect, useMemo, useState } from 'react'
import { FileText, Download, Loader2, Search, X } from 'lucide-react'
import { getCollectionWhereOrdered } from '../services/firestore'

interface Himnario {
  id: string
  titulo: string
  descripcion: string
  enlaceDrive: string
  createdAt?: any
}

// Convierte un enlace de vista de Google Drive en su variante de descarga directa
function obtenerEnlaceDescarga(enlaceDrive: string): string {
  const match = enlaceDrive.match(/\/d\/([a-zA-Z0-9_-]+)/) || enlaceDrive.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : enlaceDrive
}

// Reemplaza parámetros finales por /preview para embeberlo limpiamente en un iframe
function obtenerEnlacePreview(enlaceDrive: string): string {
  try {
    const url = new URL(enlaceDrive)
    if (url.hostname.includes('drive.google.com') || url.hostname.includes('docs.google.com')) {
      let p = url.pathname
      if (p.endsWith('/view')) {
        p = p.substring(0, p.length - 5) + '/preview'
      } else if (!p.endsWith('/preview')) {
        p = p.replace(/\/view$/, '') + '/preview'
      }
      return `${url.protocol}//${url.hostname}${p}`
    }
  } catch {
    // Silent fallback
  }
  if (enlaceDrive.includes('drive.google.com') || enlaceDrive.includes('docs.google.com')) {
    return enlaceDrive
      .replace(/\/view\?usp=sharing$/, '/preview')
      .replace(/\/view\?.*$/, '/preview')
      .replace(/\/view$/, '/preview')
  }
  return enlaceDrive
}

function formatearFecha(createdAt: any): string {
  const date = createdAt?.toDate ? createdAt.toDate() : createdAt ? new Date(createdAt) : null
  if (!date || Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Himnarios() {
  const [himnarios, setHimnarios] = useState<Himnario[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [viewerTitle, setViewerTitle] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const data = await getCollectionWhereOrdered('biblioteca', 'categoria', '==', 'Himnario', 'createdAt', 'desc')
      if (!active) return
      setHimnarios(
        (data as any[]).map(d => ({
          id: d.id,
          titulo: d.titulo,
          descripcion: d.descripcion,
          enlaceDrive: d.enlaceDrive,
          createdAt: d.createdAt
        }))
      )
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return himnarios
    return himnarios.filter(h => h.titulo.toLowerCase().includes(q))
  }, [himnarios, busqueda])

  const abrirVisor = (h: Himnario) => {
    setViewerUrl(obtenerEnlacePreview(h.enlaceDrive))
    setViewerTitle(h.titulo)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-3 tracking-wide">Himnarios y Cancioneros</h1>
          <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
            Explora nuestra biblioteca de himnarios y cancioneros en PDF para acompañar tu adoración personal y congregacional.
          </p>
        </div>

        <div className="relative mb-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por título..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin mb-3" size={28} />
              <p>Cargando himnarios...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-slate-500 py-16">
              {himnarios.length === 0 ? 'Todavía no hay himnarios publicados.' : 'No se encontraron resultados para tu búsqueda.'}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Título</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((h, i) => (
                  <tr
                    key={h.id}
                    className={`border-b border-slate-100 last:border-b-0 hover:bg-blue-50/40 transition-colors ${i % 2 === 1 ? 'bg-slate-50/60' : ''}`}
                  >
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatearFecha(h.createdAt)}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{h.titulo}</p>
                      {h.descripcion && <p className="text-xs text-slate-500 line-clamp-1">{h.descripcion}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => abrirVisor(h)}
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Leer ahora"
                        >
                          <FileText size={18} />
                        </button>
                        <a
                          href={obtenerEnlaceDescarga(h.enlaceDrive)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Visor de PDF Integrado */}
      {viewerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => { setViewerUrl(null); setViewerTitle(''); }} />
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative z-10 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 truncate pr-4">{viewerTitle}</h3>
              <button
                onClick={() => { setViewerUrl(null); setViewerTitle(''); }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                aria-label="Cerrar visor"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={viewerUrl}
                className="w-full h-full border-none"
                title={viewerTitle}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


