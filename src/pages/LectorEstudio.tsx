import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ESTUDIOS } from '../data/estudios'
import { useAssetStatus } from '../hooks/useAssetStatus'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { Worker as PdfWorker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

export default function LectorEstudio() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const estudio = useMemo(
    () => ESTUDIOS.find((e) => e.slug.toLowerCase() === (slug || '').toLowerCase()),
    [slug]
  )

  const pdfUrl = `${window.location.origin}/docs/aguila-blanca.pdf`
  const pdfStatus = useAssetStatus(pdfUrl)

  if (!estudio) {
    return (
      <div className="container py-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">Estudio no encontrado.</p>
        <button
          className="mt-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary-light transition-colors"
          onClick={() => navigate("/estudios")}
        >
          Volver a Estudios
        </button>
      </div>
    )
  }

  const layout = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const { ZoomOut, CurrentScale, ZoomIn } = slots
          return (
            <div className="flex items-center gap-2 px-3 py-2">
              <ZoomOut />
              <CurrentScale />
              <ZoomIn />
            </div>
          )
        }}
      </Toolbar>
    )
  })

  return (
    <div className="min-h-screen py-8 md:py-12 bg-neutral-100 dark:bg-neutral-900 text-gray-900 dark:text-white">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="mb-3">
          <button
            onClick={() => navigate("/estudios")}
            className="text-sm text-primary hover:text-primary-light transition-colors"
            aria-label="Volver a Estudios"
          >
            ← Volver a Estudios
          </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-display tracking-tight text-center text-primary dark:text-white">
          {estudio.titulo}
        </h1>
        <div className="mx-auto mt-2 h-px w-20 bg-secondary/70" />
        {estudio.descripcion && (
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{estudio.descripcion}</p>
        )}
        {pdfStatus !== 'ok' ? (
          <div className="mt-6 p-6 rounded-xl bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-lg">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              Cargando documento... si tarda demasiado, usa los botones de abajo.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-lg">
            <div className="w-full py-4 px-2 sm:px-4 md:px-6 lg:px-8">
              <PdfWorker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div className="mx-auto w-full max-w-full">
                  <Viewer fileUrl="/docs/aguila-blanca.pdf" plugins={[layout]} theme={{ theme: 'dark' }} />
                </div>
              </PdfWorker>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-right">
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-primary dark:text-gray-300 hover:text-primary-light dark:hover:text-accent transition-colors">
              Abrir en pestaña nueva
            </a>
            <div className="mt-1 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary-light hover:text-white transition-colors"
              >
                ¿No puedes ver el documento? Haz clic aquí para abrirlo directamente
              </a>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-emerald-500 text-emerald-700 dark:border-emerald-200 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors"
                title="Descargar PDF"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M6 18a4 4 0 1 1 .7-7.95A6 6 0 0 1 18 7a5 5 0 0 1 .8 9.95H15a1 1 0 1 1 0-2h3.8A3 3 0 0 0 20 9.1 4 4 0 0 0 12 8a1 1 0 0 1-1.94.35A2 2 0 1 0 6 16h2a1 1 0 1 1 0 2H6Z" />
                  <path d="M12 11a1 1 0 0 1 1 1v3.59l.3-.3a1 1 0 1 1 1.4 1.42l-2.7 2.7a1 1 0 0 1-1.4 0l-2.7-2.7a1 1 0 1 1 1.4-1.42l.3.3V12a1 1 0 0 1 1-1Z" />
                </svg>
                Descargar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
