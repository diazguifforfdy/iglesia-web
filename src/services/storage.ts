import { firebaseEnabled, storage } from '../firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

export async function uploadFile(folder: string, filename: string, file: Blob, onProgress?: (percent: number) => void) {
  if (!firebaseEnabled || !storage) throw new Error('Firebase no está configurado')
  const r = ref(storage, `${folder}/${filename}`)
  const uploadTask = uploadBytesResumable(r, file)

  return new Promise<{ snap: any; url: string }>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      snapshot => {
        if (onProgress) {
          const total = snapshot.totalBytes || (file && (file as any).size) || 0
          if (total > 0) {
            const percent = Math.round((snapshot.bytesTransferred / total) * 100)
            onProgress(percent)
          } else {
            // If total is not available yet, still emit 0 to update UI
            onProgress(0)
          }
        }
      },
      error => reject(error),
      async () => {
        try {
          // ensure we report 100% before resolving
          if (onProgress) onProgress(100)
          const url = await getDownloadURL(r)
          resolve({ snap: uploadTask.snapshot, url })
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

export async function getFileUrl(path: string) {
  if (!firebaseEnabled || !storage) return null
  const r = ref(storage, path)
  return await getDownloadURL(r)
}

export async function deleteFile(path: string) {
  if (!firebaseEnabled || !storage) throw new Error('Firebase no está configurado')
  const r = ref(storage, path)
  return await deleteObject(r)
}
