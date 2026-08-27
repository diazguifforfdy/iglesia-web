export default function SobreNosotros() {
  return (
    <div className="bg-sky-50 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.4em] text-blue-600">Iglesia Luz y Vida</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-sky-900">Sobre Nosotros</h1>
          <p className="mt-4 text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
            Somos una comunidad de fe en San Cristóbal que vive el mensaje de la hora con devoción,
            unidad y esperanza para preparar a la Novia de Cristo.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-10">
            <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-sm font-semibold text-white">
                  Nuestra Historia
                </span>
              </div>
              <p className="text-slate-700 leading-8">
                La Iglesia Luz y Vida reúne hoy a cerca de 50 hermanos y hermanas que caminan juntos en la fe.
                Nuestro templo en San Cristóbal es un lugar de calidez espiritual, donde la Palabra viva se predica con
                claridad y se vive en comunión.
              </p>
              <p className="mt-6 text-slate-700 leading-8">
                Creemos que Dios ha enviado un mensaje especial en esta última edad mediante un profeta que ha
                llamado al pueblo de Dios a prepararse. Este mensaje es para la Novia, para el Cuerpo de Jesucristo,
                el pequeño rebaño que guarda la verdad y espera su regreso.
              </p>
            </section>

            <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-1 text-sm font-semibold text-slate-900">
                  Visión espiritual
                </span>
              </div>
              <p className="text-slate-700 leading-8">
                Nuestra visión es ser una Novia preparada con la vestidura de la Palabra y la revelación del mensaje de la hora.
                No queremos dejarnos llevar por las modas del mundo, sino abrir nuestros ojos espirituales para permanecer firmes
                en la verdad y ser mejores cristianos mientras esperamos la venida del Señor.
              </p>
            </section>

            <section className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <div className="mb-6">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-1 text-sm font-semibold text-white">
                  Misión
                </span>
              </div>
              <p className="text-slate-700 leading-8">
                Nuestra misión es preparar el corazón de cada miembro para ser parte de la Novia de Cristo.
                Lo hacemos a través de la Palabra, el estudio profundo del mensaje de la hora y la vida práctica,
                formando discípulos que vivan con un enfoque celestial y firmeza espiritual.
              </p>
            </section>
          </div>

          <div className="space-y-10">
            <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200 bg-slate-100">
              <img loading="lazy"
                src="/IMG_20230917_123411.jpg"
                alt="Congregación Iglesia Luz y Vida en San Cristóbal"
                className="w-full h-full object-cover min-h-[380px]"
              />
              <div className="p-6 bg-white">
                <h2 className="text-2xl font-bold text-slate-900">Nuestra congregación</h2>
                <p className="mt-3 text-slate-700 leading-7">
                  Esta imagen muestra a la congregación reunida en adoración y comunión. Si no aparece,
                  coloca el archivo <strong>IMG_20230917_123411.jpg</strong> en la carpeta <strong>public/</strong>.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900">Liderazgo</h2>
              <p className="mt-4 text-slate-700 leading-8">
                Nuestro pastor guía a la congregación con entrega, pastoreando con amor y enseñando con claridad el mensaje de la última hora.
                Su llamado es formar una iglesia que vive en santidad, oración y comunión.
              </p>
              <div className="mt-8 rounded-3xl bg-sky-50 border border-sky-100 p-6">
                <p className="text-slate-600 text-sm uppercase tracking-[0.3em] mb-3">Dirección pastoral</p>
                <p className="text-slate-800 font-semibold text-lg">Pastor de la Iglesia</p>
                <p className="mt-3 text-slate-700 leading-7">
                  Nuestro liderazgo pastoral acompaña a cada miembro con la Palabra, buscando siempre ser ejemplo de fe y servicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
