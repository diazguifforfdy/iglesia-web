import { firebaseEnabled, db } from '../firebase'
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  query as fbQuery,
  where as fbWhere,
  orderBy as fbOrderBy
} from 'firebase/firestore'
import { serverTimestamp } from 'firebase/firestore'

export async function getDocData<T = any>(path: string, id: string) {
  if (!firebaseEnabled || !db) return null
  const snap = await getDoc(doc(db, path, id))
  return (snap.exists() ? (snap.data() as T) : null)
}

export async function setDocData(path: string, id: string, data: any, merge = true) {
  if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado')
  await setDoc(doc(db, path, id), data, { merge })
}

export async function addCollectionDoc(path: string, data: any) {
  if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado')
  return await addDoc(collection(db, path), data)
}

// Inserta varios documentos en una sola operación atómica (máx. 500 por lote de Firestore)
export async function addCollectionDocsBatch(path: string, docsData: any[]) {
  if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado')
  const firestore = db
  const chunkSize = 450
  for (let i = 0; i < docsData.length; i += chunkSize) {
    const chunk = docsData.slice(i, i + chunkSize)
    const batch = writeBatch(firestore)
    for (const data of chunk) {
      const ref = doc(collection(firestore, path))
      batch.set(ref, data)
    }
    await batch.commit()
  }
}

export async function getCollectionWhereOrdered(path: string, whereField?: string, whereOp?: any, whereValue?: any, orderField?: string, orderDir: 'asc' | 'desc' = 'asc') {
  if (!firebaseEnabled || !db) return []
  try {
    let q: any = collection(db, path)
    if (whereField && whereOp !== undefined) {
      q = fbQuery(q, fbWhere(whereField, whereOp, whereValue))
    }
    if (orderField) {
      q = fbQuery(q, fbOrderBy(orderField, orderDir))
    }
    // If both where and order were added, combine properly
    if (whereField && orderField) {
      q = fbQuery(collection(db, path), fbWhere(whereField, whereOp, whereValue), fbOrderBy(orderField, orderDir))
    }
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('Error fetching collection', path, err)
    return []
  }
}

export async function getCollectionCount(path: string) {
  if (!firebaseEnabled || !db) return 0
  try {
    const snap = await getDocs(collection(db, path))
    return snap.size
  } catch (err) {
    console.warn('Error counting collection', path, err)
    return 0
  }
}

export async function addAuditLog(action: string, meta: Record<string, any> = {}) {
  if (!firebaseEnabled || !db) return null
  try {
    return await addDoc(collection(db, 'audit_logs'), {
      action,
      meta,
      createdAt: serverTimestamp()
    })
  } catch (err) {
    console.warn('Error writing audit log', err)
    return null
  }
}

export async function updateDocument(path: string, id: string, data: any) {
  if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado')
  await updateDoc(doc(db, path, id), data)
}

export async function deleteDocument(path: string, id: string) {
  if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado')
  await deleteDoc(doc(db, path, id))
}
