import { useState } from 'react'
import { storage, db, firebaseEnabled } from '../../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

type Tab = 'pdfs' | 'musica' | 'fotos'

export default function MediaAdmin() {
  const [tab, setTab] = useState<Tab>('pdfs')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const pathFor = (t: Tab) => (t === 'pdfs' ? 'public/pdfs' : t === 'musica' ? 'public/music' : 'public/gallery')
  const colFor = (t: Tab) => (t === 'pdfs' ? 'media_pdfs' : t === 'musica' ? 'media_music' : 'media_photos')

  const upload = async () => {
    if (!file) return
    setLoading(true)
    try {
      if (!firebaseEnabled || !db || !storage) throw new Error('Firebase no está configurado en este entorno de preview')
      const folder = pathFor(tab)
      const filename = `${Date.now()}_${file.name}`
      const r = ref(storage, `${folder}/${filename}`)
      await uploadBytes(r, file, { contentType: file.type })
      const url = await getDownloadURL(r)
      await addDoc(collection(db, colFor(tab)), {
        title,
        url,
        type: file.type,
        createdAt: serverTimestamp()
      })
      setFile(null)
      setTitle('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold text-primary">Gestión de Multimedia</h1>
      {!firebaseEnabled && (
        <p className="mt-2 text-sm text-gray-600">Subida deshabilitada en preview sin Firebase. Se habilita en el despliegue oficial.</p>
      )}
      <div className="mt-6 flex gap-2">
        <button onClick={() => setTab('pdfs')} className={`px-3 py-2 rounded border ${tab === 'pdfs' ? 'bg-primary text-white' : ''}`}>PDFs</button>
        <button onClick={() => setTab('musica')} className={`px-3 py-2 rounded border ${tab === 'musica' ? 'bg-primary text-white' : ''}`}>Música</button>
        <button onClick={() => setTab('fotos')} className={`px-3 py-2 rounded border ${tab === 'fotos' ? 'bg-primary text-white' : ''}`}>Galería</button>
      </div>

      <div className="mt-6 p-6 rounded border">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Título"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <input
            type="file"
            accept={tab === 'pdfs' ? 'application/pdf' : tab === 'musica' ? 'audio/*' : 'image/*'}
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="w-full"
          />
        </div>
        <button onClick={upload} disabled={loading || !file} className="mt-4 px-4 py-2 rounded bg-secondary text-primary hover:bg-secondary/90">
          Subir
        </button>
        <p className="mt-2 text-sm text-gray-500">Los archivos se almacenan en Firebase Storage y el registro en Firestore.</p>
      </div>
    </div>
  )
}
