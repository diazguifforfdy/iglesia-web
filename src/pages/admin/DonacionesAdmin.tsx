import { useEffect, useState } from 'react'
import { getDocData, setDocData } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { inputClass, labelClass, cardClass } from './adminUi'

type DonacionesCfg = {
  banco?: string
  cuenta?: string
  titular?: string
  enlace?: string
  nota?: string
}

export default function DonacionesAdmin() {
  const { role } = useAuth()
  const { addNotification } = useNotification()
  const [cfg, setCfg] = useState<DonacionesCfg>({})
  const [loading, setLoading] = useState(false)
  const canEdit = role === 'admin' || role === 'editor'

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getDocData<DonacionesCfg>('config', 'donaciones')
        setCfg((data as DonacionesCfg) ?? {})
      } catch (error) {
        console.error('Error cargando configuración de donaciones', error)
      }
    })()
  }, [])

  const save = async () => {
    if (!canEdit) return
    setLoading(true)
    try {
      await setDocData('config', 'donaciones', cfg, true)
      addNotification({ type: 'success', message: 'Configuración de donaciones guardada' })
    } catch (err) {
      console.error(err)
      addNotification({ type: 'error', message: 'Error al guardar la configuración' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-primary">Donaciones (configuración)</h1>
      <div className={`${cardClass} grid md:grid-cols-2 gap-4 mt-6 max-w-3xl`}>
        <div>
          <label className={labelClass}>Banco</label>
          <input className={inputClass} value={cfg.banco ?? ''} onChange={e => setCfg({ ...cfg, banco: e.target.value })} disabled={!canEdit} />
        </div>
        <div>
          <label className={labelClass}>Cuenta/CCI</label>
          <input className={inputClass} value={cfg.cuenta ?? ''} onChange={e => setCfg({ ...cfg, cuenta: e.target.value })} disabled={!canEdit} />
        </div>
        <div>
          <label className={labelClass}>Titular</label>
          <input className={inputClass} value={cfg.titular ?? ''} onChange={e => setCfg({ ...cfg, titular: e.target.value })} disabled={!canEdit} />
        </div>
        <div>
          <label className={labelClass}>Enlace (Stripe/PayPal)</label>
          <input className={inputClass} value={cfg.enlace ?? ''} onChange={e => setCfg({ ...cfg, enlace: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Nota bíblica o mensaje</label>
          <textarea className={inputClass} rows={3} value={cfg.nota ?? ''} onChange={e => setCfg({ ...cfg, nota: e.target.value })} disabled={!canEdit} />
        </div>
        <div className="md:col-span-2">
          <button
            onClick={save}
            disabled={!canEdit || loading}
            className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
