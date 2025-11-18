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
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GPSCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          }

          setCoordinates(coords)
          setLoading(false)
          resolve(coords)
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location'

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
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