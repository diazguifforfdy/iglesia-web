import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  Music,
  BookOpen,
  Image,
  CalendarDays,
  MessageSquare,
  CreditCard,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/auth'

type NavItem = {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Inicio / Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/transmisiones', label: 'Transmisión en Vivo', icon: Radio },
  { to: '/admin/audios', label: 'Alabanzas (Audios)', icon: Music },
  { to: '/admin/biblioteca', label: 'Biblioteca (Himnarios)', icon: BookOpen },
  { to: '/admin/multimedia', label: 'Galería (Fotos)', icon: Image },
  { to: '/admin/calendario', label: 'Calendario & Horarios', icon: CalendarDays },
  { to: '/admin/comentarios', label: 'Comentarios', icon: MessageSquare, adminOnly: true },
  { to: '/admin/donaciones', label: 'Donaciones', icon: CreditCard }
]

export default function AdminLayout() {
  const { user, role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = NAV_ITEMS.filter(item => !item.adminOnly || role === 'admin')

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-secondary/20 text-secondary-light'
        : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex items-center gap-2 px-5 py-6 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary font-display font-bold">
          IL
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Panel Admin</p>
          <p className="text-xs text-slate-400 leading-tight">Iglesia Luz y Vida</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClasses}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <p className="px-3 pb-2 text-xs text-slate-400 truncate">{user?.email}</p>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fija (escritorio) */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar deslizable (móvil) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl relative">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-4 z-10 text-slate-300 hover:text-white"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900 text-slate-100 px-4 py-3">
          <span className="text-sm font-semibold">Panel Admin</span>
          <button onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
