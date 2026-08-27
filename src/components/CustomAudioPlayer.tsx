import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Play, Pause, Download } from 'lucide-react'

interface CustomAudioPlayerProps {
  src: string
  title: string
  subtitle: string
  downloadUrl?: string
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CustomAudioPlayer({ src, title, subtitle, downloadUrl }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (event: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressRef.current
    if (!audio || !bar || !duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * duration
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const remaining = duration > 0 ? duration - currentTime : 0

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        className="w-12 h-12 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg text-slate-900 truncate">{title}</h3>
        <p className="text-sm text-gray-500 truncate mb-2">{subtitle}</p>
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-1.5 w-full rounded-full bg-slate-200 cursor-pointer"
        >
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-500 font-mono tabular-nums">{formatTime(remaining)}</span>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            aria-label="Descargar"
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  )
}
