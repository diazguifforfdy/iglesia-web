import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container py-10">Cargando...</div>
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />
  return <>{children}</>
}
