export default function SobreNosotros() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-primary">Sobre nosotros</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold">Historia</h2>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Contenido editable desde el panel.</p>
          <h3 className="mt-6 text-lg font-semibold">Misión</h3>
          <p className="mt-2">Contenido editable.</p>
          <h3 className="mt-6 text-lg font-semibold">Visión</h3>
          <p className="mt-2">Contenido editable.</p>
          <h3 className="mt-6 text-lg font-semibold">Valores</h3>
          <p className="mt-2">Contenido editable.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Nuestro Pastor</h3>
          <div className="mt-2 aspect-video bg-gray-100 dark:bg-gray-800 rounded" />
          <h3 className="mt-6 text-lg font-semibold">Equipo ministerial</h3>
          <div className="mt-2 h-40 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  )
}
