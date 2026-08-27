import { motion } from 'framer-motion'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import emailjs from '@emailjs/browser'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

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

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const [isSending, setIsSending] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setStatusMessage('')

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setStatusMessage(
        'El servicio de correo no está configurado. Usa el email iglesias_luzyvidadedios@gmail.com para contactarnos directamente.'
      )
      setIsSending(false)
      return
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: 'iglesialuzyvidadedios@gmail.com',
          from_name: formData.nombre || 'Visitante',
          from_email: formData.email,
          telefono: formData.telefono || 'No proporcionado',
          message: formData.mensaje,
          subject: 'Nuevo mensaje desde Contacto Iglesias Luz y Vida'
        },
        publicKey
      )

      setStatusMessage('Mensaje enviado con éxito. Revisaremos tu correo pronto.')
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' })
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setStatusMessage('No se pudo enviar el mensaje. Inténtalo otra vez.')
    } finally {
      setIsSending(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Versículo destacado */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <blockquote className="text-2xl md:text-3xl font-serif italic text-sky-900 mb-4 leading-relaxed">
            "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces."
          </blockquote>
          <cite className="text-lg text-sky-700 font-medium">
            Jeremías 33:3 (RVR1960)
          </cite>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-sky-900 mb-4">Contáctanos</h1>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              Estamos aquí para escucharte y caminar juntos por este camino cristiano.
              No dudes en ponerte en contacto con nosotros. ¡Bendiciones!
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Información de contacto */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-semibold text-sky-900 mb-6">Información de Contacto</h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sky-900 mb-1">Ubicación</h3>
                      <p className="text-sky-700">Galápagos, Ecuador, Isla San Cristóbal</p>
                      <p className="text-sm text-sky-600">Encuéntranos en el corazón de San Cristóbal</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sky-900 mb-1">Email</h3>
                      <p className="text-sky-700">iglesialuzyvidadedios@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sky-900 mb-1">Teléfono</h3>
                      <p className="text-sky-700">+593 XX XXX XXXX</p>
                      <p className="text-sm text-sky-600">Disponible para llamadas y WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-sky-200">
                <h3 className="font-semibold text-sky-900 mb-3">Horarios de Atención</h3>
                <div className="space-y-2 text-sky-700">
                  <p><strong>Lunes - Viernes:</strong> 9:00 AM - 5:00 PM</p>
                  <p><strong>Sábados:</strong> 10:00 AM - 2:00 PM</p>
                  <p><strong>Domingos:</strong> Solo servicios de culto</p>
                </div>
              </div>
            </motion.div>

            {/* Formulario */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-xl p-8 shadow-lg border border-sky-200">
                <h2 className="text-2xl font-semibold text-sky-900 mb-6">Envíanos un Mensaje</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-sky-900 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-sky-900 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-sky-900 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50"
                      placeholder="+593 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-sky-900 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-sky-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-sky-50/50 resize-none"
                      placeholder="Comparte tu mensaje, pregunta o petición de oración..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-sky-600 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSending ? 'Enviando...' : 'Enviar Mensaje'}</span>
                  </button>
                </form>

                {statusMessage && (
                  <p className="mt-4 text-sm text-center text-sky-700">{statusMessage}</p>
                )}

                <p className="text-xs text-sky-600 mt-4 text-center">
                  * Campos obligatorios. Tu información se mantendrá confidencial.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
