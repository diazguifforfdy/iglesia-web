import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuth } from '../../context/AuthContext'

type DonacionesCfg = {
  banco?: string
  cuenta?: string
  titular?: string
  enlace?: string
  nota?: string
}

export default function DonacionesAdmin() {
  const { role } = useAuth()
  const [cfg, setCfg] = useState<DonacionesCfg>({})
  const [loading, setLoading] = useState(false)
  const canEdit = role === 'admin' || role === 'editor'

  useEffect(() => {
    (async () => {
      if (!db) return
      try {
        const snap = await getDoc(doc(db, 'config', 'donaciones'))
        setCfg((snap.data() as DonacionesCfg) ?? {})
      } catch (error) {
        console.error('Error cargando configuración de donaciones', error)
      }
    })()
  }, [])

  const save = async () => {
    if (!canEdit || !db) return
    setLoading(true)
    try {
      await setDoc(doc(db, 'config', 'donaciones'), cfg, { merge: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-primary">Donaciones (configuración)</h1>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <input className="border rounded px-3 py-2" placeholder="Banco" value={cfg.banco ?? ''} onChange={e => setCfg({ ...cfg, banco: e.target.value })} disabled={!canEdit}/>
        <input className="border rounded px-3 py-2" placeholder="Cuenta/CCI" value={cfg.cuenta ?? ''} onChange={e => setCfg({ ...cfg, cuenta: e.target.value })} disabled={!canEdit}/>
        <input className="border rounded px-3 py-2" placeholder="Titular" value={cfg.titular ?? ''} onChange={e => setCfg({ ...cfg, titular: e.target.value })} disabled={!canEdit}/>
        <input className="border rounded px-3 py-2" placeholder="Enlace (Stripe/PayPal)" value={cfg.enlace ?? ''} onChange={e => setCfg({ ...cfg, enlace: e.target.value })} disabled={!canEdit}/>
        <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Nota bíblica o mensaje" value={cfg.nota ?? ''} onChange={e => setCfg({ ...cfg, nota: e.target.value })} disabled={!canEdit}/>
      </div>
      <button onClick={save} disabled={!canEdit || loading} className="mt-4 px-4 py-2 rounded border">Guardar</button>
    </div>
  )
}
