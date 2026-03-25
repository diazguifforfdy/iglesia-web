import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-16">
      <h1 className="text-3xl font-display text-primary">Página no encontrada</h1>
      <p className="mt-2 text-gray-600">Verifica la dirección o navega a una sección disponible.</p>
      <div className="mt-6 flex gap-4">
        <Link to="/" className="text-secondary hover:underline">Inicio</Link>
        <Link to="/estudios" className="text-secondary hover:underline">Estudios Bíblicos</Link>
      </div>
    </div>
  )
}
