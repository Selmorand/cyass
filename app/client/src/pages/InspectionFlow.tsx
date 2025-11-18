import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ItemInspection from '../components/ItemInspection'
import RoomSelector from '../components/RoomSelector'
import { DEFAULT_INSPECTION_CATEGORIES } from '../types'
import { getProperty } from '../services/properties'
import { getReport, reportsService } from '../services/reports'
import type { Report, Property, ConditionState, RoomType } from '../types'
import { useNotification } from '../contexts/NotificationContext'
import { logActivity } from '../services/activity'

interface InspectionData {
  [categoryId: string]: {
    condition: ConditionState
    notes?: string
    photos?: string[]
  }
}

interface Room {
  id: string
  name: string
  type: RoomType
}

export default function InspectionFlow() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { showError, showWarning, showSuccess } = useNotification()
  
  const [report, setReport] = useState<Report | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [inspectionData, setInspectionData] = useState<{ [roomId: string]: InspectionData }>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set())
  
  // Track rooms state
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsCreatedInDb, setRoomsCreatedInDb] = useState(false)
  
  // Initialize rooms from location state or report data
  useEffect(() => {
    if (rooms.length === 0) {
      if (location.state?.rooms && location.state.rooms.length > 0) {
        setRooms(location.state.rooms)
      } else if (report?.rooms && report.rooms.length > 0) {
        setRooms(report.rooms)
      }
    }
  }, [location.state?.rooms, report?.rooms, rooms.length])
  const currentRoom = rooms[currentRoomIndex]
  const categories = currentRoom ? (DEFAULT_INSPECTION_CATEGORIES[currentRoom.type] || []) : []
  
  useEffect(() => {
    const loadData = async () => {
      if (!reportId) return
      
      try {
        setLoading(true)
        
        // If rooms are passed via state, save them to database first
        if (location.state?.rooms && location.state.rooms.length > 0 && !roomsCreatedInDb) {
          console.log('Creating rooms in database:', location.state.rooms)
          
          const createdRooms: Room[] = []
          const roomIdMapping: { [oldId: string]: string } = {}
          
          for (const room of location.state.rooms) {
            try {
              const createdRoom = await reportsService.createRoom(reportId, room.name, room.type)
              console.log('Room created:', createdRoom)
              createdRooms.push(createdRoom)
              
              // Map old temporary ID to new database ID
              roomIdMapping[room.id] = createdRoom.id
            } catch (roomError) {
              console.error('Error creating room:', roomError)
              const errorMessage = roomError instanceof Error ? roomError.message : JSON.stringify(roomError)
              throw new Error(`Failed to create room ${room.name}: ${errorMessage}`)
            }
          }
          
          // Update rooms state with the created rooms
          setRooms(createdRooms)
          setRoomsCreatedInDb(true)
          
          // Log inspection started activity
          logActivity('inspection_started', {
            report_id: reportId,
            rooms_count: createdRooms.length,
            room_types: createdRooms.map(r => r.type)
          })
          
          // Migrate any existing inspection data from temporary IDs to database IDs
          setInspectionData(prevData => {
            const migratedData: typeof prevData = {}
            for (const [oldId, data] of Object.entries(prevData)) {
              const newId = roomIdMapping[oldId]
              if (newId) {
                migratedData[newId] = data
              } else {
                // Keep data with original ID if no mapping found
                migratedData[oldId] = data
              }
            }
            console.log('Migrated inspection data from temporary to database IDs:', migratedData)
            return migratedData
          })
        }
        
        const reportData = await getReport(reportId)
        if (!reportData) {
          throw new Error('Report not found')
        }
        setReport(reportData)
        
        const propertyData = await getProperty(reportData.property_id)
        setProperty(propertyData)
      } catch (error) {
        console.error('Error loading data:', error)
        showError('Failed to load report')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [reportId, navigate, roomsCreatedInDb])
  
  const handleItemChange = (categoryId: string, value: { condition: ConditionState; notes?: string; photos?: string[] }) => {
    setInspectionData(prev => ({
      ...prev,
      [currentRoom.id]: {
        ...prev[currentRoom.id],
        [categoryId]: value
      }
    }))
  }
  
  
  const validateCurrentRoom = (): boolean => {
    const roomData = inspectionData[currentRoom.id] || {}
    
    for (const category of categories) {
      const item = roomData[category.id]
      if (!item?.condition) continue
      
      const needsComment = item.condition !== 'Good'
      const hasComment = !!item.notes?.trim()
      
      if (needsComment && !hasComment) {
        showWarning(`Please add a comment for "${category.name}" (${item.condition} condition)`)
        return false
      }
    }
    
    return true
  }
  
  const saveCurrentRoomData = async () => {
    if (!validateCurrentRoom()) return false
    
    // Mark current room as completed
    const newCompletedRooms = new Set(completedRooms)
    newCompletedRooms.add(currentRoom.id)
    setCompletedRooms(newCompletedRooms)
    
    // Save current room data
    setSaving(true)
    try {
      const roomData = inspectionData[currentRoom.id] || {}
      const itemsToSave = Object.keys(roomData).filter(categoryId => roomData[categoryId]?.condition)
      
      console.log(`Saving ${itemsToSave.length} inspection items for room:`, currentRoom.name)
      
      let successCount = 0
      let failureCount = 0
      
      for (const categoryId of itemsToSave) {
        const item = roomData[categoryId]
        try {
          await reportsService.createInspectionItem(currentRoom.id, {
            category_id: categoryId,
            condition: item.condition,
            notes: item.notes,
            photos: item.photos || []
          })
          successCount++
          console.log(`✅ Saved: ${categoryId} = ${item.condition}`)
        } catch (itemError) {
          failureCount++
          console.error(`❌ Failed to save ${categoryId}:`, itemError)
        }
      }
      
      console.log(`Save summary: ${successCount} success, ${failureCount} failed`)
      
      if (failureCount > 0) {
        showWarning(`Saved ${successCount} items, but ${failureCount} failed. Check console for details.`)
      }
      
      return successCount > 0
    } catch (error) {
      console.error('Error in saveCurrentRoomData:', error)
      showError(`Failed to save room data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleAddAnotherRoom = async () => {
    const saved = await saveCurrentRoomData()
    if (saved) {
      setShowAddRoom(true)
    }
  }

  const handleViewReport = async () => {
    const saved = await saveCurrentRoomData()
    if (saved) {
      await finishInspection()
    }
  }
  
  const finishInspection = async () => {
    setSaving(true)
    try {
      // Update report status
      await reportsService.updateReport(reportId!, { status: 'completed' })
      showSuccess('Inspection completed successfully!')
      navigate(`/reports/${reportId}/summary`)
    } catch (error) {
      console.error('Error completing inspection:', error)
      showError('Failed to complete inspection')
    } finally {
      setSaving(false)
    }
  }
  
  
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }
  
  if (!currentRoom || rooms.length === 0) {
    return (
      <div className="py-4">
        <div className="container px-3" style={{maxWidth: '1024px'}}>
          <div className="alert alert-warning">
            <h3 className="alert-heading">No Rooms Selected</h3>
            <p className="mb-0">Please select rooms first</p>
            <button
              onClick={() => navigate(`/reports/new?property=${property?.id}`)}
              className="btn btn-warning mt-3"
            >
              Select Rooms
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const roomData = inspectionData[currentRoom.id] || {}
  const completedItems = Object.keys(roomData).filter(id => roomData[id]?.condition).length
  const progress = (completedItems / categories.length) * 100
  
  return (
    <div className="py-4">
      <div className="container-fluid px-3" style={{maxWidth: '1024px'}}>
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h1 className="h2 fw-bold text-dark">
                {currentRoom.name}
              </h1>
              <p className="text-muted mb-0">
                {property?.name} • Room {currentRoomIndex + 1} of {rooms.length}
              </p>
            </div>
            <div className="text-end">
              <div className="small text-muted">Progress</div>
              <div className="h5 fw-medium text-dark mb-0">
                {completedItems}/{categories.length} items
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="progress" style={{height: '8px'}}>
            <div 
              className="progress-bar"
              style={{ width: `${progress}%`, backgroundColor: '#88cb11' }}
            />
          </div>
        </div>
        
        {/* Room navigation tabs */}
        <div className="d-flex gap-2 mb-4 overflow-auto">
          {rooms.map((room, index) => (
            <button
              key={room.id}
              onClick={() => {
                if (validateCurrentRoom()) {
                  setCurrentRoomIndex(index)
                }
              }}
              className={`btn btn-sm text-nowrap ${
                index === currentRoomIndex
                  ? 'btn-primary'
                  : completedRooms.has(room.id)
                  ? 'btn-outline-success'
                  : 'btn-outline-secondary'
              }`}
            >
              {completedRooms.has(room.id) && '✓ '}
              {room.name}
            </button>
          ))}
        </div>
        
        {/* Inspection items */}
        <div className="vstack gap-3">
          {categories.map((category) => (
            <ItemInspection
              key={category.id}
              category={category.name}
              description={category.description}
              reportId={reportId}
              itemId={category.id}
              value={roomData[category.id]}
              onChange={(value) => handleItemChange(category.id, value)}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="mt-4">
          <div className="d-flex justify-content-center gap-3">
            <button
              onClick={handleAddAnotherRoom}
              disabled={saving}
              className="btn btn-outline-primary"
              style={{borderColor: '#0c0e43', color: '#0c0e43'}}
            >
              {saving ? (
                <span className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{color: '#0c0e43'}}></div>
                  Saving...
                </span>
              ) : (
                '+ Add Another Room'
              )}
            </button>
            
            <button
              onClick={handleViewReport}
              disabled={saving}
              className="btn"
              style={{backgroundColor: '#88cb11', borderColor: '#88cb11', color: 'white'}}
            >
              {saving ? (
                <span className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm text-light me-2" role="status"></div>
                  Saving...
                </span>
              ) : (
                '📄 View Report'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-4">
              <h2 className="h4 fw-bold mb-3">Add More Rooms</h2>
            <RoomSelector
              selectedRooms={[]}
              onRoomsChange={() => {}}
              onNext={() => {}}
              onRoomAdded={async (room) => {
                try {
                  // Create the room in the database
                  const createdRoom = await reportsService.createRoom(reportId!, room.name, room.type)
                  
                  // Add to rooms state
                  const newRooms = [...rooms, createdRoom]
                  setRooms(newRooms)
                  
                  // Navigate to the new room
                  setCurrentRoomIndex(newRooms.length - 1)
                  setShowAddRoom(false)
                } catch (error) {
                  console.error('Error adding room:', error)
                  showError('Failed to add room. Please try again.')
                }
              }}
            />
              <button
                onClick={() => setShowAddRoom(false)}
                className="btn btn-outline-secondary mt-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}