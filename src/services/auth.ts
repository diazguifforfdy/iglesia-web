import { firebaseEnabled, auth } from '../firebase'
import type { User } from 'firebase/auth'
import { signInWithEmailAndPassword as fbSignIn, signOut as fbSignOut, sendPasswordResetEmail as fbSendPasswordReset } from 'firebase/auth'

export async function signInWithEmailAndPassword(email: string, password: string) {
  if (!firebaseEnabled || !auth) throw new Error('Firebase no está configurado')
  const result = await fbSignIn(auth, email, password)
  return result.user as User
}

export async function signOut() {
  if (!firebaseEnabled || !auth) return
  await fbSignOut(auth)
}

export async function sendPasswordReset(email: string) {
  if (!firebaseEnabled || !auth) throw new Error('Firebase no está configurado')
  await fbSendPasswordReset(auth, email)
}
