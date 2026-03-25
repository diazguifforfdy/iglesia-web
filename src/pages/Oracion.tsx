import { useState, useEffect, FormEvent } from 'react'
import { 
  addDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  limit,
  serverTimestamp 
} from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'
import { useNotification } from '../context/NotificationContext'

interface PeticionOracion {
  id: string
  nombre?: string
  email?: string
  mensaje: string
  createdAt: Timestamp
}

export default function Oracion() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [oracionesRecientes, setOracionesRecientes] = useState<PeticionOracion[]>([])
  const [showRecientes, setShowRecientes] = useState(false)
  const { addNotification } = useNotification()

  // Listener en tiempo real para oraciones
  useEffect(() => {
    if (!firebaseEnabled || !db) return

    const q = query(
      collection(db, 'oraciones'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const oraciones = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PeticionOracion[]
      setOracionesRecientes(oraciones)
    })

    return () => unsubscribe()
  }, [])

  const submitPrayer = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      if (!firebaseEnabled || !db) {
        throw new Error('Servicio no disponible')
      }

      await addDoc(collection(db, 'oraciones'), {
        nombre: name || null,
        email: email || null,
        mensaje: message,
        createdAt: serverTimestamp()
      })

      setName('')
      setEmail('')
      setMessage('')

      addNotification({
        type: 'success',
        title: '✨ Petición recibida',
        message: 'Estamos orando por ti. Que Dios te bendiga.',
        duration: 6000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo enviar tu petición. Inténtalo más tarde.',
        duration: 5000
      })
      console.error(error)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Hace un momento'
    if (minutes < 60) return `Hace ${minutes} min`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours} h`
    
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 py-16">
      <div className="container max-w-2xl">
        {/* Header Espiritual */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-5xl">🙏</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-3 tracking-wide">
            Peticiones de Oración
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-md mx-auto leading-relaxed">
            Comparte tu carga con nosotros. Nos uniremos en oración por tu necesidad.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-gray-800/40 p-8 md:p-10 mb-8 shadow-lg">
          <form onSubmit={submitPrayer} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                Nombre <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                type="text"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                Email <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition"
                type="email"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-3">
                Tu Petición de Oración
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 transition min-h-[160px] resize-none"
                placeholder="Escribe lo que está en tu corazón..."
                required
              />
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={sending}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 shadow-md hover:shadow-lg"
              >
                {sending ? '✨ Enviando tu petición...' : '✨ Enviar Petición'}
              </button>
            </div>
          </form>
        </div>

        {/* Oraciones Recientes */}
        {oracionesRecientes.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowRecientes(!showRecientes)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-light transition mb-6"
            >
              <span className="text-2xl">{showRecientes ? '▼' : '▶'}</span>
              <span className="text-lg">Oraciones que estamos intercediendo</span>
              <span className="text-sm text-gray-500">({oracionesRecientes.length})</span>
            </button>

            {showRecientes && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {oracionesRecientes.map((oracion) => (
                  <div
                    key={oracion.id}
                    className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-100/30 dark:border-blue-900/30 p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">💙</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {oracion.nombre && (
                            <p className="font-light text-sm text-gray-700 dark:text-gray-300">
                              {oracion.nombre}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(oracion.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                          {oracion.mensaje}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensaje de inspiración */}
        <div className="mt-12 text-center p-6 rounded-lg bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100/30 dark:border-amber-900/30">
          <p className="text-gray-600 dark:text-gray-400 font-light italic text-sm">
            &quot;Por nada estén ansiosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego con acción de gracias.&quot; — Filipenses 4:6
          </p>
        </div>

        {!firebaseEnabled && (
          <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              ⚠️ El servicio de base de datos no está disponible en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

