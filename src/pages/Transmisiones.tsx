import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'
import { TRANSMISIONES_COLLECTION } from '../constants'

interface Transmision {
  id: string
  titulo: string
  descripcion: string
  enlaceZoom?: string
  fechaInicio: Timestamp
  duracion?: number
  activa: boolean
  espectadores?: number
  predicador?: string
}

export default function Transmisiones() {
  const [transmisionActiva, setTransmisionActiva] = useState<Transmision | null>(null)
  const [historial, setHistorial] = useState<Transmision[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn('Transmisiones: la carga está tardando más de lo esperado.')
      setLoading(false)
    }, 10_000)

    cargarTransmisiones()

    return () => clearTimeout(timer)
  }, [])

  const cargarTransmisiones = () => {
    if (!firebaseEnabled || !db) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Listener para transmisión activa
    const activeQuery = query(
      collection(db, TRANSMISIONES_COLLECTION),
      where('activa', '==', true),
      orderBy('fechaInicio', 'desc')
    )

    const unsubscribeActive = onSnapshot(
      activeQuery,
      (snap) => {
        if (!snap.empty) {
          const data = {
            id: snap.docs[0].id,
            ...snap.docs[0].data()
          } as Transmision
          setTransmisionActiva(data)
        } else {
          setTransmisionActiva(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error en listener de transmisión activa:', error)
        setLoading(false)
      }
    )

    // Listener para historial
    const historialQuery = query(
      collection(db, TRANSMISIONES_COLLECTION),
      where('activa', '==', false),
      orderBy('fechaInicio', 'desc')
    )

    const unsubscribeHistorial = onSnapshot(
      historialQuery,
      (snap) => {
        const historialData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Transmision[]
        setHistorial(historialData)
        setLoading(false)
      },
      (error) => {
        console.error('Error en listener de historial de transmisiones:', error)
        setLoading(false)
      }
    )

    return () => {
      unsubscribeActive()
      unsubscribeHistorial()
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">📡</div>
          <p className="text-gray-600 dark:text-gray-300 font-light">Cargando transmisiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-5xl">📡</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-3 tracking-wide">
            Transmisiones en Vivo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-md mx-auto">
            Únete a nuestras transmisiones en directo desde Zoom
          </p>
        </div>

        {/* Transmisión en Vivo */}
        {transmisionActiva ? (
          <div className="mb-12 animate-in fade-in slide-in-from-top duration-500">
            <div className="bg-gradient-to-br from-purple-50/50 via-red-50/30 to-pink-50/50 dark:from-purple-950/30 dark:via-red-950/20 dark:to-pink-950/30 backdrop-blur-xl rounded-2xl border border-purple-200/30 dark:border-purple-800/30 overflow-hidden shadow-xl">
              {/* Badge EN VIVO */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold text-sm tracking-wide">EN VIVO AHORA</span>
                  </div>
                </div>
                {transmisionActiva.espectadores !== undefined && (
                  <p className="text-white text-sm font-light">
                    👁️ {transmisionActiva.espectadores.toLocaleString()} viendo
                  </p>
                )}
              </div>

              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-light text-gray-900 dark:text-white mb-3">
                  {transmisionActiva.titulo}
                </h2>

                {transmisionActiva.predicador && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 italic">
                    Predicador: <span className="font-semibold">{transmisionActiva.predicador}</span>
                  </p>
                )}

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-light">
                  {transmisionActiva.descripcion}
                </p>

                {/* Video Container */}
                {transmisionActiva.enlaceZoom ? (
                  <div className="aspect-video bg-gray-900 rounded-xl mb-8 overflow-hidden shadow-lg">
                    <iframe
                      src={transmisionActiva.enlaceZoom}
                      className="w-full h-full"
                      allowFullScreen
                      title="Transmisión en vivo"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-8 flex items-center justify-center">
                    <p className="text-gray-600 dark:text-gray-400 text-center font-light">
                      El enlace de transmisión se proporcionará pronto
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">
                      Inicio
                    </p>
                    <p className="text-gray-900 dark:text-white font-light">
                      {formatDate(transmisionActiva.fechaInicio)}
                    </p>
                  </div>
                  {transmisionActiva.duracion && (
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider mb-2">
                        Duración
                      </p>
                      <p className="text-gray-900 dark:text-white font-light">
                        Aproximadamente {transmisionActiva.duracion} minutos
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 p-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm">
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light mb-2">
              No hay transmisión en vivo en este momento
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Consulta nuestro horario abajo ↓
            </p>
          </div>
        )}

        {/* Sección de Historial */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
              Transmisiones Anteriores
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
              {historial.length} grabaciones disponibles
            </p>
          </div>

          {historial.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historial.map((transmision) => (
                <div
                  key={transmision.id}
                  className="group bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-950 rounded-t-xl relative overflow-hidden group-hover:opacity-90 transition">
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
                      📹
                    </div>
                    {transmision.enlaceZoom && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-3xl">▶</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-light text-lg text-gray-900 dark:text-white mb-1">
                      {transmision.titulo}
                    </h3>

                    {transmision.predicador && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 italic">
                        {transmision.predicador}
                      </p>
                    )}

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 font-light leading-relaxed">
                      {transmision.descripcion}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDate(transmision.fechaInicio)}
                      </p>

                      {transmision.enlaceZoom && (
                        <a
                          href={transmision.enlaceZoom}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-light px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition"
                        >
                          Ver grabación
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm">
              <p className="text-gray-600 dark:text-gray-400 font-light">
                No hay transmisiones anteriores disponibles
              </p>
            </div>
          )}
        </div>

        {!firebaseEnabled && (
          <div className="mt-12 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-light">
              ⚠️ El servicio de base de datos no está disponible. Algunos datos pueden no aparecer.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
