import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/sobre-nosotros', label: 'Sobre nosotros' },
  { to: '/planifica', label: 'Planifica tu visita' },
  { to: '/transmisiones', label: 'Transmisiones' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/oracion', label: 'Oración' },
  { to: '/donaciones', label: 'Donaciones' },
  { to: '/contacto', label: 'Contacto' }
]

const resources = [
  { to: '/multimedia', label: 'Multimedia' },
  { to: '/mensajes', label: 'Mensajes' },
  { to: '/estudios', label: 'Estudios' },
  { to: '/blog', label: 'Blog' },
  { to: '/programas', label: 'Programas' }
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const location = useLocation()
  useEffect(() => {
    setOpen(false)
    setResourcesOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/70 backdrop-blur border-b border-white/20 dark:border-gray-800">
      <div className="container flex items-center justify-between py-3">
        <Link to="/" className="font-semibold tracking-wide">
          <span className="text-secondary">Iglesia</span> Luz y Vida de Dios
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm hover:text-accent ${
                  isActive ? 'text-secondary' : 'text-gray-700 dark:text-gray-300'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="relative">
            <button
              onClick={() => setResourcesOpen(v => !v)}
              className="flex items-center gap-1 text-sm hover:text-accent text-gray-700 dark:text-gray-300 focus:outline-none"
              aria-expanded={resourcesOpen}
            >
              Recursos
              <span
                className={`text-xs opacity-70 transition-transform ${
                  resourcesOpen ? 'rotate-180' : ''
                }`}
              >
                ⌄
              </span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 transition duration-200 ease-out transform origin-top-right ${
                resourcesOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              {resources.map((r) => (
                <NavLink
                  key={r.to}
                  to={r.to}
                  onClick={() => setResourcesOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-secondary' : 'text-gray-700 dark:text-gray-200'
                    } hover:bg-secondary/10 dark:hover:bg-secondary/20 hover:text-accent transition`
                  }
                >
                  {r.label}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/admin/login" className="text-sm px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90">
            Admin
          </NavLink>
          <ThemeToggle />
        </nav>
        <button onClick={() => setOpen(v => !v)} className="md:hidden inline-flex items-center px-3 py-2 rounded border">
          Menú
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t">
          <div className="container py-2 flex flex-col gap-2">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className="py-2">
                {l.label}
              </NavLink>
            ))}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Recursos
              </p>
              {resources.map((r) => (
                <NavLink
                  key={r.to}
                  to={r.to}
                  onClick={() => setOpen(false)}
                  className="py-2 pl-4"
                >
                  {r.label}
                </NavLink>
              ))}
            </div>

            <NavLink to="/admin/login" className="py-2">
              Admin
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
