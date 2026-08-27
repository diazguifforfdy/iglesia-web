import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { uploadFile } from '../../services/storage'
import { addCollectionDoc } from '../../services/firestore'
import { firebaseEnabled, db, storage } from '../../firebase'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc as firestoreDoc } from 'firebase/firestore'
import { deleteObject, ref as storageRef } from 'firebase/storage'
import { Trash2 } from 'lucide-react'
import { inputClass, labelClass, cardClass } from './adminUi'

const CATEGORIAS = ['Multimedia', 'Grupo Juvenil', 'Escuelita Dominical', 'Eventos Especiales'] as const
type Categoria = typeof CATEGORIAS[number]

type MediaItem = {
  id: string
  title: string
  url: string
  storagePath: string
  createdAt: string
  categoria?: Categoria
}

const FOLDER = 'public/gallery'
const COLLECTION = 'media_photos'

const badgeColors: Record<Categoria, string> = {
  'Multimedia': 'bg-blue-50 text-blue-700 border-blue-200',
  'Grupo Juvenil': 'bg-purple-50 text-purple-700 border-purple-200',
  'Escuelita Dominical': 'bg-amber-50 text-amber-700 border-amber-200',
  'Eventos Especiales': 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export default function MediaAdmin() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [categoria, setCategoria] = useState<Categoria>(CATEGORIAS[0])
  const [filtro, setFiltro] = useState<'Todas' | Categoria>('Todas')
  const [loading, setLoading] = useState(false)
  const { role } = useAuth()
  const { addNotification } = useNotification()

  useEffect(() => {
    if (!firebaseEnabled || !db) return

    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newItems = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem))
      setItems(newItems)
    })

    return () => unsubscribe()
  }, [])

  const upload = async () => {
    if (!file) return
    setLoading(true)
    try {
      if (!firebaseEnabled || !db) throw new Error('Firebase no está configurado en este entorno de preview')
      const filename = `${Date.now()}_${file.name}`
      const { url } = await uploadFile(FOLDER, filename, file)
      await addCollectionDoc(COLLECTION, {
        title,
        categoria,
        url,
        storagePath: `${FOLDER}/${filename}`,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString()
      })
      setFile(null)
      setTitle('')
      addNotification({ type: 'success', message: 'Imagen subida correctamente' })
    } catch (err: any) {
      console.error('Upload error', err)
      addNotification({ type: 'error', message: err?.message || 'Error al subir la imagen' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${item.title}"? Esta acción no se puede deshacer.`)) {
      return
    }
    setLoading(true)
    try {
      if (!firebaseEnabled || !db || !storage) throw new Error('Firebase no está configurado')

      const sRef = storageRef(storage, item.storagePath)
      await deleteObject(sRef)
      await deleteDoc(firestoreDoc(db, COLLECTION, item.id))

      addNotification({ type: 'success', message: 'Imagen eliminada correctamente' })
    } catch (err: any) {
      console.error('Delete error', err)
      addNotification({ type: 'error', message: err?.message || 'Error al eliminar la imagen' })
    } finally {
      setLoading(false)
    }
  }

  const visibles = filtro === 'Todas' ? items : items.filter(i => i.categoria === filtro)

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl font-bold text-primary">Galería de Fotos</h1>
      {!firebaseEnabled && (
        <p className="mt-2 text-sm text-gray-600">Subida deshabilitada en preview sin Firebase. Se habilita en el despliegue oficial.</p>
      )}
      {role !== 'admin' && (
        <p className="mt-2 text-sm text-red-600">Acceso restringido: se requiere rol de admin para subir archivos.</p>
      )}

      <div className={`${cardClass} mt-6 max-w-2xl`}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Título</label>
            <input className={inputClass} value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Categoría</label>
            <select className={inputClass} value={categoria} onChange={e => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        <button onClick={upload} disabled={loading || !file || role !== 'admin'} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
          Subir imagen
        </button>
        <p className="mt-2 text-sm text-gray-500">Las imágenes se almacenan en Firebase Storage y el registro en Firestore.</p>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary">Contenido Subido ({visibles.length})</h2>
          <div className="flex flex-wrap gap-2">
            {(['Todas', ...CATEGORIAS] as const).map(c => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filtro === c ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 mt-4">
          {visibles.length > 0 ? (
            visibles.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-white shadow-sm">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    {item.categoria && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badgeColors[item.categoria]}`}>
                        {item.categoria}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Subido el: {new Date(item.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item)}
                  disabled={loading || role !== 'admin'}
                  className="p-2 rounded-full text-red-500 hover:bg-red-100 disabled:text-gray-400 disabled:bg-transparent transition-colors"
                  aria-label={`Eliminar ${item.title}`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No hay imágenes en esta categoría todavía.</p>
          )}
        </div>
      </div>
    </div>
  )
}

