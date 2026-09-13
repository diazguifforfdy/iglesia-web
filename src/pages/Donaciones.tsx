import { useEffect, useState, type ReactNode } from 'react'
import { CreditCard, Landmark, Mail, MessageCircle } from 'lucide-react'
import { getDocData } from '../services/firestore'

type DonacionesCfg = {
  banco?: string
  tipoCuenta?: string
  cuenta?: string
  titular?: string
  ruc?: string
  enlace?: string
  correo?: string
  nota?: string
}

const DEFAULT_CFG: DonacionesCfg = {
  banco: 'Banco de ejemplo',
  tipoCuenta: 'Cuenta corriente',
  cuenta: '000-000000-0',
  titular: 'Iglesia Cristiana Luz y Vida de Dios',
  ruc: '0000000000001',
  correo: 'iglesialuzyvidadedios@gmail.com'
}

const WHATSAPP_URL = 'https://wa.me/593939986526?text=Hola%2C%20quiero%20enviar%20un%20comprobante%20de%20donaci%C3%B3n'

export default function Donaciones() {
  const [cfg, setCfg] = useState<DonacionesCfg>(DEFAULT_CFG)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getDocData<DonacionesCfg>('config', 'donaciones')
        if (data) setCfg({ ...DEFAULT_CFG, ...data })
      } catch {
        setCfg(DEFAULT_CFG)
      }
    })()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Generosidad con propósito</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">Sembrando en la Obra</h1>
        <p className="mx-auto mt-5 max-w-2xl font-serif text-lg italic leading-8 text-slate-600">
          “Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre.”
        </p>
        <p className="mt-3 text-sm font-semibold tracking-wide text-teal-600">2 Corintios 9:7</p>
        {cfg.nota && <p className="mx-auto mt-5 max-w-xl text-sm text-slate-500">{cfg.nota}</p>}
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard size={25} /></div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">Tarjeta o PayPal</h2>
          <p className="mt-3 leading-7 text-slate-600">Realiza tu aporte de forma cómoda mediante tarjeta de crédito, débito o PayPal desde cualquier lugar.</p>
          <button type="button" disabled className="mt-8 w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-md opacity-90">Donar con PayPal</button>
          <p className="mt-3 text-center text-xs text-slate-400">Próximamente habilitaremos los pagos en línea.</p>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-8 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Landmark size={25} /></div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">Transferencia bancaria</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <BankRow label="Banco" value={cfg.banco} />
            <BankRow label="Tipo de cuenta" value={cfg.tipoCuenta} />
            <BankRow label="Número" value={cfg.cuenta} />
            <BankRow label="Nombre" value={cfg.titular} />
            <BankRow label="RUC / Identificación" value={cfg.ruc} />
            <BankRow label="Correo" value={cfg.correo} icon={<Mail size={14} />} />
          </dl>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-5 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"><MessageCircle size={18} /> Enviar comprobante por WhatsApp</a>
        </section>
      </div>
    </main>
  )
}

function BankRow({ label, value, icon }: { label: string; value?: string; icon?: ReactNode }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0"><dt className="flex items-center gap-1 text-slate-500">{icon}{label}</dt><dd className="text-right font-medium text-slate-800">{value || 'Por confirmar'}</dd></div>
}
