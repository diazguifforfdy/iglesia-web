import { useEffect, useState } from 'react'
import { getCollectionWhereOrdered } from '../services/firestore'
import { getFileUrl } from '../services/storage'

type Media = {
  id: string
  path?: string
  storagePath?: string
  url?: string
  title?: string
  type?: 'image' | 'video' | string
}

export default function Gallery() {
  const [items, setItems] = useState<Array<Media & { url?: string }>>([])

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getCollectionWhereOrdered('media_photos', undefined, undefined, undefined, 'createdAt', 'desc')
        const withUrls = await Promise.all(
          (data as Media[]).map(async (m) => {
            const storagePath = m.storagePath || m.path
            const resolvedUrl = m.url || (storagePath ? await getFileUrl(storagePath).catch(() => null) : null)
            return { ...(m as Media), url: resolvedUrl ?? undefined }
          })
        )
        setItems(withUrls)
      } catch (error) {
        console.error('Gallery fetch failed', error)
        setItems([])
      }
    })()
  }, [])

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Galería Multimedia</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.length === 0 ? (
          <div className="col-span-full rounded border border-dashed p-6 text-center text-gray-600">No hay imágenes disponibles en la galería.</div>
        ) : (
          items.map(it => (
            <div key={it.id} className="rounded overflow-hidden bg-white border">
              {it.url ? (
                <img loading="lazy" src={it.url} alt={it.title || 'Imagen de la galería'} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100">No disponible</div>
              )}
              <div className="p-2 text-sm">{it.title || 'Imagen'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
