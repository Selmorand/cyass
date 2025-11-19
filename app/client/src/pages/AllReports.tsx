import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getReports, deleteReport } from '../services/reports'
import { getProperties } from '../services/properties'
import type { Report, Property } from '../types'
import { useNotification } from '../contexts/NotificationContext'

export default function AllReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reportsData, propertiesData] = await Promise.all([
        getReports(),
        getProperties()
      ])
      
      setReports(reportsData)
      setProperties(propertiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (report: Report) => {
    setReportToDelete(report)
  }

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return

    try {
      setDeleting(true)
      await deleteReport(reportToDelete.id)
      showSuccess('Report deleted successfully')
      setReportToDelete(null)
      // Reload reports after deletion
      await loadData()
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete report')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setReportToDelete(null)
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    return property?.name || 'Unknown Property'
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { class: 'bg-warning text-dark', text: 'Draft' },
      completed: { class: 'bg-success text-white', text: 'Completed' },
      pending: { class: 'bg-secondary text-white', text: 'Pending' }
    }
    const badge = badges[status as keyof typeof badges] || badges.draft
    return (
      <span className={`badge ${badge.class}`}>
        {badge.text}
      </span>
    )
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
      <div className="py-4">
        <div className="container px-3" style={{maxWidth: '1024px'}}>
          <div className="alert alert-danger">
            <h3 className="alert-heading">Error</h3>
            <p className="mb-0">{error}</p>
            <button onClick={loadData} className="btn btn-danger mt-3">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="container-fluid px-3" style={{maxWidth: '1024px'}}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 fw-bold text-dark">All Reports</h1>
            <p className="text-muted mb-0">Your inspection reports across all properties</p>
          </div>
          <Link
            to="/reports/new"
            className="btn"
            style={{backgroundColor: '#88cb11', borderColor: '#88cb11', color: 'white'}}
          >
            + New Report
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-5">
            <div className="mx-auto mb-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '4rem', height: '4rem'}}>
              <span className="fs-2">📋</span>
            </div>
            <h3 className="h5 fw-medium text-dark mb-2">No Reports Yet</h3>
            <p className="text-muted mb-4">Create your first property condition report</p>
            <Link
              to="/reports/new"
              className="btn"
              style={{backgroundColor: '#88cb11', borderColor: '#88cb11', color: 'white'}}
            >
              + Create First Report
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {reports.map((report) => (
              <div key={report.id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0">{report.title}</h5>
                      {getStatusBadge(report.status)}
                    </div>
                    
                    <p className="card-text text-muted small mb-2">
                      📍 {getPropertyName(report.property_id)}
                    </p>
                    
                    <p className="card-text text-muted small mb-3">
                      🏠 {report.rooms?.length || 0} rooms • 
                      📸 {report.rooms?.reduce((total, room) => 
                        total + (room.items?.reduce((itemTotal, item) => 
                          itemTotal + (item.photos?.length || 0), 0) || 0), 0) || 0} photos
                    </p>
                    
                    <p className="card-text">
                      <small className="text-muted">
                        Created: {new Date(report.created_at).toLocaleDateString()}
                      </small>
                    </p>
                  </div>
                  
                  <div className="card-footer bg-transparent">
                    <div className="d-flex gap-2">
                      {report.status === 'draft' ? (
                        <Link
                          to={`/reports/${report.id}/inspect`}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          Continue
                        </Link>
                      ) : (
                        <Link
                          to={`/reports/${report.id}/summary`}
                          className="btn btn-outline-primary btn-sm flex-1"
                        >
                          View Report
                        </Link>
                      )}

                      <Link
                        to={`/properties/${report.property_id}/reports`}
                        className="btn btn-outline-secondary btn-sm"
                        title="View all reports for this property"
                      >
                        🏠
                      </Link>

                      <button
                        onClick={() => handleDeleteClick(report)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete report"
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
        {reportToDelete && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete Report</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCancelDelete}
                    disabled={deleting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this report?</p>
                  <div className="alert alert-warning">
                    <strong>{reportToDelete.title}</strong>
                    <br />
                    <small className="text-muted">
                      Property: {getPropertyName(reportToDelete.property_id)}
                    </small>
                    <br />
                    <small className="text-muted">
                      {reportToDelete.rooms?.length || 0} rooms • {' '}
                      {reportToDelete.rooms?.reduce((total, room) =>
                        total + (room.items?.reduce((itemTotal, item) =>
                          itemTotal + (item.photos?.length || 0), 0) || 0), 0) || 0} photos
                    </small>
                  </div>
                  <p className="text-danger mb-0">
                    <strong>Warning:</strong> This action cannot be undone. All rooms, inspection items, and associated data will be permanently deleted.
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
                      'Delete Report'
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