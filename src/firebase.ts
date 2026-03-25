import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAs6AAdToaD3vi0f_ry3yhY9LvfIZmlztg",
  authDomain: "iclvd2026.firebaseapp.com",
  projectId: "iclvd2026",
  storageBucket: "iclvd2026.firebasestorage.app",
  messagingSenderId: "789113507660",
  appId: "1:789113507660:web:e687138e36d5ad045909e9",
  measurementId: "G-NJYCDWDWE6"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const firebaseEnabled = true