import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, type MouseEvent } from 'react'
import GlobalSearch from './GlobalSearch'
import { useLiveService } from '../hooks/useLiveService'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { isLive, zoomLink } = useLiveService()

  const handleHome = () => {
    setOpen(false)
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  const handleServicios = (event?: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    setOpen(false)
    if (location.pathname === '/') {
      event?.preventDefault()
      const element = document.getElementById('servicios')
      element?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#servicios'
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={handleHome} className="text-left font-serif text-xl font-semibold tracking-wide text-slate-900">
          Iglesia Cristiana <span className="text-blue-600">Luz y Vida</span> de Dios
        </button>

        <nav className="hidden items-center gap-6 lg:flex text-slate-700">
          <button onClick={handleHome} className="text-sm font-medium transition hover:text-blue-600 bg-none border-none cursor-pointer">
            Inicio
          </button>
          <a
            href="/#servicios"
            onClick={handleServicios}
            className="text-sm font-medium transition hover:text-blue-600"
          >
            Servicios
          </a>
          <Link to="/oracion" className="text-sm font-medium transition hover:text-blue-600">
            Oración
          </Link>
          <Link to="/multimedia" className="text-sm font-medium transition hover:text-blue-600">
            Multimedia
          </Link>
          <Link to="/blog" className="text-sm font-medium transition hover:text-blue-600">
            Blog
          </Link>
          <Link to="/sobre-nosotros" className="text-sm font-medium transition hover:text-blue-600">
            Sobre Nosotros
          </Link>
          <Link to="/contacto" className="text-sm font-medium transition hover:text-blue-600">
            Contacto
          </Link>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4">
          <div className="relative">
            {/* Compact search: icon expands input on click */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              aria-label="Buscar"
              className="rounded-full p-2 hover:bg-slate-100 transition"
            >
              <span className="text-slate-600">🔎</span>
            </button>
            {searchOpen && (
              <div className="absolute right-0 mt-2">
                <GlobalSearch compact />
              </div>
            )}
          </div>

          <a
            href={isLive ? zoomLink : '/transmisiones'}
            target={isLive ? '_blank' : undefined}
            rel={isLive ? 'noreferrer' : undefined}
            className={
              'relative rounded-full px-4 py-2 text-sm font-semibold transition ' +
              (isLive
                ? 'bg-emerald-600 text-white shadow-md animate-pulse'
                : 'bg-white/10 text-slate-900 border border-slate-200')
            }
          >
            Conéctate
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label="Abrir menú"
        >
          Menú
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-3 text-slate-700">
            <button onClick={handleHome} className="text-base font-medium hover:text-blue-600 text-left bg-none border-none cursor-pointer">
              Inicio
            </button>
            <a
              href="/#servicios"
              onClick={handleServicios}
              className="text-base font-medium hover:text-blue-600 text-left"
            >
              Servicios
            </a>
            <Link to="/oracion" onClick={() => setOpen(false)} className="text-base font-medium hover:text-blue-600">
              Oración
            </Link>
            <Link to="/multimedia" onClick={() => setOpen(false)} className="text-base font-medium hover:text-blue-600">
              Multimedia
            </Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="text-base font-medium hover:text-blue-600">
              Blog
            </Link>
            <Link to="/sobre-nosotros" onClick={() => setOpen(false)} className="text-base font-medium hover:text-blue-600">
              Sobre Nosotros
            </Link>
            <Link to="/contacto" onClick={() => setOpen(false)} className="text-base font-medium hover:text-blue-600 text-left">
              Contacto
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
