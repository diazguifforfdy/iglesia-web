import { useEffect, useState } from 'react'

export type AssetStatus = 'loading' | 'ok' | 'missing'

export function useAssetStatus(url: string | undefined): AssetStatus {
  const [status, setStatus] = useState<AssetStatus>('loading')

  useEffect(() => {
    let cancelled = false
    if (!url) {
      setStatus('missing')
      return
    }
    setStatus('loading')
    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (!cancelled) setStatus(res.ok ? 'ok' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setStatus('missing')
      })
    return () => {
      cancelled = true
    }
  }, [url])

  return status
}
