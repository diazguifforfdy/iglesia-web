import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'
import { TRANSMISIONES_COLLECTION } from '../constants'

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
  const [links, setLinks] = useState<{ zoom?: string; youtube?: string; address?: string } | null>(null)
  const [next, setNext] = useState<{ label: string; at: Date; dayIdx: number } | null>(null)
  const [remaining, setRemaining] = useState<string>('')
  const [isLive, setIsLive] = useState<boolean>(false)
  const [liveDayIdx, setLiveDayIdx] = useState<number | null>(null)
  const [transmisiones, setTransmisiones] = useState<Transmision[]>([])
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ]
  const daysShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const firstDay = new Date(currentYear, currentMonth, 1).getDay() // 0=Dom
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const offsetMonday = (firstDay + 6) % 7
  const cells: Array<number | null> = [...Array(offsetMonday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const isCultoDay = (d: number) => {
    const wd = new Date(currentYear, currentMonth, d).getDay()
    return wd === 0 || wd === 2 || wd === 4 || wd === 6
  }
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const ADDRESS =
    'Calle Vicente Rocafuerte y Gabriel García Moreno · Puerto Baquerizo Moreno – San Cristóbal – Galápagos – Ecuador'
  const ZOOM_LINKS: Record<number, string> = {
    // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    2: 'https://us02web.zoom.us/j/89279915300?pwd=e2WxAqjiJOmPR3oZF35bbFentBr4am.1', // Martes (Oración)
    4: 'https://us02web.zoom.us/j/89717791205?pwd=0Y7a2HIMW7FStb9t7lGAYyzPs4lo0O.1', // Jueves (Predicación)
    6: 'https://us02web.zoom.us/j/85930788289?pwd=J2b0ghBXRsGI1suasgQXXXsTV0qcqU.1', // Sábado (Predicación)
    0: 'https://us02web.zoom.us/j/85361011233?pwd=ebTbvyIZny6PyTFLpBMYhle5MfIXYC.1' // Domingo (Culto)
  }
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
        if (!db) return
        const snap = await getDoc(doc(db, 'versiculos', 'diario'))
        setDaily((snap.data() as Daily) ?? null)
      } catch {
        setDaily(null)
      }
    })()
  }, [])

  useMemo(() => {
    ;(async () => {
      try {
        if (!db) return
        const snap = await getDoc(doc(db, 'config', 'links'))
        setLinks((snap.data() as { zoom?: string; youtube?: string; address?: string }) ?? null)
      } catch {
        setLinks(null)
      }
    })()
  }, [])

  useEffect(() => {
    const schedule = [
      { dayIdx: 0, label: 'Domingo 9:00am', startH: 9, startM: 0, durationMin: 180 },
      { dayIdx: 2, label: 'Martes 7:00pm', startH: 19, startM: 0, durationMin: 120 },
      { dayIdx: 4, label: 'Jueves 7:00pm', startH: 19, startM: 0, durationMin: 120 },
      { dayIdx: 6, label: 'Sábado 6:00pm', startH: 18, startM: 0, durationMin: 120 }
    ]
    const compute = () => {
      const now = new Date()
      let liveFound: { dayIdx: number; end: Date } | null = null
      for (let add = 0; add < 7; add++) {
        const d = new Date(now)
        d.setDate(d.getDate() + add)
        for (const s of schedule) {
          const diff = (s.dayIdx - d.getDay() + 7) % 7
          if (diff === 0) {
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), s.startH, s.startM, 0)
            const end = new Date(start.getTime() + s.durationMin * 60000)
            if (now >= start && now < end) {
              liveFound = { dayIdx: s.dayIdx, end }
              setNext({ label: s.label, at: start, dayIdx: s.dayIdx })
              break
            }
          }
        }
        if (liveFound) break
      }
      if (liveFound) {
        setIsLive(true)
        setLiveDayIdx(liveFound.dayIdx)
        const msEnd = liveFound.end.getTime() - Date.now()
        if (msEnd <= 0) {
          setIsLive(false)
        }
        setRemaining('')
        return
      }
      let best: { label: string; at: Date; dayIdx: number } | null = null
      for (let add = 0; add < 14; add++) {
        const d = new Date(now)
        d.setDate(d.getDate() + add)
        for (const s of schedule) {
          const diff = (s.dayIdx - d.getDay() + 7) % 7
          if (diff === 0) {
            const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), s.startH, s.startM, 0)
            if (at > now) {
              best = { label: s.label, at, dayIdx: s.dayIdx }
              break
            }
          }
        }
        if (best) break
      }
      if (best) {
        setIsLive(false)
        setLiveDayIdx(null)
        setNext(best)
        const ms = best.at.getTime() - Date.now()
        if (ms <= 0) {
          setRemaining('00:00:00')
        } else {
          const h = Math.floor(ms / 1000 / 3600)
          const m = Math.floor((ms / 1000 % 3600) / 60)
          const s = Math.floor(ms / 1000 % 60)
          const pad = (n: number) => n.toString().padStart(2, '0')
          setRemaining(`${pad(h)}:${pad(m)}:${pad(s)}`)
        }
      }
    }
    compute()
    const id = setInterval(compute, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!db) return
    const q = query(
      collection(db, TRANSMISIONES_COLLECTION),
      where('activa', '==', true),
      orderBy('fechaInicio', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transmision))
      setTransmisiones(data)
    })
    return unsubscribe
  }, [])

  const submitPrayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSent(false)
    setSendError(null)
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
      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setSendError('No se pudo enviar tu petición. Inténtalo más tarde.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <motion.section
        variants={fadeUpContainer}
        initial="hidden"
        animate="visible"
        className="relative bg-gradient-to-br from-white via-sky-50 to-blue-100"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-sky-200/20 to-transparent" />
        <div className="relative container min-h-[80vh] flex items-center justify-center text-center">
          <div className="max-w-4xl py-32 md:py-48">
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold text-sky-900 font-display tracking-tight"
            >
              Jesucristo es el mismo de ayer, hoy y por los siglos
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-sky-700 mt-4 font-inter text-lg"
            >
              Hebreos 13:8
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex gap-3 justify-center">
              <a
                href={isLive && liveDayIdx !== null ? (ZOOM_LINKS[liveDayIdx] || '#') : '#'}
                target={isLive ? '_blank' : undefined}
                rel={isLive ? 'noreferrer' : undefined}
                className="px-6 py-3 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 text-sky-900 font-semibold shadow-lg hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                {isLive ? '¡Estamos en Vivo! Unirse Ahora' : remaining ? `En Vivo en ${remaining}` : 'En Vivo'}
              </a>
              <a
                href="/oracion"
                className="px-5 py-3 rounded border-2 border-sky-300 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                Petición de oración
              </a>
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
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-sky-900">Reflexión</h3>
            <p className="mt-2 text-sky-700">{daily?.reflexion ?? 'Próximamente'}</p>
          </div>
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-sky-900">Oración</h3>
            <p className="mt-2 text-sky-700">{daily?.oracion ?? 'Próximamente'}</p>
          </div>
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h3 className="text-lg font-semibold text-sky-900">Mensaje de ánimo</h3>
            <p className="mt-2 text-sky-700">{daily?.animo ?? 'Próximamente'}</p>
          </div>
        </div>
      </section>
      {/* sección de oración movida a /oracion */}

      <section className="container py-14 bg-sky-50">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="text-3xl font-bold text-center text-sky-900 mb-8"
        >
          Próximas Transmisiones
        </motion.h2>
        {transmisiones.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transmisiones.map((trans) => (
              <div key={trans.id} className="p-6 rounded-lg border border-sky-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-sky-900">{trans.titulo}</h3>
                <p className="text-sm text-sky-600 mt-1">{trans.descripcion}</p>
                <p className="text-sm text-sky-700 mt-2">
                  Fecha: {trans.fechaInicio.toDate().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {trans.predicador && <p className="text-sm text-sky-600">Predicador: {trans.predicador}</p>}
                {trans.enlaceZoom && (
                  <a 
                    href={trans.enlaceZoom} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-sky-900 rounded hover:from-yellow-500 hover:to-yellow-600 transition-all"
                  >
                    Unirse a Zoom
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sky-700">No hay transmisiones activas próximamente.</p>
        )}
      </section>

      <section className="container py-10 bg-white">
        <div className="grid md:grid-cols-3 gap-6">
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
                    href={(isLive && liveDayIdx !== null ? ZOOM_LINKS[liveDayIdx] : next && ZOOM_LINKS[next.dayIdx]) || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded bg-gradient-to-r from-yellow-400 to-yellow-500 text-sky-900 hover:from-yellow-500 hover:to-yellow-600 transition-all"
                  >
                    Zoom
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-sky-600">Muy pronto</p>
            )}
          </div>
          <div className="p-6 rounded-lg border border-sky-200 bg-sky-50/50 shadow-sm">
            <h4 className="font-semibold text-sky-900">Resumen del último culto</h4>
            <p className="text-sm text-sky-600">Muy pronto</p>
          </div>
          {/* Tarjeta de donaciones movida fuera de Home */}
        </div>
      </section>
      {/* Dirección trasladada al footer */}

      {/* Calendario movido a la página de Eventos */}
    </div>
  )
}
