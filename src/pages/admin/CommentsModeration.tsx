import { useEffect, useState } from 'react'
import { getCollectionWhereOrdered, updateDocument, deleteDocument, addAuditLog } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'

export default function CommentsModeration() {
  const [comments, setComments] = useState<any[]>([])
  const { role } = useAuth()

  useEffect(() => {
    ;(async () => {
      const data = await getCollectionWhereOrdered('comments', undefined, undefined, undefined, 'createdAt', 'desc')
      setComments(data as any[])
    })()
  }, [])

  const refresh = async () => {
    const data = await getCollectionWhereOrdered('comments', undefined, undefined, undefined, 'createdAt', 'desc')
    setComments(data as any[])
  }

  const approve = async (id: string) => {
    try {
      await updateDocument('comments', id, { approved: true })
      await addAuditLog('comment_approve', { id })
      await refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const remove = async (id: string) => {
    try {
      await deleteDocument('comments', id)
      await addAuditLog('comment_delete', { id })
      await refresh()
    } catch (err) {
      console.error(err)
    }
  }

  if (role !== 'admin') return <div className="p-6 md:p-10">Acceso denegado.</div>

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-primary mb-4">Moderación de Comentarios</h1>
      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold">{c.author} <span className="text-xs text-slate-500">{c.uid}</span></div>
                <div className="text-xs text-slate-400">{new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : (c.createdAt ?? Date.now())).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                {!c.approved && <button onClick={() => approve(c.id)} className="px-2 py-1 bg-green-600 text-white rounded">Aprobar</button>}
                <button onClick={() => remove(c.id)} className="px-2 py-1 bg-red-600 text-white rounded">Eliminar</button>
              </div>
            </div>
            <div className="mt-2 text-slate-700">{c.text}</div>
            <div className="mt-2 text-xs">Aprobado: {String(!!c.approved)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
