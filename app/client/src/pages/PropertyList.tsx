import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProperties, deleteProperty } from '../services/properties'
import { formatAddress } from '../utils'
import type { Property } from '../types'
import { useNotification } from '../contexts/NotificationContext'

export default function PropertyList() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showSuccess, showError } = useNotification()

  const loadProperties = async () => {
    try {
      setLoading(true)
      const data = await getProperties()
      setProperties(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProperties()
    }
  }, [user])

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
  }

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return

    try {
      setDeleting(true)
      await deleteProperty(propertyToDelete.id)
      showSuccess('Property deleted successfully')
      setPropertyToDelete(null)
      // Reload properties after deletion
      await loadProperties()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setPropertyToDelete(null)
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h3 className="alert-heading">Error Loading Properties</h3>
        <p className="mb-0">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-danger mt-3"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="py-3">
      <div className="container-fluid px-3" style={{maxWidth: '1024px'}}>
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between mb-4 gap-3">
          <div className="flex-fill">
            <h1 className="h3 fw-bold text-dark">
              Properties
            </h1>
            <p className="mt-1 small text-muted mb-0">
              Manage your properties for condition reporting
            </p>
          </div>
          <div className="d-flex">
            <Link
              to="/properties/new"
              className="btn btn-primary d-flex align-items-center"
            >
              🏢 Add Property
            </Link>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-5">
            <div className="mx-auto mb-4 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '4rem', height: '4rem'}}>
              <span className="text-4xl">🏢</span>
            </div>
            <h3 className="h5 fw-medium text-dark mb-2">No Properties Yet</h3>
            <p className="text-muted mb-4">Start by adding your first property to begin creating condition reports.</p>
            <Link
              to="/properties/new"
              className="btn btn-primary btn-lg"
            >
              Add Your First Property
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {properties.map((property) => (
              <div key={property.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h5 className="card-title fw-medium text-dark text-truncate mb-0">
                      {property.name || 'Untitled Property'}
                      </h5>
                      <span className="badge bg-primary">
                      {property.property_type || 'House'}
                      </span>
                    </div>
                  
                    <div className="mb-3">
                    {/* Unit/Complex/Estate Info */}
                    {(property.unit_number || property.complex_name || property.estate_name) && (
                      <div>
                        {property.unit_number && (
                            <span className="small text-dark fw-medium">Unit {property.unit_number}</span>
                        )}
                        {property.complex_name && (
                          <span className="small text-dark">
                            {property.unit_number && ', '}
                            {property.complex_name}
                          </span>
                        )}
                        {property.estate_name && (
                          <span className="small text-muted">
                            {(property.unit_number || property.complex_name) && ', '}
                            {property.estate_name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div>
                        <span className="small text-muted fw-medium">Address:</span>
                        <p className="small text-dark mb-0">{formatAddress(property.address)}</p>
                    </div>
                    
                    {property.gps_coordinates && (
                      <div>
                          <span className="small text-muted fw-medium">GPS:</span>
                          <p className="small text-dark font-monospace mb-0">
                          {property.gps_coordinates.latitude.toFixed(6)}, {property.gps_coordinates.longitude.toFixed(6)}
                          {property.gps_coordinates.accuracy && (
                            <span className="text-muted ms-2">±{property.gps_coordinates.accuracy}m</span>
                          )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                    <Link
                      to={`/reports/new?property=${property.id}`}
                      className="btn btn-primary flex-fill d-flex justify-content-center align-items-center py-2"
                    >
                      📋 Start Report
                    </Link>
                    <Link
                      to={`/properties/${property.id}/reports`}
                      className="btn btn-outline-secondary d-flex align-items-center py-2"
                    >
                      📊 Reports
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(property)}
                      className="btn btn-outline-danger d-flex align-items-center py-2"
                      title="Delete property"
                    >
                      🗑️
                    </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {propertyToDelete && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Property</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancelDelete}
                    disabled={deleting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this property?</p>
                  <div className="alert alert-warning">
                    <strong>{propertyToDelete.name}</strong>
                    <br />
                    <small className="text-muted">
                      {formatAddress(propertyToDelete.address)}
                    </small>
                    <br />
                    <small className="text-muted">
                      Type: {propertyToDelete.property_type || 'House'}
                    </small>
                  </div>
                  <p className="text-danger mb-0">
                    <strong>Warning:</strong> This action cannot be undone. All reports, rooms, and inspection data associated with this property will be permanently deleted.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelDelete}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete Property'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}