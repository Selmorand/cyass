import { storageService, thumbnailCache } from './storage'

const DB_NAME = 'cyass-uploads'
const STORE_NAME = 'upload-queue'
const DB_VERSION = 1
const MAX_RETRIES = 5

interface QueuedUpload {
  id: string
  file: Blob
  fileName: string
  reportId: string
  itemId: string
  thumbnail: string
  timestamp: number
  retryCount: number
}

// Listeners notified when a queued upload completes
type UploadCompleteCallback = (itemId: string, photoUrl: string) => void
const listeners: UploadCompleteCallback[] = []

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Queue a failed upload for retry.
 * Stores the compressed file blob in IndexedDB.
 */
export async function queueUpload(
  file: File,
  reportId: string,
  itemId: string,
  thumbnail: string
): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    const entry: QueuedUpload = {
      id: `${reportId}-${itemId}-${Date.now()}`,
      file: file,
      fileName: file.name,
      reportId,
      itemId,
      thumbnail,
      timestamp: Date.now(),
      retryCount: 0
    }

    store.add(entry)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })

    db.close()
    console.log('Upload queued for retry:', entry.id)
  } catch (error) {
    console.error('Failed to queue upload:', error)
  }
}

/**
 * Process all queued uploads. Called on reconnect or component mount.
 */
export async function processQueue(): Promise<void> {
  if (!navigator.onLine) return

  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)

    const entries: QueuedUpload[] = await new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    db.close()

    if (entries.length === 0) return
    console.log(`Processing ${entries.length} queued uploads...`)

    for (const entry of entries) {
      if (entry.retryCount >= MAX_RETRIES) {
        await removeFromQueue(entry.id)
        console.warn('Upload exceeded max retries, removed:', entry.id)
        continue
      }

      try {
        const file = new File([entry.file], entry.fileName, {
          type: 'image/jpeg',
          lastModified: entry.timestamp
        })

        const photoUrl = await storageService.uploadPhoto(file, entry.reportId, entry.itemId)

        // Cache the thumbnail
        if (entry.thumbnail) {
          thumbnailCache.set(photoUrl, entry.thumbnail)
        }

        // Remove from queue
        await removeFromQueue(entry.id)
        console.log('Queued upload succeeded:', photoUrl)

        // Notify listeners
        for (const callback of listeners) {
          callback(entry.itemId, photoUrl)
        }
      } catch (error) {
        console.warn('Queued upload retry failed:', entry.id, error)
        await incrementRetryCount(entry.id)
      }
    }
  } catch (error) {
    console.error('Failed to process upload queue:', error)
  }
}

async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  tx.objectStore(STORE_NAME).delete(id)
  await new Promise<void>((resolve) => { tx.oncomplete = () => resolve() })
  db.close()
}

async function incrementRetryCount(id: string): Promise<void> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    const entry: QueuedUpload = await new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    if (entry) {
      entry.retryCount++
      store.put(entry)
    }

    await new Promise<void>((resolve) => { tx.oncomplete = () => resolve() })
    db.close()
  } catch (error) {
    console.warn('Failed to increment retry count:', error)
  }
}

/**
 * Get count of pending uploads.
 */
export async function getPendingCount(): Promise<number> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const count: number = await new Promise((resolve, reject) => {
      const request = tx.objectStore(STORE_NAME).count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    db.close()
    return count
  } catch {
    return 0
  }
}

/**
 * Register a callback for when a queued upload completes.
 */
export function onUploadComplete(callback: UploadCompleteCallback): () => void {
  listeners.push(callback)
  return () => {
    const index = listeners.indexOf(callback)
    if (index >= 0) listeners.splice(index, 1)
  }
}

// Auto-retry when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online — processing upload queue')
    processQueue()
  })
}
