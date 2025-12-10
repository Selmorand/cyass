import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReport, getPublicReport, finalizeReport } from '../services/reports'
import { getProperty, getPublicProperty } from '../services/properties'
import { useAuth } from '../contexts/AuthContext'
import { CONDITION_COLORS, DEFAULT_INSPECTION_CATEGORIES } from '../types'
import { formatDate } from '../utils/formatters'
import type { Report, Property, ConditionState, RoomType } from '../types'
import { useNotification } from '../contexts/NotificationContext'
import { logActivity } from '../services/activity'

interface ReportSummaryProps {
  isPublic?: boolean
}

export default function ReportSummary({ isPublic = false }: ReportSummaryProps) {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [report, setReport] = useState<Report | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [finalizing, setFinalizing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!reportId) return

      try {
        setLoading(true)
        console.log('Loading report with new layout:', reportId, 'isPublic:', isPublic)
        const reportData = isPublic ? await getPublicReport(reportId) : await getReport(reportId)
        if (!reportData) {
          throw new Error('Report not found')
        }
        setReport(reportData)
        
        const propertyData = isPublic ? await getPublicProperty(reportData.property_id) : await getProperty(reportData.property_id)
        setProperty(propertyData)
        
        // Log report viewing activity (only for authenticated views)
        if (!isPublic) {
          logActivity('report_viewed', {
            report_id: reportData.id,
            property_id: reportData.property_id,
            status: reportData.status
          })
        }
      } catch (err) {
        console.error('Error loading report:', err)
        if (isPublic) {
          showError('Report not found or no longer available')
        } else {
          navigate('/reports')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [reportId, navigate, isPublic])

  const handleGeneratePDF = async () => {
    if (!report || !property || !user) return

    try {
      setGeneratingPDF(true)
      console.log('Calling Netlify Function for PDF generation...')

      // Call Netlify Function for server-side PDF generation (bypasses CORS)
      const response = await fetch('/.netlify/functions/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report,
          property,
          creatorRole: user.role || 'tenant',
          creatorName: user.full_name || user.email || 'User'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.statusText}`)
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${property.name.replace(/[^a-zA-Z0-9]/g, '_')}_Report_${report.id.substring(0, 8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation failed:', error)
      showError(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleFinalize = async () => {
    if (!report || !reportId) return

    // Confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to finalize this report?\n\n' +
      'Once finalized, this report cannot be edited or deleted.\n\n' +
      'This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setFinalizing(true)
      const updatedReport = await finalizeReport(reportId)
      setReport(updatedReport)
      showSuccess('Report finalized successfully! It is now locked from editing.')
    } catch (error) {
      console.error('Failed to finalize report:', error)
      showError(error instanceof Error ? error.message : 'Failed to finalize report')
    } finally {
      setFinalizing(false)
    }
  }

  // Check if report is finalized
  const isFinalized = report?.status === 'finalized'

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!report || !property) {
    return (
      <div className="py-4">
        <div className="container" style={{maxWidth: '768px'}}>
          <div className="alert alert-danger">
            <h4 className="alert-heading">Error</h4>
            <p className="mb-0">Report not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="container" style={{maxWidth: '1024px'}}>
        {/* Public View Notice */}
        {isPublic && (
          <div className="alert alert-info mb-4">
            <h5 className="alert-heading">📄 Public Report View</h5>
            <p className="mb-0">
              You are viewing a public version of this property condition report. 
              This report was generated using CYAss and shared via QR code.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="h2 fw-bold text-dark">
                {isPublic ? 'Property Condition Report' : isFinalized ? 'Finalized Report' : 'Inspection Complete!'}
              </h1>
              <p className="text-muted mb-0">{property.name}</p>
            </div>
            <div className="text-end">
              {isFinalized ? (
                <span className="badge bg-success fs-6">🔒 Finalized</span>
              ) : report.status === 'draft' ? (
                <span className="badge bg-warning text-dark fs-6">📝 Draft</span>
              ) : (
                <span className="badge bg-info text-white fs-6">✓ Completed</span>
              )}
              <div className="small text-muted mt-1">ID: {report.id.substring(0, 8)}</div>
            </div>
          </div>
        </div>

        {/* Finalized Notice */}
        {isFinalized && !isPublic && (
          <div className="alert alert-success mb-4">
            <h5 className="alert-heading">🔒 Report Finalized</h5>
            <p className="mb-0">
              This report was finalized on {report.finalized_at ? formatDate(report.finalized_at) : 'N/A'} and cannot be edited.
              You can still download the PDF report.
            </p>
          </div>
        )}

        {/* Summary Card */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">📋 Report Summary</h5>
            
            <div className="row g-3">
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <div className="small text-muted mb-1">Property Type</div>
                  <div className="fw-medium">{property.property_type}</div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <div className="small text-muted mb-1">Inspection Date</div>
                  <div className="fw-medium">{formatDate(report.created_at)}</div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <div className="small text-muted mb-1">Inspector Role</div>
                  <div className="fw-medium text-capitalize">{user?.role || 'Unknown'}</div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="border rounded p-3">
                  <div className="small text-muted mb-1">Total Rooms</div>
                  <div className="fw-medium">{report.rooms?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Condition Statistics */}
        {report.rooms && report.rooms.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">📊 Condition Overview</h5>
              
              {(() => {
                const conditionCounts: Record<ConditionState, number> = {
                  'Good': 0,
                  'Fair': 0,
                  'Poor': 0,
                  'Urgent Repair': 0,
                  'N/A': 0
                }
                
                report.rooms.forEach(room => {
                  room.items?.forEach(item => {
                    if (item.condition) {
                      conditionCounts[item.condition]++
                    }
                  })
                })
                
                const totalItems = Object.values(conditionCounts).reduce((a, b) => a + b, 0)
                
                return (
                  <>
                    <div className="row g-3 mb-3">
                      {Object.entries(conditionCounts).map(([condition, count]) => {
                        if (condition === 'N/A') return null
                        return (
                          <div key={condition} className="col-6 col-md-3">
                            <div className="text-center">
                              <div 
                                className="fs-3 fw-bold"
                                style={{ color: CONDITION_COLORS[condition as ConditionState] }}
                              >
                                {count}
                              </div>
                              <div className="small text-muted">{condition}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {totalItems > 0 && (
                      <div className="progress" style={{height: '30px'}}>
                        {Object.entries(conditionCounts).map(([condition, count]) => {
                          if (condition === 'N/A' || count === 0) return null
                          const percentage = (count / totalItems) * 100
                          return (
                            <div
                              key={condition}
                              className="progress-bar"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: CONDITION_COLORS[condition as ConditionState]
                              }}
                              role="progressbar"
                              aria-valuenow={percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              {percentage > 10 && `${Math.round(percentage)}%`}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Room Details */}
        {report.rooms && report.rooms.length > 0 && (
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">🏠 Room Details</h5>
              
              <div className="vstack gap-5">
                {report.rooms.map((room) => {
                  // Get the categories for this room type
                  const categories = DEFAULT_INSPECTION_CATEGORIES[room.type as RoomType] || []
                  const CONDITIONS: ConditionState[] = ['Good', 'Fair', 'Poor', 'Urgent Repair']
                  
                  return (
                    <div key={room.id} className="mb-5 p-3 rounded shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                      {/* Room Title */}
                      <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div className="me-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', backgroundColor: '#0c0e43', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                          🏠
                        </div>
                        <h4 className="fw-bold text-dark mb-0" style={{ color: '#0c0e43' }}>{room.name}</h4>
                      </div>

                      {/* Room Video Walkthrough */}
                      {room.video_url && (
                        <div className="alert alert-info mb-4">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <strong>📹 Room Walkthrough Video</strong>
                              {room.video_duration && (
                                <span className="ms-2 text-muted">
                                  ({Math.floor(room.video_duration / 60)}:{(room.video_duration % 60).toString().padStart(2, '0')})
                                </span>
                              )}
                            </div>
                            <a
                              href={room.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary"
                            >
                              View Video
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Room Items */}
                      <div className="vstack gap-4">
                        {categories.map((category) => {
                          // Find the item for this category
                          const item = room.items?.find(i => i.category_id === category.id)
                          if (!item) return null // Skip if no data for this category
                          
                          return (
                            <div key={category.id} className="border rounded p-3 mb-3" style={{ backgroundColor: '#fafafa', borderColor: '#e0e0e0' }}>
                              {/* Category Title and Description */}
                              <div className="border-bottom pb-2 mb-3" style={{ borderColor: '#d0d0d0' }}>
                                <h5 className="fw-bold text-dark mb-1">{category.name}</h5>
                                <p className="text-muted small mb-0">{category.description}</p>
                              </div>
                              
                              {/* Condition Badge */}
                              <div className="mb-3">
                                <span
                                  className="badge fw-medium px-3 py-2"
                                  style={{
                                    backgroundColor: CONDITION_COLORS[item.condition],
                                    color: 'white',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {item.condition}
                                </span>
                              </div>
                              
                              {/* Notes/Comments */}
                              {item.notes && (
                                <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f0f8ff', border: '1px solid #c8e6ff' }}>
                                  <p className="mb-0 text-dark">{item.notes}</p>
                                </div>
                              )}
                              
                              {/* Photo Thumbnails */}
                              {item.photos && item.photos.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                  {item.photos.map((photo, idx) => (
                                    <div key={idx} className="position-relative">
                                      <img
                                        src={photo}
                                        alt={`${category.name} photo ${idx + 1}`}
                                        className="rounded border"
                                        style={{
                                          width: '100px',
                                          height: '100px',
                                          objectFit: 'cover',
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                          const newWindow = window.open()
                                          if (newWindow) {
                                            newWindow.document.write(`<img src="${photo}" style="max-width:100%; height:auto;" />`)
                                          }
                                        }}
                                      />
                                      <div
                                        className="position-absolute top-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '20px', height: '20px', fontSize: '12px', margin: '2px', cursor: 'default' }}
                                      >
                                        ✕
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">{isFinalized ? '📄 Report Actions' : '📄 Next Steps'}</h5>

            {!isFinalized && (
              <div className="alert alert-info mb-3">
                <strong>Solo Report Notice:</strong> This is a self-generated report. For joint verification,
                both parties must be present during inspection.
              </div>
            )}

            {/* Finalize Warning - only show for completed but not finalized reports */}
            {!isPublic && !isFinalized && report.status === 'completed' && (
              <div className="alert alert-warning mb-3">
                <strong>Ready to Finalize?</strong> Once you finalize this report, it will be locked and cannot be edited or deleted.
                Make sure all inspection items are complete before finalizing.
              </div>
            )}

            <div className="d-flex flex-wrap gap-2">
              {!isPublic && (
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF}
                  className="btn btn-primary"
                  style={{backgroundColor: '#0c0e43', borderColor: '#0c0e43'}}
                >
                  {generatingPDF ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating PDF...
                    </>
                  ) : (
                    <>📥 Download PDF Report</>
                  )}
                </button>
              )}

              {/* Finalize Button - only show for completed (not finalized) reports */}
              {!isPublic && !isFinalized && report.status === 'completed' && (
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="btn btn-success"
                >
                  {finalizing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Finalizing...
                    </>
                  ) : (
                    <>🔒 Finalize Report</>
                  )}
                </button>
              )}

              {/* Edit button - only show for non-finalized reports */}
              {!isPublic && !isFinalized && (
                <button
                  onClick={() => navigate(`/reports/${reportId}/inspect`)}
                  className="btn btn-outline-warning"
                >
                  ✏️ Edit Report
                </button>
              )}

              {!isPublic && (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-secondary"
                  >
                    Back to Dashboard
                  </button>

                  <button
                    onClick={() => navigate('/reports/new')}
                    className="btn btn-outline-primary"
                  >
                    Start New Report
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}