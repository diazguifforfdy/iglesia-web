import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { Timestamp } from 'firebase/firestore'
import { getDocData, getCollectionWhereOrdered } from '../services/firestore'
import { TRANSMISIONES_COLLECTION } from '../constants'
import { useLiveService } from '../hooks/useLiveService'

type Daily = {
  versiculo?: string
  referencia?: string
  reflexion?: string
  oracion?: string
  animo?: string
}

type Transmision = {
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

export default function Home() {
  const [daily, setDaily] = useState<Daily | null>(null)
  const [transmisiones, setTransmisiones] = useState<Transmision[]>([])
  const { isLive, next, remaining, zoomLink } = useLiveService()
  const VERSES: { texto: string; referencia: string }[] = [
    { texto: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo...', referencia: 'Deuteronomio 31:6' },
    { texto: 'Todo lo puedo en Cristo que me fortalece.', referencia: 'Filipenses 4:13' },
    { texto: 'Porque yo sé los planes que tengo para vosotros...', referencia: 'Jeremías 29:11' },
    { texto: 'A los que aman a Dios, todas las cosas les ayudan a bien.', referencia: 'Romanos 8:28' },
    { texto: 'Jehová es mi luz y mi salvación; ¿de quién temeré?', referencia: 'Salmo 27:1' },
    { texto: 'Aunque ande en valle de sombra de muerte, no temeré mal alguno.', referencia: 'Salmo 23:4' },
    { texto: 'Dios es nuestro amparo y fortaleza, nuestro pronto auxilio.', referencia: 'Salmo 46:1' },
    { texto: 'Alzaré mis ojos a los montes... Mi socorro viene de Jehová.', referencia: 'Salmo 121:1-2' },
    { texto: 'En el mundo tendréis aflicción; pero confiad, yo he vencido al mundo.', referencia: 'Juan 16:33' },
    { texto: 'Cercano está Jehová a los quebrantados de corazón.', referencia: 'Salmo 34:18' },
    { texto: 'No temas, porque yo estoy contigo; no desmayes...', referencia: 'Isaías 41:10' },
    { texto: 'Mas los que esperan a Jehová tendrán nuevas fuerzas.', referencia: 'Isaías 40:31' },
    { texto: 'En el día que temo, yo en ti confío.', referencia: 'Salmo 56:3' },
    { texto: 'El que habita al abrigo del Altísimo morará bajo la sombra...', referencia: 'Salmo 91:1-2' },
    { texto: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu prudencia.', referencia: 'Proverbios 3:5-6' },
    { texto: 'Porque no nos ha dado Dios espíritu de cobardía...', referencia: '2 Timoteo 1:7' },
    { texto: 'Echando toda vuestra ansiedad sobre Él, porque Él tiene cuidado...', referencia: '1 Pedro 5:7' },
    { texto: 'Encomienda a Jehová tu camino, y confía en Él; y Él hará.', referencia: 'Salmo 37:5' },
    { texto: 'Esperad en Él en todo tiempo; derramad delante de Él vuestro corazón.', referencia: 'Salmo 62:8' },
    { texto: 'Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.', referencia: 'Mateo 11:28' },
    { texto: 'Jehová es bueno, fortaleza en el día de la angustia.', referencia: 'Nahúm 1:7' },
    { texto: 'Por la misericordia de Jehová no hemos sido consumidos...', referencia: 'Lamentaciones 3:22-23' },
    { texto: 'Mi carne y mi corazón desfallecen; mas la roca de mi corazón...', referencia: 'Salmo 73:26' },
    { texto: 'No te desampararé, ni te dejaré... Jehová es mi ayudador.', referencia: 'Hebreos 13:5-6' },
    { texto: 'Y el Dios de esperanza os llene de todo gozo y paz en el creer.', referencia: 'Romanos 15:13' },
    { texto: 'Te haré entender y te enseñaré el camino...', referencia: 'Salmo 32:8' },
    { texto: 'La paz os dejo, mi paz os doy; no se turbe vuestro corazón.', referencia: 'Juan 14:27' },
    { texto: 'Jehová está en medio de ti, poderoso, Él salvará; se gozará...', referencia: 'Sofonías 3:17' },
    { texto: 'Jehová es mi roca, mi fortaleza y mi libertador.', referencia: 'Salmo 18:2' },
    { texto: 'Jehová será refugio al pobre, refugio para el tiempo de angustia.', referencia: 'Salmo 9:9' },
    { texto: 'El Señor peleará por vosotros, y vosotros estaréis tranquilos.', referencia: 'Éxodo 14:14' }
  ]
  const today = new Date().getDate()
  const autoVerse = VERSES[(today - 1) % VERSES.length]
  useEffect(() => {
    ;(async () => {
      try {
        const data = await getDocData<Daily>('versiculos', 'diario')
        setDaily(data ?? null)
      } catch {
        setDaily(null)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getCollectionWhereOrdered(TRANSMISIONES_COLLECTION, 'activa', '==', true, 'fechaInicio', 'asc')
        setTransmisiones(data as Transmision[])
      } catch (err) {
        setTransmisiones([])
      }
    })()
  }, [])

  return (
    <div>
      <motion.section
          variants={fadeUpContainer}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden bg-cover bg-center bg-no-repeat min-h-[80vh] flex items-center justify-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop')`
          }}
        >
          {/* stronger dark overlay for better contrast */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
        <div className="relative container text-center max-w-4xl">
          <div className="py-32 md:py-48">
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold text-white font-display tracking-tight"
            >
              Jesucristo es el mismo de ayer, hoy y por los siglos
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-sky-200 mt-4 font-inter text-lg"
            >
              Hebreos 13:8
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex gap-3 justify-center flex-wrap">
              <Link
                to="/transmisiones"
                className="px-6 py-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg transition-all"
              >
                📡 Ver Transmisiones
              </Link>
              <a
                href="/oracion"
                className="px-5 py-3 rounded border-2 border-sky-300 text-white hover:bg-white/10 transition-colors font-semibold"
              >
                Petición de oración
              </a>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  const el = document.getElementById('servicios')
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="px-5 py-3 rounded border-2 border-white bg-white/10 text-white hover:bg-white/20 transition-colors font-semibold"
              >
                Conoce nuestros horarios
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section className="container py-14 bg-white">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-sky-900">Versículo del día</h3>
            <p className="mt-2 font-display text-xl text-sky-800">{autoVerse.texto}</p>
            <p className="text-sm text-sky-600">{autoVerse.referencia}</p>
          </div>
          {daily?.oracion && daily.oracion !== 'Próximamente' && (
            <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
              <h3 className="text-lg font-semibold text-sky-900">Oración</h3>
              <p className="mt-2 text-sky-700">{daily.oracion}</p>
            </div>
          )}
          {daily?.animo && daily.animo !== 'Próximamente' && (
            <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
              <h3 className="text-lg font-semibold text-sky-900">Mensaje de ánimo</h3>
              <p className="mt-2 text-sky-700">{daily.animo}</p>
            </div>
          )}
        </div>
      </section>
      {/* sección de oración movida a /oracion */}

      <section id="servicios" className="container py-14 bg-sky-50 scroll-mt-20">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-3xl font-bold text-center text-sky-900 mb-8"
        >
          Nuestros Servicios
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group"
          >
            <Link to="/servicios/escuelita-dominical" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h10M7 16h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Escuelita Dominical</h3>
              <p className="text-sm text-sky-600">Programa educativo para niños y jóvenes</p>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group"
          >
            <Link to="/servicios/grupo-juvenil" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" strokeWidth={1.5} stroke="currentColor" fill="none" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Grupo Juvenil</h3>
              <p className="text-sm text-sky-600">Espacio para jóvenes donde se fortalece la identidad cristiana</p>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group"
          >
            <Link to="/servicios/alabanzas" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-2v13" />
                  <circle cx="6" cy="18" r="3" strokeWidth={1.5} stroke="currentColor" fill="none" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Alabanzas</h3>
              <p className="text-sm text-sky-600">Ministerio de música que eleva la adoración</p>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group"
          >
            <Link to="/servicios/mensajes" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12v6a2 2 0 01-2 2H7l-4 4V6a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Mensajes</h3>
              <p className="text-sm text-sky-600">Predicaciones bíblicas que alimentan el espíritu</p>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group"
          >
            <Link to="/servicios/predicas" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 1v11" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-14 0" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Predicas</h3>
              <p className="text-sm text-sky-600">Enseñanzas profundas de la Palabra de Dios</p>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
            onClick={() => window.open('/servicios', '_self')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v18l15-9L5 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Multimedia</h3>
              <p className="text-sm text-sky-600">Contenido audiovisual que complementa la enseñanza</p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300 group col-span-full md:col-span-1"
          >
            <Link to="/servicios/himnarios" className="text-center block">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 20l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12l9-5-9-5-9 5 9 5z" opacity="0.5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-sky-900 mb-2">Himnarios</h3>
              <p className="text-sm text-sky-600">Biblioteca de himnarios y cancioneros en PDF</p>
            </Link>
          </motion.div>
        </div>

        <div id="horarios" className="scroll-mt-20">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="text-3xl font-bold text-center text-sky-900 mb-8"
          >
            Calendario de Cultos
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">Martes</h3>
                <p className="text-sky-700 font-medium">Horario: 6:30 PM - 8:30 PM</p>
                <p className="text-sm text-sky-600 mt-3">Culto de Oración</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">Jueves</h3>
                <p className="text-sky-700 font-medium">Horario: 6:30 PM - 8:30 PM</p>
                <p className="text-sm text-sky-600 mt-3">Culto de Predicación</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">Sábado</h3>
                <p className="text-sky-700 font-medium">Horario: 6:30 PM - 8:30 PM</p>
                <p className="text-sm text-sky-600 mt-3">Culto de Predicación</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-lg border border-sky-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">Domingo</h3>
                <p className="text-sky-700 font-medium">Horario: 9:00 AM - 11:30 AM</p>
                <p className="text-sm text-sky-600 mt-1">Culto Dominical</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container py-10 bg-white">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h4 className="font-semibold text-sky-900">Próximo Servicio de Culto</h4>
            {next ? (
              <div className="mt-2">
                <p className="text-sm text-sky-700">
                  {isLive ? 'En curso: ' : 'Inicia: '}{next.label}
                </p>
                {!isLive && <p className="font-mono mt-1 text-sky-800">{remaining}</p>}
                <p className="mt-2 text-sm text-sky-600">
                  Te invitamos a unirte a la transmisión y adorar juntos a Jesús.
                </p>
                <div className="mt-3 flex gap-3">
                  <a
                    href={zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 transition-all"
                  >
                    Zoom
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-sky-600">Muy pronto</p>
            )}
          </div>
          {/* Tarjeta de donaciones movida fuera de Home */}
        </div>
      </section>
      {/* Dirección trasladada al footer */}

      {/* Calendario movido a la página de Eventos */}
    </div>
  )
}
