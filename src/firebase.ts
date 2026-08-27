import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const readEnv = (name: string) => {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

const requiredEnv = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID')
}

const firebaseConfig: FirebaseOptions = {
  ...requiredEnv,
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID') || undefined
}

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase()}`)

export const firebaseEnabled = missingEnv.length === 0

let app: FirebaseApp | null = null
export let auth: Auth | null = null
export let db: Firestore | null = null
export let storage: FirebaseStorage | null = null

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  } catch (error) {
    console.warn('Firebase no se pudo inicializar. La app seguirá funcionando en modo sin conexión a Firebase.', error)
    app = null
    auth = null
    db = null
    storage = null
  }
} else if (import.meta.env.DEV) {
  console.warn(`Firebase no se inicializó. Variables VITE_FIREBASE faltantes: ${missingEnv.join(', ')}`)
}