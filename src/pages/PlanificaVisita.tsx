import { Clock, MapPin, Music, BookOpen, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const schedule = [
  { icon: Clock, label: 'Domingo', time: '9:00 AM', description: 'Culto de adoración y enseñanza bíblica.' },
  { icon: Clock, label: 'Martes', time: '7:00 PM', description: 'Reunión de oración y palabra.' },
  { icon: Clock, label: 'Jueves', time: '7:00 PM', description: 'Estudio bíblico y vida en comunidad.' },
  { icon: Clock, label: 'Sábado', time: '6:00 PM', description: 'Culto de alabanza y fortalecimiento espiritual.' }
]

const expectations = [
  {
    icon: Users,
    title: 'Ambiente acogedor',
    description:
      'Llegarás y serás recibido con calidez. Nuestro propósito es que te sientas en familia desde el primer momento.'
  },
  {
    icon: BookOpen,
    title: 'Mensajes prácticos',
    description:
      'Predicaciones claras y aplicables para la vida diaria, basadas en la Palabra de Dios.'
  },
  {
    icon: Music,
    title: 'Música en vivo',
    description:
      'Un tiempo de adoración con talentos locales y un sonido diseñado para conectar con Dios.'
  }
]

function MapPinIcon() {
  return <MapPin className="h-6 w-6 text-accent" />
}

export default function PlanificaVisita() {
  return (
    <div className="space-y-14">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent text-white py-20"
      >
        <div className="container relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Planifica tu visita</h1>
            <p className="mt-4 text-lg text-white/80">
              Te mostramos cómo llegar, qué horarios tenemos y qué puedes esperar en tu primera visita.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/" variant="ghost" className="text-white">
                Regresar al inicio
              </Button>
              <Button
                as="a"
                href="https://www.google.com/maps/place/Iglesia+%22LUZ+Y+VIDA+DE+DIOS%22/@-0.9027687,-89.6100016,20.64z"
                target="_blank"
                rel="noreferrer"
                variant="secondary"
              >
                Ver en Google Maps
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="container grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Horarios</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Elige el día que mejor te acomode. Siempre hay un lugar para ti en nuestra comunidad.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {schedule.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.label} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-secondary/20 p-2">
                      <span className="sr-only">Horario</span>
                      <Icon className="h-5 w-5 text-secondary" />
                    </span>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.time}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700 dark:text-gray-200">{item.description}</p>
                </div>
                <Button
                  as="a"
                  href="https://www.google.com/maps/place/Iglesia+%22LUZ+Y+VIDA+DE+DIOS%22/@-0.9027687,-89.6100016,20.64z"
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  className="mt-6 w-full"
                >
                  Cómo llegar
                </Button>
              </Card>
            )
          })}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <header className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                <MapPinIcon />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ubicación</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Puerto Baquerizo Moreno, Galápagos, Ecuador</p>
              </div>
            </header>
            <div className="mt-6">
              <Button
                as="a"
                href="https://www.google.com/maps/place/Iglesia+%22LUZ+Y+VIDA+DE+DIOS%22/@-0.9027687,-89.6100016,20.64z"
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                className="w-full"
              >
                Ver en Google Maps
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Qué puedes esperar</h2>
            <div className="space-y-4">
              {expectations.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20">
                      <Icon className="h-6 w-6 text-accent" />
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  )
}
