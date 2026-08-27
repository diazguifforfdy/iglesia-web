import { useEffect, useState } from 'react'
import { Music, BookOpen, MessageSquare, Radio } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getCollectionCount, getCollectionWhereOrdered } from '../../services/firestore'
import { TRANSMISIONES_COLLECTION } from '../../constants'

type Stat = {
  label: string
  value: string
  icon: typeof Music
  accent: string
}

export default function AdminDashboard() {
  const { user, role } = useAuth()
  const [stats, setStats] = useState<Stat[] | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const [audios, biblioteca, comments, transmisiones] = await Promise.all([
        getCollectionCount('audios_alabanza'),
        getCollectionCount('biblioteca'),
        getCollectionCount('comments'),
        getCollectionWhereOrdered(TRANSMISIONES_COLLECTION)
      ])
      if (!active) return
      const hayTransmisionActiva = (transmisiones as any[]).some(t => t.activa)
      setStats([
        { label: 'Audios de alabanza', value: String(audios), icon: Music, accent: 'text-emerald-500 bg-emerald-500/10' },
        { label: 'Biblioteca (enlaces)', value: String(biblioteca), icon: BookOpen, accent: 'text-amber-500 bg-amber-500/10' },
        { label: 'Comentarios recibidos', value: String(comments), icon: MessageSquare, accent: 'text-sky-500 bg-sky-500/10' },
        {
          label: 'Transmisión en vivo',
          value: hayTransmisionActiva ? 'Activa' : 'Inactiva',
          icon: Radio,
          accent: hayTransmisionActiva ? 'text-red-500 bg-red-500/10' : 'text-slate-500 bg-slate-500/10'
        }
      ])
    })()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-primary">Bienvenido, {user?.email}</h1>
      <p className="mt-1 text-sm text-gray-500">Rol: {role ?? 'sin definir'}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {(stats ?? Array.from({ length: 4 })).map((stat, i) => (
          <div
            key={stat ? stat.label : i}
            className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm"
          >
            {stat ? (
              <>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.accent}`}>
                  <stat.icon size={20} />
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </>
            ) : (
              <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
