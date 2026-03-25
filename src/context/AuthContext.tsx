import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../firebase'

type Role = 'admin' | 'editor' | 'user'

type AuthCtx = {
  user: User | null
  role: Role | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, role: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u && db) {
        try {
          const snap = await getDoc(doc(db, 'roles', u.uid))
          const data = snap.data() as { role?: Role } | undefined
          setRole(data?.role ?? 'user')
        } catch {
          setRole('user')
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return <Ctx.Provider value={{ user, role, loading }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
