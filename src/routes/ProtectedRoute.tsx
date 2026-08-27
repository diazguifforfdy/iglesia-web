import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { addAuditLog } from '../services/firestore'

export default function ProtectedRoute({ children, roles, feature }: { children: ReactNode; roles?: string[]; feature?: string }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (user && feature) {
      void addAuditLog('access', { uid: user.uid, feature, path: location.pathname })
    }
  }, [user, feature, location.pathname])

  if (loading) return <div className="container py-10">Cargando...</div>
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />
  return <>{children}</>
}
