import { useState, useCallback } from 'react'
import type { GPSCoordinates } from '../types'

interface UseGeolocationReturn {
  coordinates: GPSCoordinates | null
  accuracy: number | undefined
  loading: boolean
  error: string | null
  getCurrentLocation: () => Promise<GPSCoordinates>
  requestLocation: () => Promise<GPSCoordinates>
  clearError: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GPSCoordinates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = useCallback(async (): Promise<GPSCoordinates> => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser'
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setLoading(true)
    setError(null)

    return new Promise((resolve, reject) => {
      const options: PositionOptions = {
        enableHighAccuracy: true, // Request GPS instead of network location
        timeout: 30000, // 30 seconds - give GPS time to get accurate fix
        maximumAge: 0 // Force fresh reading, no cached data
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }

          // Log accuracy for debugging
          console.log(`GPS accuracy: ±${position.coords.accuracy.toFixed(2)}m`)

          setCoordinates(coords)
          setLoading(false)
          resolve(coords)
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please enable location services in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Make sure GPS is enabled on your device.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or ensure you have a clear view of the sky.'
              break
          }

          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    coordinates,
    accuracy: coordinates?.accuracy,
    loading,
    error,
    getCurrentLocation,
    requestLocation: getCurrentLocation,
    clearError
  }
}