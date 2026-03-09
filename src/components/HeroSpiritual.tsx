export default function HeroSpiritual() {
  const VERSES = [
    { texto: 'Esforzaos y cobrad ánimo; no temáis, ni tengáis miedo...', referencia: 'Deuteronomio 31:6' },
    { texto: 'Todo lo puedo en Cristo que me fortalece.', referencia: 'Filipenses 4:13' },
    { texto: 'Porque yo sé los planes que tengo para vosotros...', referencia: 'Jeremías 29:11' },
    { texto: 'La paz os dejo, mi paz os doy; no se turbe vuestro corazón.', referencia: 'Juan 14:27' },
    { texto: 'Jehovaha es mi luz y mi salvación; ¿de quién temeré?', referencia: 'Salmo 27:1' }
  ]

  const today = new Date().getDate()
  const dailyVerse = VERSES[(today - 1) % VERSES.length]

  return (
    <div className="relative min-h-[600px] bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 overflow-hidden">
      {/* Efecto de luz de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Contenido */}
      <div className="relative container h-full flex flex-col items-center justify-center py-20 md:py-32">
        <div className="text-center max-w-3xl">
          {/* Icono animado */}
          <div className="inline-block mb-6">
            <div className="text-6xl md:text-7xl animate-pulse">✨</div>
          </div>

          {/* Título principal */}
          <h1 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-wide leading-tight">
            Iglesia Luz y Vida<br />de Dios
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-300 font-light mb-10 tracking-wide">
            Conectados en fe, unidos en propósito
          </p>

          {/* Verso del día */}
          <div className="max-w-2xl mx-auto mb-10 p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <p className="text-white/90 text-lg font-light italic mb-3 leading-relaxed">
              "{dailyVerse.texto}"
            </p>
            <p className="text-white/60 text-sm font-light">
              {dailyVerse.referencia}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/transmisiones"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-light tracking-wide transition duration-300 shadow-lg hover:shadow-xl"
            >
              📡 Ver Transmisiones
            </a>
            <a
              href="/oracion"
              className="px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 hover:border-white/50 font-light tracking-wide transition duration-300"
            >
              🙏 Solicitar Oración
            </a>
          </div>
        </div>
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </div>
  )
}
