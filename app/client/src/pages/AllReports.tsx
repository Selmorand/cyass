import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getReports } from '../services/reports'
import { getProperties } from '../services/properties'
import type { Report, Property } from '../types'

export default function AllReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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