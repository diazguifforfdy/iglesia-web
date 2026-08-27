const { Storage } = require('@google-cloud/storage')
const path = require('path')

async function safeGetBucket(storage, bucketName) {
  const bucket = storage.bucket(bucketName)
  try {
    await bucket.getMetadata()
    return bucket
  } catch (err) {
    if (err && err.code === 404) return null
    throw err
  }
}

async function main() {
  const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json')
  const key = require(keyPath)
  const projectId = key.project_id
  const storage = new Storage({ keyFilename: keyPath, projectId })

  const candidateNames = [`${projectId}.appspot.com`, `${projectId}.firebasestorage.app`, `${projectId}-default-bucket`]

  console.log('Using service account:', key.client_email)
  console.log('Project ID:', projectId)
  console.log('Candidate buckets:', candidateNames.join(', '))

  let bucket = null
  let selectedName = null

  for (const name of candidateNames) {
    try {
      const found = await safeGetBucket(storage, name)
      if (found) {
        bucket = found
        selectedName = name
        break
      }
    } catch (err) {
      console.warn(`Bucket check failed for ${name}:`, err.message || err)
    }
  }

  if (!bucket) {
    selectedName = candidateNames[0]
    console.log(`No existing bucket found. Creating default bucket: ${selectedName}`)
    try {
      ;[bucket] = await storage.createBucket(selectedName, { location: 'US' })
    } catch (err) {
      console.error('Failed to create bucket. The service account likely lacks bucket-creation permissions or the project is not a valid Firebase/GCP project:', err)
      process.exit(1)
    }
  }

  const corsConfig = [
    {
      origin: ['http://localhost:4173', 'http://localhost:4174'],
      method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      responseHeader: ['*'],
      maxAgeSeconds: 3600
    }
  ]

  try {
    console.log('Setting CORS configuration on bucket:', selectedName)
    await bucket.setMetadata({ cors: corsConfig })
    const [metadata] = await bucket.getMetadata()
    console.log('CORS applied successfully.')
    console.log(JSON.stringify(metadata.cors, null, 2))
  } catch (err) {
    console.error('Failed to set CORS metadata on bucket:', err)
    process.exit(1)
  }
}

main()
