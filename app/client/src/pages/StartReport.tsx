import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getProperties, getProperty } from '../services/properties'
import { createReport } from '../services/reports'
import RoomSelector from '../components/RoomSelector'
import InspectionTemplate from '../components/InspectionTemplate'
import type { Property, RoomType } from '../types'

interface Room {
  id: string
  name: string
  type: RoomType
}

export default function StartReport() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const propertyId = searchParams.get('property')

  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [currentStep, setCurrentStep] = useState<'property' | 'rooms' | 'templates'>('property')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const propertiesData = await getProperties()
        setProperties(propertiesData)

        if (propertyId) {
          const property = await getProperty(propertyId)
          if (property) {
            setSelectedProperty(property)
            setCurrentStep('rooms')
          }
        } else if (propertiesData.length === 1) {
          setSelectedProperty(propertiesData[0])
          setCurrentStep('rooms')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user, propertyId])

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property)
    setCurrentStep('rooms')
  }

  const handleRoomsNext = async () => {
    if (selectedRooms.length > 0) {
      // Skip template step and create report immediately
      await handleCreateReport()
    }
  }

  const handleRoomAdded = async (room: Room) => {
    // Immediately create report with just this one room and navigate to inspection
    setSelectedRooms([room])
    await handleCreateReportWithRoom(room)
  }

  const handleCreateReportWithRoom = async (room: Room) => {
    if (!selectedProperty) return

    try {
      setCreating(true)
      const reportTitle = `${selectedProperty.name} - ${new Date().toLocaleDateString()}`
      
      const createdReport = await createReport({
        property_id: selectedProperty.id,
        title: reportTitle
      })
      
      console.log('Report created:', createdReport.id)

      // Navigate directly to inspection flow with the room
      navigate(`/reports/${createdReport.id}/inspect`, {
        state: { rooms: [room] }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report')
      setCreating(false)
    }
  }

  const handleCreateReport = async () => {
    if (!selectedProperty || selectedRooms.length === 0) return

    try {
      setCreating(true)
      const reportTitle = `${selectedProperty.name} - ${new Date().toLocaleDateString()}`
      
      const createdReport = await createReport({
        property_id: selectedProperty.id,
        title: reportTitle
      })
      
      console.log('Report created:', createdReport.id)

      // Navigate to inspection flow
      navigate(`/reports/${createdReport.id}/inspect`, {
        state: { rooms: selectedRooms }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report')
      setCreating(false)
    }
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
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-danger mt-3"
            >
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
        <div className="mb-4">
          <h1 className="h2 fw-bold text-dark">
            Start New Report
          </h1>
          <p className="mt-1 small text-muted">
            Create a condition report for your property
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-center">
            <div className={`d-flex align-items-center me-3 ${currentStep === 'property' ? 'text-primary' : currentStep === 'rooms' || currentStep === 'templates' ? 'text-success' : 'text-muted'}`}>
              <span className="badge rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '2rem', height: '2rem', backgroundColor: currentStep === 'property' ? '#0c0e43' : currentStep === 'rooms' || currentStep === 'templates' ? '#88cb11' : '#6c757d'}}>
                1
              </span>
              <span className="small fw-medium">Property</span>
            </div>
            <div className="border-top mx-2" style={{width: '2rem', borderColor: currentStep === 'rooms' || currentStep === 'templates' ? '#88cb11' : '#dee2e6'}}></div>
            <div className={`d-flex align-items-center me-3 ${currentStep === 'rooms' ? 'text-primary' : currentStep === 'templates' ? 'text-success' : 'text-muted'}`}>
              <span className="badge rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '2rem', height: '2rem', backgroundColor: currentStep === 'rooms' ? '#0c0e43' : currentStep === 'templates' ? '#88cb11' : '#6c757d'}}>
                2
              </span>
              <span className="small fw-medium">Rooms</span>
            </div>
            <div className="border-top mx-2" style={{width: '2rem', borderColor: currentStep === 'templates' ? '#88cb11' : '#dee2e6'}}></div>
            <div className={`d-flex align-items-center ${currentStep === 'templates' ? 'text-primary' : 'text-muted'}`}>
              <span className="badge rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '2rem', height: '2rem', backgroundColor: currentStep === 'templates' ? '#0c0e43' : '#6c757d'}}>
                3
              </span>
              <span className="small fw-medium">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: Property Selection */}
        {currentStep === 'property' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Select Property</h2>
            
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">You need to add a property before creating reports</p>
                <button
                  onClick={() => navigate('/properties/new')}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Property First
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property)}
                    className="text-left p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{property.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {property.address.street_number} {property.address.street_name}, {property.address.suburb}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {property.address.city}, {property.address.province}
                        </p>
                      </div>
                      <span className="text-2xl">🏢</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Room Selection */}
        {currentStep === 'rooms' && selectedProperty && (
          <div>
            <div className="mb-4">
              <p className="small text-muted">
                Property: <span className="fw-medium">{selectedProperty.name}</span>
              </p>
            </div>
            
            <RoomSelector
              selectedRooms={selectedRooms}
              onRoomsChange={setSelectedRooms}
              onNext={handleRoomsNext}
              onRoomAdded={handleRoomAdded}
            />

            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setCurrentStep('property')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Properties
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review Templates */}
        {currentStep === 'templates' && selectedProperty && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Review Inspection Templates</h2>
              <p className="text-sm text-gray-600 mt-1">
                Property: <span className="font-medium">{selectedProperty.name}</span> • 
                {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            <div className="space-y-6">
              {selectedRooms.map((room) => (
                <InspectionTemplate
                  key={room.id}
                  roomType={room.type}
                  roomName={room.name}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep('rooms')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                ← Back to Rooms
              </button>
              
              <button
                onClick={handleCreateReport}
                disabled={creating}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Report...
                  </>
                ) : (
                  <>🚀 Create Report</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}