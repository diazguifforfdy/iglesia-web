import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { uploadFile, deleteFile } from '../../services/storage'
import { addCollectionDoc, getCollectionWhereOrdered, deleteDocument, updateDocument } from '../../services/firestore'
import { serverTimestamp } from 'firebase/firestore'
import { Trash, Pencil, X, Check, Disc3, ImagePlus } from 'lucide-react'
import { inputClass, labelClass, cardClass } from './adminUi'

type Audio = {
  id: string
  title: string
  albumId: string | null
  albumTitle: string | null
  url: string
  storagePath?: string
  createdAt: any
  uploader: string | null
}

type Album = {
  id: string
  title: string
  year: string
  coverUrl?: string
  coverStoragePath?: string
  createdAt: any
}

const AUDIOS_COLLECTION = 'audios_alabanza' // Consistent collection name
const ALBUMS_COLLECTION = 'albums'
const NO_ALBUM = '__none__'

const allowedExt = ['mp3', 'wav', 'm4a', 'aac', 'ogg']

export default function AudioAdmin() {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [title, setTitle] = useState('')
  const [albumId, setAlbumId] = useState<string>(NO_ALBUM)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [audios, setAudios] = useState<Audio[]>([])
  const [fetchingAudios, setFetchingAudios] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAlbumId, setEditAlbumId] = useState<string>(NO_ALBUM)
  const [savingEdit, setSavingEdit] = useState(false)

  const [albums, setAlbums] = useState<Album[]>([])
  const [albumTitle, setAlbumTitle] = useState('')
  const [albumYear, setAlbumYear] = useState('')
  const [albumCover, setAlbumCover] = useState<File | null>(null)
  const [savingAlbum, setSavingAlbum] = useState(false)

  const fetchAudios = async () => {
    setFetchingAudios(true)
    try {
      const data = await getCollectionWhereOrdered(AUDIOS_COLLECTION, undefined, undefined, undefined, 'createdAt', 'desc')
      setAudios(data as Audio[])
    } catch (err) {
      console.error('Error fetching audios:', err)
      addNotification({ type: 'error', message: 'Error al cargar los audios' })
      setAudios([])
    } finally {
      setFetchingAudios(false)
    }
  }

  const fetchAlbums = async () => {
    try {
      const data = await getCollectionWhereOrdered(ALBUMS_COLLECTION, undefined, undefined, undefined, 'createdAt', 'desc')
      setAlbums(data as Album[])
    } catch (err) {
      console.error('Error fetching albums:', err)
      addNotification({ type: 'error', message: 'Error al cargar los álbumes' })
    }
  }

  useEffect(() => {
    fetchAudios()
    fetchAlbums()
  }, [])

  function validateFile(f: File) {
    const ext = (f.name.split('.').pop() || '').toLowerCase()
    return allowedExt.includes(ext) && f.type.startsWith('audio')
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return addNotification({ type: 'error', message: 'Seleccione un archivo de audio' })
    if (!validateFile(file)) return addNotification({ type: 'error', message: 'Formato no compatible. Use mp3, wav, m4a, aac u ogg' })

    setLoading(true)
    setProgress(0)
    try {
      const folder = AUDIOS_COLLECTION // Use constant
      const filename = `${Date.now()}-${file.name}`
      const { url } = await uploadFile(folder, filename, file, percent => setProgress(percent))
      const selectedAlbum = albumId !== NO_ALBUM ? albums.find(a => a.id === albumId) : undefined

      await addCollectionDoc(folder, {
        title: title || file.name,
        albumId: selectedAlbum ? selectedAlbum.id : null,
        albumTitle: selectedAlbum ? selectedAlbum.title : null,
        url,
        storagePath: `${folder}/${filename}`,
        createdAt: serverTimestamp(),
        uploader: user?.uid || null
      })

      addNotification({ type: 'success', message: 'Audio subido correctamente' })
      setTitle('')
      setFile(null)
      setProgress(null)
      fetchAudios() // Refresh the list after upload
    } catch (err: any) {
      console.error(err)
      addNotification({ type: 'error', message: 'Error al subir el audio' })
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }
  async function handleDeleteAudio(audio: Audio) {
    if (!window.confirm(`¿Está seguro de que desea eliminar "${audio.title}"?`)) {
      return
    }

    setLoading(true)
    try {
      // Delete from Firestore
      await deleteDocument(AUDIOS_COLLECTION, audio.id)

      // Delete from Storage if storagePath exists
      if (audio.storagePath) {
        await deleteFile(audio.storagePath)
      }

      addNotification({ type: 'success', message: `"${audio.title}" eliminado correctamente` })
      fetchAudios() // Refresh the list after deletion
    } catch (err) {
      console.error('Error deleting audio:', err)
      addNotification({ type: 'error', message: 'Error al eliminar el audio' })
    } finally {
      setLoading(false)
    }
  }

  function startEdit(audio: Audio) {
    setEditingId(audio.id)
    setEditTitle(audio.title)
    setEditAlbumId(audio.albumId ?? NO_ALBUM)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditAlbumId(NO_ALBUM)
  }

  async function saveEdit(audio: Audio) {
    if (!editTitle.trim()) return addNotification({ type: 'error', message: 'El título no puede estar vacío' })
    setSavingEdit(true)
    try {
      const selectedAlbum = editAlbumId !== NO_ALBUM ? albums.find(a => a.id === editAlbumId) : undefined
      await updateDocument(AUDIOS_COLLECTION, audio.id, {
        title: editTitle.trim(),
        albumId: selectedAlbum ? selectedAlbum.id : null,
        albumTitle: selectedAlbum ? selectedAlbum.title : null
      })
      addNotification({ type: 'success', message: 'Audio actualizado correctamente' })
      cancelEdit()
      fetchAudios()
    } catch (err) {
      console.error('Error updating audio:', err)
      addNotification({ type: 'error', message: 'Error al actualizar el audio' })
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleCreateAlbum(e: React.FormEvent) {
    e.preventDefault()
    if (!albumTitle.trim()) return addNotification({ type: 'error', message: 'El título del álbum es obligatorio' })

    setSavingAlbum(true)
    try {
      let coverUrl: string | undefined
      let coverStoragePath: string | undefined
      if (albumCover) {
        const filename = `${Date.now()}-${albumCover.name}`
        const uploaded = await uploadFile(ALBUMS_COLLECTION, filename, albumCover)
        coverUrl = uploaded.url
        coverStoragePath = `${ALBUMS_COLLECTION}/${filename}`
      }

      await addCollectionDoc(ALBUMS_COLLECTION, {
        title: albumTitle.trim(),
        year: albumYear.trim(),
        coverUrl: coverUrl ?? null,
        coverStoragePath: coverStoragePath ?? null,
        createdAt: serverTimestamp()
      })

      addNotification({ type: 'success', message: 'Álbum creado correctamente' })
      setAlbumTitle('')
      setAlbumYear('')
      setAlbumCover(null)
      fetchAlbums()
    } catch (err) {
      console.error('Error creating album:', err)
      addNotification({ type: 'error', message: 'Error al crear el álbum' })
    } finally {
      setSavingAlbum(false)
    }
  }

  async function handleDeleteAlbum(album: Album) {
    if (!window.confirm(`¿Eliminar el álbum "${album.title}"? Los audios asociados quedarán sin álbum.`)) return
    try {
      await deleteDocument(ALBUMS_COLLECTION, album.id)
      if (album.coverStoragePath) {
        await deleteFile(album.coverStoragePath).catch(() => undefined)
      }
      addNotification({ type: 'success', message: `Álbum "${album.title}" eliminado` })
      fetchAlbums()
    } catch (err) {
      console.error('Error deleting album:', err)
      addNotification({ type: 'error', message: 'Error al eliminar el álbum' })
    }
  }

  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-8 text-primary">Administrar Audios de Alabanza</h2>

      <div className={`${cardClass} mb-8 max-w-2xl`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <Disc3 size={18} /> Gestionar Álbumes
        </h3>
        <form onSubmit={handleCreateAlbum} className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className={labelClass}>Título</label>
            <input className={inputClass} value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} disabled={savingAlbum} />
          </div>
          <div>
            <label className={labelClass}>Año</label>
            <input className={inputClass} value={albumYear} onChange={e => setAlbumYear(e.target.value)} placeholder="2026" disabled={savingAlbum} />
          </div>
          <div>
            <label className={labelClass}>Portada (opcional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setAlbumCover(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={savingAlbum}
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={savingAlbum}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-60"
            >
              <ImagePlus size={16} />
              {savingAlbum ? 'Creando...' : 'Crear álbum'}
            </button>
          </div>
        </form>

        {albums.length > 0 && (
          <ul className="mt-6 divide-y divide-gray-100">
            {albums.map(album => (
              <li key={album.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Disc3 size={18} className="text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{album.title}</p>
                    <p className="text-xs text-gray-500">{album.year}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAlbum(album)}
                  className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Eliminar álbum"
                >
                  <Trash className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`${cardClass} mb-8 max-w-2xl`}>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Subir Nuevo Audio</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="audio-title" className={labelClass}>Título</label>
            <input
              id="audio-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={inputClass}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="audio-album" className={labelClass}>Álbum</label>
            <select
              id="audio-album"
              value={albumId}
              onChange={e => setAlbumId(e.target.value)}
              className={inputClass}
              disabled={loading}
            >
              <option value={NO_ALBUM}>Sin álbum</option>
              {albums.map(a => (
                <option key={a.id} value={a.id}>{a.title}{a.year ? ` (${a.year})` : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audio-file" className={labelClass}>Archivo (mp3, wav, m4a, aac, ogg)</label>
            <input
              id="audio-file"
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
          </div>

          {progress !== null && (
            <div className="w-full bg-gray-100 rounded-lg h-4 overflow-hidden mt-2">
              <div className="h-4 bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-60"
            >
              {loading ? `Subiendo ${progress ?? 0}%` : 'Subir Audio'}
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Audios Existentes</h3>
        {fetchingAudios ? (
          <p className="text-gray-600">Cargando audios...</p>
        ) : audios.length === 0 ? (
          <p className="text-gray-600">No hay audios subidos todavía.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {audios.map(audio => (
              <li key={audio.id} className="py-4 flex items-center justify-between gap-4">
                {editingId === audio.id ? (
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className={inputClass}
                      disabled={savingEdit}
                    />
                    <select
                      value={editAlbumId}
                      onChange={e => setEditAlbumId(e.target.value)}
                      className={inputClass}
                      disabled={savingEdit}
                    >
                      <option value={NO_ALBUM}>Sin álbum</option>
                      {albums.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium text-gray-900">{audio.title}</p>
                    <p className="text-sm text-gray-500">{audio.albumTitle ?? 'Sin álbum'}</p>
                  </div>
                )}

                <div className="flex items-center gap-1 flex-shrink-0">
                  {editingId === audio.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(audio)}
                        disabled={savingEdit}
                        className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                        title="Guardar cambios"
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(audio)}
                        disabled={loading}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                        title="Editar audio"
                      >
                        <Pencil className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => handleDeleteAudio(audio)}
                        disabled={loading}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        title="Eliminar audio"
                      >
                        <Trash className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

