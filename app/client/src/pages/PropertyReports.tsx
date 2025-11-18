import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProperty } from '../services/properties'
import { reportsService } from '../services/reports'
import { formatAddress, formatDate } from '../utils'
import type { Property, Report } from '../types'
import { useNotification } from '../contexts/NotificationContext'

export default function PropertyReports() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [property, setProperty] = useState<Property | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!propertyId || !user) return

      try {
        setLoading(true)
        
        // Load property details
        const propertyData = await getProperty(propertyId)
        if (!propertyData) {
          throw new Error('Property not found')
        }
        setProperty(propertyData)
        
        // Load reports for this property
        const reportsData = await reportsService.getReportsByProperty(propertyId)
        setReports(reportsData)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [propertyId, user])

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    setDeletingId(reportId)
    try {
      await reportsService.deleteReport(reportId)
      // Remove from local state
      setReports(prev => prev.filter(report => report.id !== reportId))
      showSuccess('Report deleted successfully!')
    } catch (error) {
      console.error('Error deleting report:', error)
      showError('Failed to delete report. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="py-4">
        <div className="container px-3" style={{maxWidth: '1024px'}}>
          <div className="alert alert-danger">
            <h3 className="alert-heading">Error</h3>
            <p className="mb-0">{error || 'Property not found'}</p>
            <button 
              onClick={() => navigate('/properties')}
              className="btn btn-danger mt-3"
            >
              Back to Properties
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
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div className="flex-fill">
              <nav className="d-flex align-items-center small text-muted mb-2">
                <Link to="/properties" className="text-decoration-none text-muted me-2">Properties</Link>
                <span>›</span>
                <span className="text-dark">{property.name}</span>
              </nav>
              <h1 className="h2 fw-bold text-dark">
                Reports for {property.name}
              </h1>
              <div className="mt-2">
                <p className="small text-muted mb-1">
                  <span className="fw-medium">Type:</span> {property.property_type}
                </p>
                {(property.unit_number || property.complex_name || property.estate_name) && (
                  <p className="small text-muted mb-1">
                    {property.unit_number && `Unit ${property.unit_number}`}
                    {property.complex_name && `${property.unit_number ? ', ' : ''}${property.complex_name}`}
                    {property.estate_name && `${(property.unit_number || property.complex_name) ? ', ' : ''}${property.estate_name}`}
                  </p>
                )}
                <p className="small text-muted mb-1">
                  <span className="fw-medium">Address:</span> {formatAddress(property.address)}
                </p>
              </div>
            </div>
            <div className="mt-3 d-flex gap-3 mt-md-0 ms-md-4">
              <Link
                to={`/reports/new?property=${property.id}`}
                className="btn btn-primary d-flex align-items-center"
              >
                📋 New Report
              </Link>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-5">
            <div className="mx-auto mb-4 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '6rem', height: '6rem'}}>
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="h5 fw-medium text-dark mb-2">No Reports Yet</h3>
            <p className="text-muted mb-4">Start by creating your first condition report for this property.</p>
            <Link
              to={`/reports/new?property=${property.id}`}
              className="btn btn-primary d-flex align-items-center"
            >
              Create First Report
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {reports.map((report) => (
              <div key={report.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <span className={`badge ${
                          report.status === 'completed' 
                            ? 'bg-success'
                            : report.status === 'paid'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}>
                        {report.status}
                        </span>
                      </div>
                      <span className="small text-muted font-monospace">
                        {report.id.substring(0, 8)}
                      </span>
                    </div>
                  
                    <div className="mb-3">
                      <div className="mb-2">
                        <span className="small text-muted">Created:</span>
                        <p className="small text-dark mb-0">{formatDate(report.created_at)}</p>
                      </div>
                    
                      <div className="mb-2">
                        <span className="small text-muted">Rooms:</span>
                        <p className="small text-dark mb-0">{report.rooms?.length || 0} rooms inspected</p>
                      </div>
                    
                      <div className="mb-2">
                        <span className="small text-muted">Items:</span>
                        <p className="small text-dark mb-0">
                          {report.rooms?.reduce((total, room) => total + (room.items?.length || 0), 0) || 0} items
                        </p>
                      </div>
                    
                      <div className="mb-2">
                        <span className="small text-muted">Photos:</span>
                        <p className="small text-dark mb-0">
                          {report.rooms?.reduce((total, room) => 
                            total + (room.items?.reduce((itemTotal, item) => 
                              itemTotal + (item.photos?.length || 0), 0) || 0), 0) || 0} photos
                        </p>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                    {report.status === 'completed' ? (
                      <Link
                        to={`/reports/${report.id}/summary`}
                        className="btn btn-success flex-fill d-flex justify-content-center align-items-center"
                      >
                        📄 View Report
                      </Link>
                    ) : (
                      <Link
                        to={`/reports/${report.id}/inspection`}
                        className="btn btn-primary flex-fill d-flex justify-content-center align-items-center"
                      >
                        📋 Continue
                      </Link>
                    )}
                    
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      disabled={deletingId === report.id}
                      className="btn btn-outline-danger d-flex align-items-center"
                    >
                      {deletingId === report.id ? (
                        <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                      ) : (
                        '🗑️'
                      )}
                    </button>
                  </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}