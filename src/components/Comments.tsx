import { useEffect, useState, FormEvent } from 'react'
import { addCollectionDoc, getCollectionWhereOrdered } from '../services/firestore'
import { useAuth } from '../context/AuthContext'

type Comment = {
  id: string
  postId: string
  uid?: string
  author?: string
  text: string
  approved?: boolean
  createdAt?: any
}

export default function Comments({ postId, compact }: { postId: string; compact?: boolean }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    ;(async () => {
      const data = await getCollectionWhereOrdered('comments', 'postId', '==', postId, 'createdAt', 'desc')
      // show only approved comments to public users
      const visible = (data as Comment[]).filter(c => c.approved === true || (user && (user.uid === c.uid || (user as any).role === 'admin')))
      setComments(visible as Comment[])
    })()
  }, [postId, user])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await addCollectionDoc('comments', {
        postId,
        uid: user?.uid ?? null,
        author: user?.email ?? 'Anónimo',
        text: text.trim(),
        createdAt: new Date(),
        approved: false
      })
      setText('')
      const data = await getCollectionWhereOrdered('comments', 'postId', '==', postId, 'createdAt', 'desc')
      setComments(data as Comment[])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {!compact && (
        <form onSubmit={submit} className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded px-3 py-2" placeholder={user ? 'Escribe un comentario...' : 'Debes iniciar sesión para comentar.'} disabled={!user} />
          <div className="flex justify-end">
            <button type="submit" className="px-3 py-1.5 bg-primary text-white rounded" disabled={!user || !text.trim()}>
              Comentar
            </button>
          </div>
        </form>
      )}
      <div className="mt-3 space-y-3">
        {comments.map(c => (
          <div key={c.id} className="p-3 bg-gray-50 rounded border">
            <div className="text-sm font-semibold">{c.author}</div>
            <div className="text-sm text-slate-700">{c.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
