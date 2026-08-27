import { db, firebaseEnabled } from '../firebase'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { getCollectionWhereOrdered } from './firestore'

export type SearchIndexEntry = {
  id: string
  collection: string
  targetId: string
  type: string
  title: string
  content: string
  subtitle?: string
  url?: string
  keywords: string[]
  searchText: string
  updatedAt: string
}

const normalizeText = (value: string) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const buildKeywords = (value: string) => {
  const words = normalizeText(value).split(' ').filter(Boolean)
  return [...new Set(words.filter(word => word.length > 2))]
}

export function buildSearchIndexEntry(collectionName: string, targetId: string, item: any, options: { type?: string; url?: string } = {}): SearchIndexEntry {
  const title = String(item?.title ?? item?.titulo ?? item?.nombre ?? item?.name ?? '').trim()
  const content = String(item?.content ?? item?.descripcion ?? item?.summary ?? item?.texto ?? item?.message ?? '').trim()
  const subtitle = String(item?.category ?? item?.categoria ?? item?.date ?? item?.fecha ?? '').trim()
  const text = `${title} ${content} ${subtitle}`
  const normalized = normalizeText(text)

  return {
    id: `${collectionName}:${targetId}`,
    collection: collectionName,
    targetId: String(targetId),
    type: options.type ?? collectionName.replace(/s$/, ''),
    title,
    content,
    subtitle: subtitle || undefined,
    url: options.url ?? `/${collectionName}/${targetId}`,
    keywords: [...new Set([...buildKeywords(title), ...buildKeywords(content), ...buildKeywords(subtitle)])],
    searchText: normalized,
    updatedAt: new Date().toISOString()
  }
}

export async function upsertSearchIndex(collectionName: string, targetId: string, item: any, options: { type?: string; url?: string } = {}) {
  if (!firebaseEnabled || !db) return null
  const entry = buildSearchIndexEntry(collectionName, targetId, item, options)
  await setDoc(doc(db, 'search_index', entry.id), entry)
  return entry
}

export async function syncSearchIndex() {
  if (!firebaseEnabled || !db) return []

  const [posts, eventos, estudios] = await Promise.all([
    getCollectionWhereOrdered('posts', undefined, undefined, undefined, 'createdAt', 'desc'),
    getCollectionWhereOrdered('eventos', undefined, undefined, undefined, 'fecha', 'desc'),
    getCollectionWhereOrdered('estudios', undefined, undefined, undefined, 'createdAt', 'desc')
  ])

  const entries: SearchIndexEntry[] = []

  for (const item of posts || []) {
    const entry = await upsertSearchIndex('posts', item.id, item, { type: 'post', url: `/blog` })
    if (entry) entries.push(entry)
  }

  for (const item of eventos || []) {
    const entry = await upsertSearchIndex('eventos', item.id, item, { type: 'evento', url: `/eventos` })
    if (entry) entries.push(entry)
  }

  for (const item of estudios || []) {
    const entry = await upsertSearchIndex('estudios', item.id, item, { type: 'estudio', url: `/estudios` })
    if (entry) entries.push(entry)
  }

  return entries
}

export async function searchIndex(text: string, limit = 10) {
  if (!firebaseEnabled || !db) return []
  const term = normalizeText(text)
  if (!term || term.length < 2) return []

  const tokens = term.split(' ').filter(Boolean).filter(token => token.length > 2)
  if (!tokens.length) return []

  const indexRef = collection(db, 'search_index')
  const q = query(indexRef, where('keywords', 'array-contains-any', tokens.slice(0, 10)))
  const snap = await getDocs(q)

  const results = snap.docs
    .map(docSnap => ({ id: docSnap.id, ...(docSnap.data() as Partial<SearchIndexEntry>) }))
    .filter((item: any) => {
      const searchText = String(item.searchText ?? '').toLowerCase()
      return tokens.every(token => searchText.includes(token))
    })
    .slice(0, limit)

  return results
}

export async function globalSearch(term: string) {
  if (!term || term.trim().length < 2) return []
  await syncSearchIndex()
  return searchIndex(term)
}
