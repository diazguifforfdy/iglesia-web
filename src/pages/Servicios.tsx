import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Music, MessageSquare, Mic, Play, Library } from 'lucide-react'

const services = [
  {
    id: 'escuelita',
    title: 'Escuelita Dominical',
    icon: BookOpen,
    description: 'Programa educativo para niños y jóvenes, enseñando los principios bíblicos de manera amena y didáctica.',
    details: 'Nuestras clases dominicales están diseñadas para edificar la fe desde temprana edad, con lecciones adaptadas a cada etapa de crecimiento espiritual.'
  },
  {
    id: 'juvenil',
    title: 'Grupo Juvenil',
    icon: Users,
    description: 'Espacio para jóvenes donde se fortalece la identidad cristiana y se construyen amistades sólidas.',
    details: 'Actividades recreativas, estudios bíblicos y momentos de adoración que ayudan a los jóvenes a crecer en su relación con Dios.'
  },
  {
    id: 'alabanzas',
    title: 'Alabanzas',
    icon: Music,
    description: 'Ministerio de música que eleva la adoración y glorifica a Dios a través del canto y la música.',
    details: 'Nuestro coro y banda de alabanzas lideran la adoración congregacional, creando un ambiente propicio para la presencia de Dios.'
  },
  {
    id: 'mensajes',
    title: 'Mensajes',
    icon: MessageSquare,
    description: 'Predicaciones bíblicas que alimentan el espíritu y guían el caminar cristiano.',
    details: 'Cada mensaje está basado en la Palabra de Dios, ofreciendo enseñanza, exhortación y edificación para la vida diaria.'
  },
  {
    id: 'predicas',
    title: 'Predicas',
    icon: Mic,
    description: 'Enseñanzas profundas de la Palabra de Dios para crecimiento espiritual.',
    details: 'Estudios detallados de pasajes bíblicos que profundizan en la comprensión de las Escrituras y su aplicación práctica.'
  },
  {
    id: 'multimedia',
    title: 'Multimedia',
    icon: Play,
    description: 'Contenido audiovisual que complementa la enseñanza y facilita el aprendizaje.',
    details: 'Videos, presentaciones y recursos multimedia que hacen la enseñanza más accesible y atractiva para todas las edades.'
  },
  {
    id: 'himnarios',
    title: 'Himnarios',
    icon: Library,
    description: 'Biblioteca de himnarios y cancioneros en PDF para la adoración personal y congregacional.',
    details: 'Accede y descarga nuestra colección de himnarios y cancioneros en formato PDF, alojados en Google Drive.'
  }
]

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

const fadeUpContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
}

// Mapea cada servicio a su página pública dedicada (cuando existe una)
const DEDICATED_ROUTES: Record<string, { to: string; label: string }> = {
  alabanzas: { to: '/servicios/alabanzas', label: 'Ver Alabanzas' },
  multimedia: { to: '/multimedia', label: 'Ver Multimedia' },
  mensajes: { to: '/mensajes', label: 'Ver Mensajes' },
  himnarios: { to: '/servicios/himnarios', label: 'Ver Himnarios' }
}

export default function Servicios() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpContainer}
          className="text-center mb-16"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            Nuestros Servicios
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Descubre los diferentes ministerios y actividades que conforman nuestra comunidad espiritual
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUpContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {services.map((service) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-xl border border-slate-200"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <selectedService.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedService.title}</h2>
                <p className="text-slate-600">{selectedService.description}</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed text-lg">{selectedService.details}</p>
            <div className="mt-6 flex gap-3">
              {DEDICATED_ROUTES[selectedService.id] && (
                <Link
                  to={DEDICATED_ROUTES[selectedService.id].to}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {DEDICATED_ROUTES[selectedService.id].label}
                </Link>
              )}
              <button
                onClick={() => setSelectedService(null)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}