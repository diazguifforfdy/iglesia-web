import { useMemo, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

type LinkCfg = {
  zoom?: string
  youtube?: string
  address?: string
}

const schedule = [
  { day: 'Martes', time: '6:30pm - 8:30pm' },
  { day: 'Jueves', time: '6:30pm - 8:30pm' },
  { day: 'Sábado', time: '6:30pm - 8:30pm' },
  { day: 'Domingo', time: '9:00am - 12:00pm' }
]

export default function CalendarAdmin() {
  const { role } = useAuth()
  const [cfg, setCfg] = useState<LinkCfg>({})
  const [loading, setLoading] = useState(false)
  const canEdit = role === 'admin' || role === 'editor'

  useMemo(() => {
    ;(async () => {
      try {
        const firestore = db
        if (!firestore) return
        const snap = await getDoc(doc(firestore, 'config', 'links'))
        setCfg((snap.data() as LinkCfg) ?? {})
      } catch {}
    })()
  }, [])

  const save = async () => {
    if (!canEdit) return
    const firestore = db
    if (!firestore) return
    setLoading(true)
    try {
      await setDoc(doc(firestore, 'config', 'links'), cfg, { merge: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-primary">Calendario Automatizado</h1>
      <p className="mt-2 text-gray-600">Horarios establecidos y accesos rápidos a Zoom/YouTube.</p>
      {!firebaseEnabled && <p className="text-sm text-gray-500 mt-1">Este preview no tiene Firebase activo; los cambios no se persistirán.</p>}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 rounded border">
          <h2 className="font-semibold">Horarios</h2>
          <ul className="mt-3 space-y-2">
            {schedule.map(s => (
              <li key={s.day} className="flex items-center justify-between">
                <span>{s.day}</span>
                <span className="text-sm text-gray-500">{s.time}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <a href={cfg.zoom || '#'} target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-primary text-white">
              Zoom
            </a>
            <a href={cfg.youtube || '#'} target="_blank" rel="noreferrer" className="px-4 py-2 rounded bg-gold text-primary">
              YouTube
            </a>
          </div>
        </div>

        <div className="p-6 rounded border">
          <h2 className="font-semibold">Configuración de enlaces</h2>
          <div className="mt-3 space-y-3">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="URL Zoom"
              value={cfg.zoom ?? ''}
              onChange={e => setCfg({ ...cfg, zoom: e.target.value })}
              disabled={!canEdit}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="URL YouTube"
              value={cfg.youtube ?? ''}
              onChange={e => setCfg({ ...cfg, youtube: e.target.value })}
              disabled={!canEdit}
            />
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Dirección física (opcional)"
              value={cfg.address ?? ''}
              onChange={e => setCfg({ ...cfg, address: e.target.value })}
              disabled={!canEdit}
            />
            <button onClick={save} disabled={!canEdit || loading || !firebaseEnabled || !db} className="px-4 py-2 rounded border">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
