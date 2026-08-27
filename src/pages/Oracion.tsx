import { motion } from 'framer-motion'
import { useState, useEffect, FormEvent } from 'react'
import { serverTimestamp } from 'firebase/firestore'
import { firebaseEnabled } from '../firebase'
import { addCollectionDoc, getCollectionCount } from '../services/firestore'
import { useNotification } from '../context/NotificationContext'
import { Heart, Send, Users } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

export default function Oracion() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [totalPeticiones, setTotalPeticiones] = useState(0)
  const { addNotification } = useNotification()

  // Contador de peticiones totales
  useEffect(() => {
    ;(async () => {
      try {
        const count = await getCollectionCount('oraciones')
        setTotalPeticiones(count)
      } catch {
        setTotalPeticiones(0)
      }
    })()
  }, [])

  const submitPrayer = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      if (!firebaseEnabled) {
        throw new Error('Servicio no disponible')
      }

      await addCollectionDoc('oraciones', {
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
        title: '🙏 Petición Recibida',
        message: 'Tu petición ha sido enviada. Estamos orando por ti.',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header Espiritual */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sky-900 mb-4">
            Peticiones de Oración
          </h1>
          <p className="text-xl text-sky-700 max-w-2xl mx-auto leading-relaxed">
            Tu petición es sagrada y confidencial. Comparte tu carga con nosotros
            y permite que la comunidad de fe se una en oración por ti.
          </p>
        </motion.div>

        {/* Contador de peticiones */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-sky-200">
            <Users className="w-5 h-5 text-sky-600" />
            <span className="text-sky-800 font-medium">
              {totalPeticiones} peticiones de oración recibidas
            </span>
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Versículo inspiracional */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-sky-200 mb-8 text-center"
          >
            <blockquote className="text-lg md:text-xl font-serif italic text-sky-900 mb-4 leading-relaxed">
              "Por nada estén ansiosos, sino sean conocidas vuestras peticiones delante de Dios
              en toda oración y ruego, con acción de gracias."
            </blockquote>
            <cite className="text-sky-700 font-medium">
              Filipenses 4:6 (RVR1960)
            </cite>
          </motion.div>

          {/* Formulario privado */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-8 shadow-lg border border-sky-200"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-sky-900 mb-2">Comparte tu Petición</h2>
              <p className="text-sky-700">
                Tu mensaje es completamente privado y confidencial
              </p>
            </div>

            <form onSubmit={submitPrayer} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-sky-900 mb-2">
                  Nombre <span className="text-sky-600 text-xs">(opcional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-sky-900 mb-2">
                  Correo Electrónico <span className="text-sky-600 text-xs">(opcional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-sky-900 mb-2">
                  Tu Petición de Oración *
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50 resize-none"
                  placeholder="Escribe lo que está en tu corazón... Comparte tu necesidad, preocupación o petición específica..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-sky-600 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando tu petición...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Petición de Oración</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-sky-600">
                🔒 Tu petición es completamente privada y confidencial.
                Solo el equipo pastoral tendrá acceso para interceder.
              </p>
            </div>
          </motion.div>

          {/* Mensaje de esperanza */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 text-center"
          >
            <div className="text-2xl mb-3">✨</div>
            <p className="text-amber-800 font-medium mb-2">
              Tu oración importa
            </p>
            <p className="text-amber-700 text-sm">
              Cada petición es escuchada y llevada ante el trono de Dios.
              Estamos honrados de interceder por ti.
            </p>
          </motion.div>
        </div>

        {!firebaseEnabled && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-center"
          >
            <p className="text-sm text-amber-700">
              ⚠️ El servicio no está disponible temporalmente. Inténtalo más tarde.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

