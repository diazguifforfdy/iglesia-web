import { Heart, Instagram, MapPin, MessageCircle, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'

const MAPS_URL = 'https://www.google.com/maps/place/Iglesia+%22LUZ+Y+VIDA+DE+DIOS%22/@-0.9027687,-89.6100016,20.64z/data=!4m6!3m5!1s0x9000e90e98214053:0x47074749efd5532e!8m2!3d-0.9029383!4d-89.6099119!16s%2Fg%2F11rgz2qtwy?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D'
const WHATSAPP_URL = 'https://wa.me/593939986526?text=Hola%2C%20me%20gustar%C3%ADa%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20iglesia'
const FACEBOOK_URL = 'https://www.facebook.com/'
const INSTAGRAM_URL = 'https://www.instagram.com/'
const YOUTUBE_URL = 'https://www.youtube.com/'

const externalProps = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container grid grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-wide text-white">Iglesia Cristiana</h2>
          <p className="mt-1 font-serif text-lg font-semibold text-emerald-400">Luz y Vida de Dios</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">Una comunidad de fe que busca vivir conforme al corazón de Dios y servir con amor.</p>
          <a href={MAPS_URL} {...externalProps} className="mt-5 inline-flex items-start gap-2 text-sm leading-5 text-slate-400 transition hover:text-white">
            <MapPin size={17} className="mt-0.5 shrink-0 text-emerald-400" />
            Puerto Baquerizo Moreno, Galápagos, Ecuador
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Enlaces rápidos</h3>
          <nav className="mt-4 flex flex-col items-start gap-3 text-sm">
            <Link to="/sobre-nosotros" className="transition hover:text-white">Sobre Nosotros</Link>
            <Link to="/servicios" className="transition hover:text-white">Servicios</Link>
            <Link to="/multimedia" className="transition hover:text-white">Multimedia</Link>
            <Link to="/contacto" className="transition hover:text-white">Contacto</Link>
          </nav>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Apoya la obra</h3>
          <p className="mt-4 text-sm leading-6 text-slate-400">Tu generosidad ayuda a fortalecer nuestro ministerio y acompañar a más familias.</p>
          <Link to="/donaciones" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400">
            <Heart size={17} fill="currentColor" />
            Apoya nuestro ministerio
          </Link>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Conecta con nosotros</h3>
          <p className="mt-4 text-sm leading-6 text-slate-400">Sigue nuestras actividades y mantente cerca de la comunidad.</p>
          <div className="mt-5 flex items-center gap-3">
            <a href={FACEBOOK_URL} {...externalProps} aria-label="Facebook" title="Facebook" className="rounded-full border border-slate-700 p-2.5 text-slate-400 transition hover:border-white hover:bg-white hover:text-slate-900"><span className="text-sm font-bold">f</span></a>
            <a href={INSTAGRAM_URL} {...externalProps} aria-label="Instagram" title="Instagram" className="rounded-full border border-slate-700 p-2.5 text-slate-400 transition hover:border-white hover:bg-white hover:text-slate-900"><Instagram size={17} /></a>
            <a href={YOUTUBE_URL} {...externalProps} aria-label="YouTube" title="YouTube" className="rounded-full border border-slate-700 p-2.5 text-slate-400 transition hover:border-white hover:bg-white hover:text-slate-900"><Youtube size={17} /></a>
            <a href={WHATSAPP_URL} {...externalProps} aria-label="WhatsApp" title="WhatsApp" className="rounded-full border border-slate-700 p-2.5 text-slate-400 transition hover:border-white hover:bg-white hover:text-slate-900"><MessageCircle size={17} /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Iglesia Cristiana Luz y Vida de Dios. Todos los derechos reservados.
      </div>
    </footer>
  )
}
