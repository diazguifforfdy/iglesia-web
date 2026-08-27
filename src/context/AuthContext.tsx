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
        // Try a few times to read the role document, in case auth token
        // hasn't fully propagated or Firestore needs a moment.
        let attempts = 0
        let got = false
        while (attempts < 3 && !got) {
          attempts += 1
          try {
            const snap = await getDoc(doc(db, 'roles', u.uid))
            const data = snap.data() as { role?: Role; isAdmin?: boolean } | undefined
            if (data) {
              if (data.role) setRole(data.role)
              else if (data.isAdmin) setRole('admin')
              else setRole('user')
            } else {
              setRole('user')
            }
            got = true
          } catch (err) {
            // transient error: wait a bit and retry
            if (attempts < 3) await new Promise(r => setTimeout(r, 600))
            else {
              // If still failing after retries, leave role null so ProtectedRoute
              // doesn't prematurely reject — the app can reattempt later.
              console.warn('Could not read roles document after retries', err)
              setRole(null)
            }
          }
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
