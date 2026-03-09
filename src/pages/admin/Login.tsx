import { FormEvent, useState } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, firebaseEnabled } from '../../firebase'
import { useLocation, useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation() as any

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!firebaseEnabled || !auth) throw new Error('Firebase no está configurado en este entorno de preview')
      await signInWithEmailAndPassword(auth, email, password)
      const to = location.state?.from?.pathname || '/admin'
      navigate(to, { replace: true })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onReset = async () => {
    if (!email) return
    try {
      if (!firebaseEnabled || !auth) throw new Error('Firebase no está configurado en este entorno de preview')
      await sendPasswordResetEmail(auth, email)
      setError('Se envió un correo para restablecer la contraseña')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="container py-16 max-w-md">
      <h1 className="text-2xl font-bold text-primary">Acceso administrativo</h1>
      {!firebaseEnabled && (
        <p className="mt-2 text-sm text-gray-600">
          Este preview no tiene Firebase configurado. El acceso real se habilitará en el despliegue oficial.
        </p>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Correo"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between">
          <button disabled={loading} className="px-4 py-2 rounded bg-primary text-white">
            Entrar
          </button>
          <button type="button" onClick={onReset} className="text-sm text-gold">
            Olvidé mi contraseña
          </button>
        </div>
      </form>
    </div>
  )
}
