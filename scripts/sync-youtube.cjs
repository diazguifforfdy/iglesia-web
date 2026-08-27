/* Server-side YouTube playlist synchronizer. Requires YOUTUBE_API_KEY and YOUTUBE_PLAYLIST_ID. */
const fs = require('node:fs')
const path = require('node:path')
const { getApps, initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore')

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
}

loadLocalEnv()

const apiKey = process.env.YOUTUBE_API_KEY
const playlistId = process.env.YOUTUBE_PLAYLIST_ID
if (!apiKey || !playlistId) {
  throw new Error('Missing YOUTUBE_API_KEY or YOUTUBE_PLAYLIST_ID. Do not use the VITE_ browser variables for this server job.')
}

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()
const collectionName = 'transmisiones'

async function fetchPlaylistPage(pageToken) {
  const params = new URLSearchParams({
    part: 'snippet,contentDetails,status',
    maxResults: '50',
    playlistId,
    key: apiKey
  })
  if (pageToken) params.set('pageToken', pageToken)

  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`, {
    signal: AbortSignal.timeout(15_000)
  })
  if (!response.ok) {
    const details = await response.text()
    if (response.status === 403 && details.includes('referer')) {
      throw new Error('YouTube API key is restricted to browser referrers. Create a server key restricted to the YouTube Data API v3 and set YOUTUBE_API_KEY.')
    }
    throw new Error(`YouTube API responded ${response.status}: ${details.slice(0, 300)}`)
  }
  return response.json()
}

async function sync() {
  let pageToken
  let scanned = 0
  const documents = []

  do {
    const page = await fetchPlaylistPage(pageToken)
    for (const item of page.items || []) {
      const snippet = item.snippet || {}
      const videoId = snippet.resourceId && snippet.resourceId.videoId
      if (!videoId || snippet.title === 'Deleted video' || snippet.title === 'Private video') continue

      const thumbnail = snippet.thumbnails?.maxres?.url ||
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url || ''
      const publishedAt = snippet.publishedAt || new Date().toISOString()
      const docId = `youtube_${videoId}`

      documents.push({ docId, data: {
        source: 'youtube',
        youtubeVideoId: videoId,
        titulo: snippet.title,
        descripcion: snippet.description || '',
        enlaceZoom: `https://www.youtube.com/watch?v=${videoId}`,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
        publishedAt,
        fechaInicio: Timestamp.fromDate(new Date(publishedAt)),
        activa: false,
        updatedAt: FieldValue.serverTimestamp()
      } })
    }

    scanned += (page.items || []).length
    pageToken = page.nextPageToken
  } while (pageToken)

  for (let i = 0; i < documents.length; i += 450) {
    const batch = db.batch()
    for (const { docId, data } of documents.slice(i, i + 450)) {
      batch.set(db.collection(collectionName).doc(docId), data, { merge: true })
    }
    await batch.commit()
  }

  console.log(JSON.stringify({ collection: collectionName, playlistId, scanned, synced: documents.length }))
}

sync().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
