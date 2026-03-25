import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

type DonacionesCfg = {
  banco?: string
  cuenta?: string
  titular?: string
  enlace?: string
  nota?: string
}

export default function Donaciones() {
  const [cfg, setCfg] = useState<DonacionesCfg | null>(null)
  useEffect(() => {
    (async () => {
      if (!db) return
      try {
        const snap = await getDoc(doc(db, 'config', 'donaciones'))
        setCfg((snap.data() as DonacionesCfg) ?? null)
      } catch {
        setCfg(null)
      }
    })()
  }, [])

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto bg-white/70 dark:bg-gray-900/60 backdrop-blur rounded-2xl p-8 border">
        <h1 className="text-3xl font-bold text-primary text-center">Donaciones</h1>
        {cfg ? (
          <div className="mt-6 space-y-2 text-center">
            {cfg.nota && <p className="text-secondary">{cfg.nota}</p>}
            {cfg.banco && <p className="text-gray-700 dark:text-gray-300">Banco: {cfg.banco}</p>}
            {cfg.cuenta && <p className="text-gray-700 dark:text-gray-300">Cuenta/CCI: {cfg.cuenta}</p>}
            {cfg.titular && <p className="text-gray-700 dark:text-gray-300">Titular: {cfg.titular}</p>}
            {cfg.enlace && (
              <a href={cfg.enlace} target="_blank" rel="noreferrer" className="inline-block mt-4 px-5 py-3 rounded bg-secondary text-primary hover:bg-secondary/90">
                Donar en línea
              </a>
            )}
          </div>
        ) : (
          <p className="mt-4 text-center text-gray-600">Próximamente</p>
        )}
      </div>
    </div>
  )
}
