export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 text-white border-t border-white/10">
      <div className="container py-10 grid gap-6 md:grid-cols-3 items-center">
        <div className="order-2 md:order-1 text-center md:text-left">
          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Iglesia Luz y Vida de Dios
          </p>
        </div>
        <div className="order-1 md:order-2 flex flex-col items-center gap-2">
          <a
            href="https://www.google.com/maps/place/Iglesia+%22LUZ+Y+VIDA+DE+DIOS%22/@-0.9027687,-89.6100016,20.64z/data=!4m6!3m5!1s0x9000e90e98214053:0x47074749efd5532e!8m2!3d-0.9029383!4d-89.6099119!16s%2Fg%2F11rgz2qtwy?entry=ttu&g_ep=EgoyMDI2MDMwNC4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm text-gray-300 hover:text-secondary transition-colors"
            aria-label="Abrir ubicación en Google Maps"
            title="Ver ubicación"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/20 text-gray-300 group-hover:text-primary group-hover:bg-secondary/20 transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5Z" />
              </svg>
            </span>
            <span className="font-inter">Puerto Baquerizo Moreno, Galápagos, Ecuador</span>
          </a>
        </div>
        <div className="order-3 text-center md:text-right">
          <span className="text-sm text-gray-300">“Conforme al corazón de Dios”</span>
        </div>
      </div>
    </footer>
  )
}
