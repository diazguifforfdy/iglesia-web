import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Download, Disc3, Loader2 } from 'lucide-react'
import { getCollectionWhereOrdered } from '../services/firestore'
import CustomAudioPlayer from '../components/CustomAudioPlayer'

function titleFromSlug(slug: string) {
  return slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export default function Service() {
  const { slug } = useParams()
  const title = slug ? titleFromSlug(slug) : 'Servicio'

  // If this is the Alabanzas page, show audio player list
  if (slug === 'alabanzas') return <AlabanzasPlayer />

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <p className="text-slate-700">Página de servicio en construcción. Aquí se mostrará información y recursos relacionados con {title}.</p>
    </div>
  )
}

type Audio = {
  id: string
  title: string
  albumId: string | null
  albumTitle: string | null
  url: string
  createdAt?: any
}

type Album = {
  id: string
  title: string
  year: string
  coverUrl?: string
}

const OTROS_ALBUM_ID = '__otros__'

function AlabanzasPlayer() {
  const [audios, setAudios] = useState<Audio[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingAlbum, setDownloadingAlbum] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [audioItems, albumItems] = await Promise.all([
        getCollectionWhereOrdered('audios_alabanza', undefined, undefined, undefined, 'createdAt', 'desc'),
        getCollectionWhereOrdered('albums', undefined, undefined, undefined, 'createdAt', 'desc')
      ])
      setAudios(audioItems as Audio[])
      setAlbums(albumItems as Album[])
      setLoading(false)
    }
    load()
  }, [])

  const groups = useMemo(() => {
    const byAlbum = new Map<string, Audio[]>()
    for (const audio of audios) {
      const key = audio.albumId ?? OTROS_ALBUM_ID
      const list = byAlbum.get(key) ?? []
      list.push(audio)
      byAlbum.set(key, list)
    }
    const ordered: { id: string; title: string; year?: string; coverUrl?: string; tracks: Audio[] }[] = []
    for (const album of albums) {
      const tracks = byAlbum.get(album.id)
      if (tracks?.length) ordered.push({ id: album.id, title: album.title, year: album.year, coverUrl: album.coverUrl, tracks })
    }
    const otros = byAlbum.get(OTROS_ALBUM_ID)
    if (otros?.length) ordered.push({ id: OTROS_ALBUM_ID, title: 'Otros', tracks: otros })
    return ordered
  }, [audios, albums])

  async function downloadAlbum(group: { id: string; title: string; tracks: Audio[] }) {
    setDownloadingAlbum(group.id)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      await Promise.all(
        group.tracks.map(async (track, index) => {
          const response = await fetch(track.url)
          const blob = await response.blob()
          const ext = track.url.split('.').pop()?.split('?')[0] || 'mp3'
          const safeName = track.title.replace(/[\\/:*?"<>|]/g, '-')
          zip.file(`${index + 1}. ${safeName}.${ext}`, blob)
        })
      )
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${group.title.replace(/[\\/:*?"<>|]/g, '-')}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading album:', err)
      window.alert('No se pudo descargar el álbum completo. Intenta nuevamente.')
    } finally {
      setDownloadingAlbum(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-slate-900 mb-3 tracking-wide">Alabanzas</h1>
          <p className="text-lg text-slate-600 font-light">Nuestra colección de música y adoración, organizada por álbumes</p>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : groups.length === 0 ? (
          <p className="text-center text-slate-500">No hay audios aún.</p>
        ) : (
          <div className="space-y-12">
            {groups.map(group => (
              <section key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {group.coverUrl ? (
                      <img src={group.coverUrl} alt={group.title} className="w-16 h-16 rounded-lg object-cover shadow-md" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Disc3 className="text-slate-400" size={28} />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-900">{group.title}</h2>
                      <p className="text-sm text-slate-500">
                        {group.year ? `${group.year} · ` : ''}{group.tracks.length} pista{group.tracks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadAlbum(group)}
                    disabled={downloadingAlbum === group.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  >
                    {downloadingAlbum === group.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Descargar Álbum Completo
                  </button>
                </div>

                <div className="space-y-4">
                  {group.tracks.map(a => (
                    <CustomAudioPlayer
                      key={a.id}
                      src={a.url}
                      title={a.title}
                      subtitle={a.createdAt?.toDate ? new Date(a.createdAt.toDate()).toLocaleDateString() : ''}
                      downloadUrl={a.url}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
