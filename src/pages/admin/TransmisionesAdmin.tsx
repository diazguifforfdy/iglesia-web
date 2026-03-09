import { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp
} from 'firebase/firestore'
import { db, firebaseEnabled } from '../../firebase'
import { TRANSMISIONES_COLLECTION } from '../../constants'
import { useNotification } from '../../context/NotificationContext'

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

export default function TransmisionesAdmin() {
  const [transmisiones, setTransmisiones] = useState<Transmision[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    enlaceZoom: '',
    duracion: '',
    predicador: '',
    activa: false
  })
  const [fechaInicio, setFechaInicio] = useState('')
  const { addNotification } = useNotification()

  useEffect(() => {
    cargarTransmisiones()
  }, [])

  const cargarTransmisiones = async () => {
    if (!firebaseEnabled || !db) {
      setLoading(false)
      return
    }

    try {
      const q = query(collection(db, TRANSMISIONES_COLLECTION), orderBy('fechaInicio', 'desc'))
      const snap = await getDocs(q)

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transmision[]

      setTransmisiones(data)
    } catch (error) {
      console.error('Error al cargar transmisiones:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      enlaceZoom: '',
      duracion: '',
      predicador: '',
      activa: false
    })
    setFechaInicio('')
    setEditingId(null)
  }

  const handleEdit = (transmision: Transmision) => {
    setFormData({
      titulo: transmision.titulo,
      descripcion: transmision.descripcion,
      enlaceZoom: transmision.enlaceZoom || '',
      duracion: transmision.duracion?.toString() || '',
      predicador: transmision.predicador || '',
      activa: transmision.activa
    })
    // Convertir Timestamp a fecha local para el input
    const date = transmision.fechaInicio.toDate()
    const isoString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setFechaInicio(isoString)
    setEditingId(transmision.id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo || !formData.descripcion || !fechaInicio) {
      addNotification({
        type: 'error',
        message: 'Por favor completa los campos requeridos'
      })
      return
    }

    try {
      // Si hay otra transmisión activa, desactivarla
      if (formData.activa) {
        const activaActual = transmisiones.find(t => t.activa && t.id !== editingId)
        if (activaActual) {
          await updateDoc(doc(db!, 'transmisiones', activaActual.id), { activa: false })
        }
      }

      const dataToSave = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        enlaceZoom: formData.enlaceZoom || null,
        fechaInicio: Timestamp.fromDate(new Date(fechaInicio)),
        duracion: formData.duracion ? parseInt(formData.duracion) : null,
        activa: formData.activa,
        espectadores: 0,
        predicador: formData.predicador || null
      }

      if (editingId) {
        await updateDoc(doc(db!, 'transmisiones', editingId), dataToSave)
        addNotification({
          type: 'success',
          message: 'Transmisión actualizada',
          duration: 4000
        })
      } else {
        await addDoc(collection(db!, 'transmisiones'), dataToSave)
        addNotification({
          type: 'success',
          message: 'Transmisión creada',
          duration: 4000
        })
      }

      // Si se activó una transmisión, enviar notificación especial
      if (formData.activa && !editingId) {
        addNotification({
          type: 'transmision',
          title: '🔴 ¡Transmisión en vivo!',
          message: `${formData.titulo} está siendo transmitida ahora en nuestro canal.`,
          duration: 0,
          action: {
            label: 'Ver transmisión',
            onClick: () => window.location.href = '/transmisiones'
          }
        })
      }

      resetForm()
      cargarTransmisiones()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error al guardar la transmisión'
      })
      console.error('Error al guardar:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transmisión?')) return

    try {
      await deleteDoc(doc(db!, 'transmisiones', id))
      addNotification({
        type: 'success',
        message: 'Transmisión eliminada',
        duration: 4000
      })
      cargarTransmisiones()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error al eliminar'
      })
      console.error('Error al eliminar:', error)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 py-12">
      <div className="container max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white mb-2 tracking-wide">
            Gestión de Transmisiones en Vivo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-light">
            {transmisiones.length} transmisión{transmisiones.length !== 1 ? 'es' : ''} registrada{transmisiones.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-800/40 p-8 mb-10 shadow-lg">
          <h2 className="text-xl font-light text-gray-900 dark:text-white mb-6">
            {editingId ? '✏️ Editar Transmisión' : '➕ Nueva Transmisión'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                  placeholder="Ej: Servicio de Domingo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Predicador
                </label>
                <input
                  type="text"
                  value={formData.predicador}
                  onChange={e => setFormData({ ...formData, predicador: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                  placeholder="Nombre del predicador"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition min-h-[100px] resize-none"
                placeholder="Descripción de la transmisión"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Fecha y hora de inicio *
                </label>
                <input
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  aria-label="Fecha y hora de inicio"
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duracion}
                  onChange={e => setFormData({ ...formData, duracion: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                  placeholder="Ej: 90"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                Enlace de Zoom o grabación
              </label>
              <input
                type="url"
                value={formData.enlaceZoom}
                onChange={e => setFormData({ ...formData, enlaceZoom: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                placeholder="https://zoom.us/... o enlace de grabación"
              />
            </div>

            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border border-purple-200/30 dark:border-purple-800/30">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activa}
                  onChange={e => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="font-light text-gray-800 dark:text-gray-200">
                  🔴 Marcar como transmisión activa (solo una puede estar activa)
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-light tracking-wide transition duration-300 shadow-md hover:shadow-lg"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listado */}
        <div>
          <h2 className="text-xl font-light text-gray-900 dark:text-white mb-6">
            Transmisiones Registradas
          </h2>

          {transmisiones.length > 0 ? (
            <div className="space-y-4">
              {transmisiones.map(t => (
                <div
                  key={t.id}
                  className="group bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-lg border border-gray-200/50 dark:border-gray-800/50 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-light text-lg text-gray-900 dark:text-white">
                          {t.titulo}
                        </h3>
                        {t.activa && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold animate-pulse">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            EN VIVO
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-1 font-light">
                        {t.descripcion}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Predicador</p>
                          <p className="font-light text-gray-900 dark:text-white">{t.predicador || '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Fecha</p>
                          <p className="font-light text-gray-900 dark:text-white">{formatDate(t.fechaInicio).split(' ')[0]}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Duración</p>
                          <p className="font-light text-gray-900 dark:text-white">{t.duracion ? `${t.duracion} min` : '—'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Enlace</p>
                          <p className="font-light text-gray-900 dark:text-white">{t.enlaceZoom ? '✓' : '✗'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition font-light"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition font-light"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm">
              <p className="text-gray-600 dark:text-gray-400 font-light">
                No hay transmisiones creadas todavía
              </p>
            </div>
          )}
        </div>

        {!firebaseEnabled && (
          <div className="mt-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
            <p className="text-xs text-amber-700 dark:text-amber-300 font-light">
              ⚠️ El servicio de base de datos no está disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
