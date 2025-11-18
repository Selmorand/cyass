import { useState, useCallback } from 'react'
import { storageService } from '../services/storage'

interface UsePhotoReturn {
  loading: boolean
  error: string | null
  uploadPhoto: (file: File) => Promise<string>
  compressImage: (file: File) => Promise<File>
  clearError: () => void
}

export function usePhoto(): UsePhotoReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPhoto = useCallback(async (file: File): Promise<string> => {
    setLoading(true)
    setError(null)

    try {
      // For Phase 6+7: Convert to data URL for immediate display, real upload in Phase 8
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
      
      return dataUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const compressImage = useCallback(async (file: File): Promise<File> => {
    try {
      return await storageService.compressImage(file)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compress image'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    uploadPhoto,
    compressImage,
    clearError
  }
}