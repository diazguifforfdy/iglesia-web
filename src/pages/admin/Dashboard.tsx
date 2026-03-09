import { useAuth } from '../../context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase'

export default function AdminDashboard() {
  const { user, role } = useAuth()
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-primary">Panel administrativo</h1>
      <p className="mt-2 text-sm">Bienvenido {user?.email} · Rol: {role}</p>
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <a href="/admin/calendario" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
          <h3 className="font-semibold">Calendario</h3>
          <p className="text-sm text-gray-600">Horarios y enlaces Zoom/YouTube</p>
        </a>
        <a href="/admin/multimedia" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
          <h3 className="font-semibold">Multimedia</h3>
          <p className="text-sm text-gray-600">PDFs, música y galería</p>
        </a>
        <a href="/admin/transmisiones" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
          <h3 className="font-semibold">Transmisiones en Vivo</h3>
          <p className="text-sm text-gray-600">Gestionar transmisiones Zoom</p>
        </a>
        <a href="/admin/donaciones" className="p-4 rounded border hover:bg-gray-50 dark:hover:bg-gray-800">
          <h3 className="font-semibold">Donaciones</h3>
          <p className="text-sm text-gray-600">Información bancaria y enlace</p>
        </a>
      </div>
      <button onClick={() => auth && signOut(auth)} className="mt-8 px-4 py-2 rounded border">
        Cerrar sesión
      </button>
    </div>
  )
}
