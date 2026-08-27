import { useEffect, useState } from 'react'
import { getCollectionWhereOrdered } from '../services/firestore'
import Comments from '../components/Comments'

type Post = {
  id: string
  title: string
  slug?: string
  content?: string
  category?: string
  createdAt?: any
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    ;(async () => {
      const data = await getCollectionWhereOrdered('posts', undefined, undefined, undefined, 'createdAt', 'desc')
      setPosts(data as Post[])
    })()
  }, [])

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[]

  const filtered = posts.filter(p => {
    if (category && p.category !== category) return false
    if (!query) return true
    const t = query.toLowerCase()
    return (p.title || '').toLowerCase().includes(t) || (p.content || '').toLowerCase().includes(t)
  })

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Blog y Reflexiones</h1>
      <div className="mb-6 flex gap-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en publicaciones" className="border px-3 py-2 rounded w-full" />
        <select value={category ?? ''} onChange={e => setCategory(e.target.value || null)} className="border px-3 py-2 rounded">
          <option value="">Todas</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(p => (
          <article key={p.id} className="bg-white rounded p-6 shadow-sm border">
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="text-sm text-slate-600 mt-2">{p.category}</p>
            <div className="mt-4 text-slate-700">{p.content?.slice(0, 300) ?? ''}{p.content && p.content.length > 300 ? '…' : ''}</div>
            <div className="mt-4 border-t pt-4">
              <Comments postId={p.id} compact />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
