import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

export default function StorageStatusBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isCheckingStorage, setIsCheckingStorage] = useState(true)

  useEffect(() => {
    checkStorageStatus()
  }, [])

  const checkStorageStatus = async () => {
    try {
      // Check if we can access the property-photos bucket
      const { error } = await supabase.storage
        .from('property-photos')
        .list('test', { limit: 1 })
      
      if (error && error.message?.includes('Bucket not found')) {
        setShowBanner(true)
      } else {
        setShowBanner(false)
      }
    } catch (error) {
      // If any error, assume buckets not configured
      setShowBanner(true)
    } finally {
      setIsCheckingStorage(false)
    }
  }

  if (isCheckingStorage || !showBanner) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚠️</span>
          <span className="text-sm text-yellow-800">
            Using local storage for images. 
            <span className="ml-2 text-yellow-900 font-medium">
              Configure storage in settings
            </span>
          </span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-yellow-600 hover:text-yellow-700"
        >
          ✕
        </button>
      </div>
    </div>
  )
}