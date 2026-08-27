import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../../firebase'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Plus, Save, Trash2 } from 'lucide-react'
import { inputClass, cardClass } from './adminUi'

type LinkCfg = {
  zoom?: string
  youtube?: string
  address?: string
}

type ScheduleItem = {
  day: string
  time: string
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { day: 'Martes', time: '6:30pm - 8:30pm' },
  { day: 'Jueves', time: '6:30pm - 8:30pm' },
  { day: 'Sábado', time: '6:30pm - 8:30pm' },
  { day: 'Domingo', time: '9:00am - 12:00pm' }
]

export default function CalendarAdmin() {
  const { role } = useAuth()
  const { addNotification } = useNotification()
  const [cfg, setCfg] = useState<LinkCfg>({})
  const [schedule, setSchedule] = useState<ScheduleItem[]>(DEFAULT_SCHEDULE)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const canEdit = role === 'admin' || role === 'editor'

  useEffect(() => {
    (async () => {
      try {
        const firestore = db
        if (!firestore) {
          setLoadingData(false)
          return
        }
        const [linksSnap, scheduleSnap] = await Promise.all([
          getDoc(doc(firestore, 'config', 'links')),
          getDoc(doc(firestore, 'config', 'schedule'))
        ])
        setCfg((linksSnap.data() as LinkCfg) ?? {})
        const scheduleData = scheduleSnap.data() as { items?: ScheduleItem[] } | undefined
        setSchedule(scheduleData?.items?.length ? scheduleData.items : DEFAULT_SCHEDULE)
      } catch (error) {
        console.error('Error loading calendar links', error)
      } finally {
        setLoadingData(false)
      }
    })()
  }, [])

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    setSchedule(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const addScheduleItem = () => {
    setSchedule(prev => [...prev, { day: 'Lunes', time: '' }])
  }

  const removeScheduleItem = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    if (!canEdit) return
    const firestore = db
    if (!firestore) return
    setLoading(true)
    try {
      await Promise.all([
        setDoc(doc(firestore, 'config', 'links'), cfg, { merge: true }),
        setDoc(doc(firestore, 'config', 'schedule'), { items: schedule }, { merge: true })
      ])
      addNotification({ type: 'success', message: 'Calendario y enlaces actualizados correctamente' })
    } catch (err) {
      console.error('Error saving calendar', err)
      addNotification({ type: 'error', message: 'Error al guardar los cambios' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-primary">Calendario & Horarios</h1>
      <p className="mt-2 text-gray-600">Edita los días/horas de los cultos y los accesos rápidos a Zoom/YouTube.</p>
      {!firebaseEnabled && <p className="text-sm text-gray-500 mt-1">Este preview no tiene Firebase activo; los cambios no se persistirán.</p>}
      {!canEdit && <p className="text-sm text-amber-600 mt-1">Tu rol no permite editar esta sección.</p>}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800">Horarios de Culto</h2>
          {loadingData ? (
            <p className="mt-3 text-sm text-gray-500">Cargando...</p>
          ) : (
            <div className="mt-3 space-y-3">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    className={`w-1/3 ${inputClass}`}
                    placeholder="Día"
                    value={item.day}
                    onChange={e => updateScheduleItem(index, 'day', e.target.value)}
                    disabled={!canEdit}
                  />
                  <input
                    className={`flex-1 ${inputClass}`}
                    placeholder="Horario (ej. 6:30pm - 8:30pm)"
                    value={item.time}
                    onChange={e => updateScheduleItem(index, 'time', e.target.value)}
                    disabled={!canEdit}
                  />
                  {canEdit && (
                    <button
                      onClick={() => removeScheduleItem(index)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50"
                      title="Eliminar horario"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              {canEdit && (
                <button
                  onClick={addScheduleItem}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline mt-1"
                >
                  <Plus size={16} /> Agregar horario
                </button>
              )}
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <a href={cfg.zoom || '#'} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-primary text-white text-sm">
              Zoom
            </a>
            <a href={cfg.youtube || '#'} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-secondary text-primary hover:bg-secondary/90 text-sm">
              YouTube
            </a>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="font-semibold text-gray-800">Configuración de enlaces</h2>
          <div className="mt-3 space-y-3">
            <input
              className={inputClass}
              placeholder="URL Zoom"
              value={cfg.zoom ?? ''}
              onChange={e => setCfg({ ...cfg, zoom: e.target.value })}
              disabled={!canEdit}
            />
            <input
              className={inputClass}
              placeholder="URL YouTube"
              value={cfg.youtube ?? ''}
              onChange={e => setCfg({ ...cfg, youtube: e.target.value })}
              disabled={!canEdit}
            />
            <input
              className={inputClass}
              placeholder="Dirección física (opcional)"
              value={cfg.address ?? ''}
              onChange={e => setCfg({ ...cfg, address: e.target.value })}
              disabled={!canEdit}
            />
            <button
              onClick={save}
              disabled={!canEdit || loading || !firebaseEnabled || !db}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
