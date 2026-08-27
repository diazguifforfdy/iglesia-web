import { useEffect, useState } from 'react'

interface ScheduleItem {
  dayIdx: number
  label: string
  startH: number
  startM: number
  durationMin: number
}

export interface NextService {
  label: string
  at: Date
  dayIdx: number
}

// 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
const SCHEDULE: ScheduleItem[] = [
  { dayIdx: 0, label: 'Domingo 9:00am', startH: 9, startM: 0, durationMin: 180 },
  { dayIdx: 2, label: 'Martes 6:30pm', startH: 18, startM: 30, durationMin: 120 },
  { dayIdx: 4, label: 'Jueves 6:30pm', startH: 18, startM: 30, durationMin: 120 },
  { dayIdx: 6, label: 'Sábado 6:30pm', startH: 18, startM: 30, durationMin: 120 }
]

export const ZOOM_LINKS: Record<number, string> = {
  2: 'https://us02web.zoom.us/j/89279915300?pwd=e2WxAqjiJOmPR3oZF35bbFentBr4am.1', // Martes (Oración)
  4: 'https://us02web.zoom.us/j/89717791205?pwd=0Y7a2HIMW7FStb9t7lGAYyzPs4lo0O.1', // Jueves (Predicación)
  6: 'https://us02web.zoom.us/j/85930788289?pwd=J2b0ghBXRsGI1suasgQXXXsTV0qcqU.1', // Sábado (Predicación)
  0: 'https://us02web.zoom.us/j/85361011233?pwd=ebTbvyIZny6PyTFLpBMYhle5MfIXYC.1' // Domingo (Culto)
}

// Estado global (basado en horario) de si hay un culto en vivo ahora mismo,
// usado por Navbar, Home y Transmisiones para mantenerse sincronizados.
export function useLiveService() {
  const [isLive, setIsLive] = useState(false)
  const [liveDayIdx, setLiveDayIdx] = useState<number | null>(null)
  const [next, setNext] = useState<NextService | null>(null)
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const compute = () => {
      const now = new Date()

      for (const s of SCHEDULE) {
        const start = new Date(now)
        start.setHours(s.startH, s.startM, 0, 0)
        const end = new Date(start.getTime() + s.durationMin * 60000)

        if (now.getDay() === s.dayIdx && now >= start && now < end) {
          setIsLive(true)
          setLiveDayIdx(s.dayIdx)
          setNext({ label: s.label, at: start, dayIdx: s.dayIdx })
          setRemaining('')
          return
        }
      }

      let nextService: NextService | null = null
      for (let i = 0; i < 7; i++) {
        const futureDate = new Date(now)
        futureDate.setDate(now.getDate() + i)

        for (const s of SCHEDULE) {
          if (futureDate.getDay() === s.dayIdx) {
            const serviceTime = new Date(futureDate)
            serviceTime.setHours(s.startH, s.startM, 0, 0)

            if (serviceTime > now) {
              nextService = { label: s.label, at: serviceTime, dayIdx: s.dayIdx }
              break
            }
          }
        }
        if (nextService) break
      }

      setIsLive(false)
      setLiveDayIdx(null)

      if (nextService) {
        setNext(nextService)
        const ms = nextService.at.getTime() - Date.now()
        if (ms <= 0) {
          setRemaining('00:00:00')
        } else {
          const h = Math.floor(ms / 1000 / 3600)
          const m = Math.floor((ms / 1000 % 3600) / 60)
          const s = Math.floor(ms / 1000 % 60)
          const pad = (n: number) => n.toString().padStart(2, '0')
          setRemaining(`${pad(h)}:${pad(m)}:${pad(s)}`)
        }
      } else {
        setNext(null)
        setRemaining('')
      }
    }

    compute()
    const id = setInterval(compute, 1000)
    return () => clearInterval(id)
  }, [])

  const zoomLink = (liveDayIdx !== null ? ZOOM_LINKS[liveDayIdx] : next ? ZOOM_LINKS[next.dayIdx] : undefined) ?? '#'

  return { isLive, liveDayIdx, next, remaining, zoomLink }
}
