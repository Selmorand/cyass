import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGeolocation } from '../hooks/useGeolocation'
import { createProperty } from '../services/properties'
import { formatGPSCoordinates } from '../utils'
import PropertyForm from '../components/PropertyForm'
import type { CreatePropertyInput } from '../types'

export default function AddProperty() {
  const navigate = useNavigate()
  const { coordinates, accuracy, loading: gpsLoading, error: gpsError, requestLocation } = useGeolocation()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Detect if user is on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isDesktop = !isMobile

  const handleSubmit = async (propertyData: CreatePropertyInput) => {
    try {
      setSubmitting(true)
      setError(null)

      if (!coordinates) {
        throw new Error('GPS coordinates are required. Please capture location first.')
      }

      // Validate GPS accuracy - prevent poor network-based location
      if (accuracy && accuracy > 200) {
        throw new Error(
          `GPS accuracy is too poor (±${accuracy.toFixed(0)}m). ` +
          `Your browser may be using network location instead of GPS. ` +
          `Please enable "Use precise location" in your browser settings and retry GPS capture. ` +
          `For accurate property inspection, GPS accuracy should be better than ±200m (ideally ±5-50m).`
        )
      }

      const propertyWithGPS: CreatePropertyInput = {
        ...propertyData,
        gps_coordinates: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy,
          timestamp: new Date().toISOString()
        }
      }

      await createProperty(propertyWithGPS)
      navigate('/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create property')
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-3">
      <div className="container px-3" style={{maxWidth: '1024px'}}>
        <div className="mb-4">
          <h1 className="h3 fw-bold text-dark">
            Add New Property
          </h1>
          <p className="mt-1 small text-muted mb-0">
            Register a property for condition reporting with GPS verification
          </p>
        </div>

        {/* GPS Status Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-body p-3">
            <h5 className="card-title fw-medium text-dark mb-3">📍 Location Verification</h5>

            {/* Desktop Warning */}
            {isDesktop && (
              <div className="alert alert-info d-flex align-items-start mb-3">
                <span className="text-info fs-5 me-2">💻</span>
                <div>
                  <h6 className="alert-heading small">Desktop Detected</h6>
                  <p className="mb-0 small">
                    <strong>Note:</strong> Desktop/laptop GPS accuracy is typically poor (±500-5000m) as most computers don't have GPS hardware.
                    For accurate property location (±5-50m), please use a mobile device outdoors.
                  </p>
                </div>
              </div>
            )}

            {!coordinates && (
              <div className="alert alert-warning d-flex align-items-start mb-3">
                <span className="text-warning fs-5 me-2">⚠️</span>
                <div>
                  <h6 className="alert-heading small">GPS Required</h6>
                  <p className="mb-0 small">
                    You must capture GPS coordinates before submitting the property.
                    {isMobile && " For best results, go outdoors with a clear view of the sky."}
                  </p>
                  {isMobile && (
                    <div className="mt-2 pt-2 border-top">
                      <p className="mb-1 small"><strong>📍 Important for Accurate GPS:</strong></p>
                      <p className="mb-0 small text-muted">
                        When your browser asks for location permission, make sure to check/enable <strong>"Use precise location"</strong> to get accurate GPS (±5-50m) instead of network location (±500-5000m).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-sm-between gap-3">
              <div className="flex-fill">
              {coordinates ? (
                <div>
                  <div className={accuracy && accuracy < 100 ? "text-success" : accuracy && accuracy < 500 ? "text-warning" : "text-danger"}>
                    {accuracy && accuracy < 100 ? "✅" : accuracy && accuracy < 500 ? "⚠️" : "❌"} <strong>Location Captured</strong>
                    {accuracy && accuracy > 100 && (
                      <span className="small ms-2">
                        {accuracy < 500 ? "(Fair accuracy - consider retrying)" : "(Poor accuracy - please retry)"}
                      </span>
                    )}
                  </div>
                  <div className="small text-muted mt-1 font-monospace">
                    {formatGPSCoordinates({
                      latitude: coordinates.latitude,
                      longitude: coordinates.longitude,
                      accuracy,
                      timestamp: new Date().toISOString()
                    })}
                  </div>
                  {accuracy && accuracy > 100 && (
                    <div className="small mt-2">
                      <span className={accuracy < 500 ? "badge bg-warning text-dark" : "badge bg-danger"}>
                        Accuracy: ±{accuracy.toFixed(0)}m {accuracy < 50 ? "Excellent" : accuracy < 100 ? "Good" : accuracy < 500 ? "Fair" : "Poor"}
                      </span>
                      {accuracy > 200 && (
                        <div className="alert alert-warning mt-2 mb-0">
                          <strong>⚠️ Poor GPS Accuracy Detected</strong>
                          <p className="mb-2 small">Your browser may be using network location instead of GPS.</p>
                          <p className="mb-1 small"><strong>To fix this:</strong></p>
                          <ol className="mb-0 small ps-3">
                            <li>Tap the <strong>padlock (🔒)</strong> icon in your browser address bar</li>
                            <li>Tap <strong>"Permissions"</strong> or <strong>"Site settings"</strong></li>
                            <li>Tap <strong>"Location"</strong></li>
                            <li>Enable <strong>"Use precise location"</strong> toggle</li>
                            <li>Refresh this page and retry GPS capture</li>
                          </ol>
                          <p className="mt-2 mb-0 small text-muted">
                            Alternative: Clear your browser's site data for this site and re-grant permission, making sure to check "Use precise location"
                          </p>
                        </div>
                      )}
                      {accuracy > 100 && accuracy <= 200 && (
                        <div className="text-muted small mt-1">
                          💡 Tip: Go outdoors with a clear view of the sky, or check if "Use precise location" is enabled in browser settings
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : gpsError ? (
                <div className="text-danger">
                  ❌ <strong>Location Error:</strong> {gpsError}
                </div>
              ) : (
                <div className="text-muted">
                  📍 GPS coordinates not captured yet
                </div>
              )}
              </div>
              <button
              onClick={requestLocation}
              disabled={gpsLoading}
                className="btn btn-primary d-flex align-items-center"
            >
              {gpsLoading ? (
                <>
                  <div className="spinner-border spinner-border-sm text-light me-2" role="status"></div>
                  Getting Location...
                </>
              ) : coordinates ? (
                <>🔄 Retry GPS</>
              ) : (
                <>🎯 Capture GPS</>
              )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger d-flex align-items-start mb-4">
            <span className="text-danger fs-5 me-2">❌</span>
            <div>
              <h6 className="alert-heading small">Error</h6>
              <p className="mb-0 small">{error}</p>
            </div>
          </div>
        )}

        {/* Property Form */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h5 className="card-title fw-medium text-dark mb-1">Property Details</h5>
            <p className="card-text small text-muted mb-0">
              Fill in the property information below
            </p>
          </div>
          <div className="card-body p-3">
            <PropertyForm 
              onSubmit={handleSubmit}
              submitting={submitting}
              hasGPS={!!coordinates}
            />
          </div>
        </div>
      </div>
    </div>
  )
}