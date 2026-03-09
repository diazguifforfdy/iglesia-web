import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom'

export default function ErrorBoundary() {
  const error = useRouteError()
  let title = 'Ha ocurrido un error'
  let message = 'Algo no salió como esperábamos.'

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Página no encontrada'
      message = 'No pudimos encontrar el recurso solicitado.'
    } else {
      title = `Error ${error.status}`
      message = error.statusText || message
    }
  }

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-display text-primary">{title}</h1>
      <p className="mt-2 text-gray-600">{message}</p>
      <div className="mt-6 flex gap-4">
        <Link to="/" className="text-gold hover:underline">
          Ir al inicio
        </Link>
        <Link to="/estudios" className="text-gold hover:underline">
          Ir a Estudios
        </Link>
      </div>
    </div>
  )
}
