import { useState } from 'react'
import type { RoomType } from '../types'
import { generateUUID } from '../utils/uuid'

interface Room {
  id: string
  name: string
  type: RoomType
}

interface RoomSelectorProps {
  selectedRooms: Room[]
  onRoomsChange: (rooms: Room[]) => void
  onNext: () => void
  onRoomAdded?: (room: Room) => void
}

const ROOM_TYPES_CONFIG = [
  { 
    type: 'Standard' as const, 
    label: 'Standard Room', 
    icon: '🛏️',
    description: 'Bedrooms, living rooms, dining rooms',
    tip: 'e.g., Bedroom 1, Lounge, Dining room'
  },
  { 
    type: 'Kitchen' as const, 
    label: 'Kitchen', 
    icon: '🍳',
    description: 'Kitchen areas and sculleries',
    tip: 'e.g., Main kitchen, Outdoor kitchen, Scullery'
  },
  { 
    type: 'Bathroom' as const, 
    label: 'Bathroom', 
    icon: '🛁',
    description: 'Bathrooms, toilets, en-suites',
    tip: 'e.g., En suite, Downstairs, Guest'
  },
  { 
    type: 'Patio' as const, 
    label: 'Patio/Balcony', 
    icon: '🏡',
    description: 'Outdoor covered areas',
    tip: 'e.g., Lapa, Front patio, Stoep'
  },
  { 
    type: 'Outbuilding' as const, 
    label: 'Outbuilding', 
    icon: '🏠',
    description: 'Garages, storage, staff quarters',
    tip: 'e.g., Garage, Shed, Wendy house'
  },
  { 
    type: 'Exterior' as const, 
    label: 'Exterior', 
    icon: '🌳',
    description: 'Gardens, driveways, external features',
    tip: 'e.g., Front, Back, Cottage'
  },
  { 
    type: 'SpecialFeatures' as const, 
    label: 'Special Features', 
    icon: '⚡',
    description: 'Solar, generator, pool, irrigation, smart home',
    tip: 'e.g., Solar system, Pool area, Security system'
  }
]

export default function RoomSelector({ selectedRooms, onRoomsChange, onNext, onRoomAdded }: RoomSelectorProps) {
  const [expandedType, setExpandedType] = useState<RoomType | null>(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [selectedType, setSelectedType] = useState<RoomType>('Standard')

  const addRoom = (type: RoomType, customName?: string) => {
    const typeConfig = ROOM_TYPES_CONFIG.find(config => config.type === type)
    const defaultName = typeConfig?.label || type
    
    const newRoom: Room = {
      id: generateUUID(),
      name: customName || defaultName,
      type
    }

    setNewRoomName('')
    
    // Immediately trigger report creation after adding a room
    if (onRoomAdded) {
      onRoomAdded(newRoom)
    } else {
      // Fallback: update rooms and call onNext
      onRoomsChange([...selectedRooms, newRoom])
      setTimeout(() => onNext(), 100)
    }
  }

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="h3 fw-bold text-dark mb-2">Select Rooms to Inspect</h2>
        <p className="text-muted">Choose the areas you want to include in your condition report</p>
      </div>

      {/* Room Type Selection */}
      <div className="row g-3">
        {ROOM_TYPES_CONFIG.map((config) => (
          <div key={config.type} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-2">
              <button
                onClick={() => setExpandedType(expandedType === config.type ? null : config.type)}
                className="btn btn-link text-start text-decoration-none p-0 w-100 h-100"
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <span className="fs-2 me-3">{config.icon}</span>
                    <div>
                      <h3 className="fw-medium text-dark mb-1">{config.label}</h3>
                      <p className="small text-muted mb-0">{config.description}</p>
                      {expandedType !== config.type && (
                        <p className="small text-info mt-1 mb-0">Click to add room</p>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {expandedType === config.type && (
                <div className="border-top p-3">
                  <div className="mb-3">
                    <div className="alert alert-info py-2 mb-3">
                      <span className="small">💡 <strong>Tip:</strong> {config.tip}</span>
                    </div>
                  </div>

                  {config.type === 'SpecialFeatures' ? (
                    // Special Features - no name input needed
                    <div className="d-grid">
                      <button
                        onClick={() => addRoom(config.type, 'Special Features')}
                        className="btn btn-primary"
                        style={{backgroundColor: '#0c0e43', borderColor: '#0c0e43'}}
                      >
                        Add Special Features Section
                      </button>
                    </div>
                  ) : (
                    // All other room types - require name input
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter room name"
                        value={selectedType === config.type ? newRoomName : ''}
                        onChange={(e) => {
                          setSelectedType(config.type)
                          setNewRoomName(e.target.value)
                        }}
                        className="form-control form-control-sm"
                      />
                      <button
                        onClick={() => addRoom(config.type, newRoomName || undefined)}
                        className="btn btn-primary btn-sm px-3"
                        style={{backgroundColor: '#0c0e43', borderColor: '#0c0e43'}}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRooms.length === 0 && (
        <div className="text-center py-5 mt-4">
          <div className="mx-auto mb-3 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '4rem', height: '4rem'}}>
            <span className="fs-2">🏠</span>
          </div>
          <h3 className="h5 fw-medium text-dark mb-2">No Rooms Selected</h3>
          <p className="text-muted">Choose room types above to start your inspection</p>
        </div>
      )}
    </div>
  )
}