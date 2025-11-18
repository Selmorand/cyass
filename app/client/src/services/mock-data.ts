import type { Property, Report, User, Room, InspectionItem } from '../types'
import { generateUUID } from '../utils/uuid'

// Mock data storage
export const mockStorage = {
  users: new Map<string, User>(),
  properties: new Map<string, Property>(),
  reports: new Map<string, Report>(),
  rooms: new Map<string, Room>(),
  inspectionItems: new Map<string, InspectionItem>()
}

// Mock user for testing
export const mockUser: User = {
  id: generateUUID(),
  email: 'test@cyass.co.za',
  role: 'tenant',
  created_at: new Date().toISOString()
}

// Initialize with mock user
mockStorage.users.set(mockUser.id, mockUser)

// Mock property for testing
export const mockProperty: Property = {
  id: generateUUID(),
  user_id: mockUser.id,
  name: 'Demo Property',
  property_type: 'Flat',
  unit_number: '12B',
  complex_name: 'Sandton Views',
  estate_name: undefined,
  address: {
    street_number: '123',
    street_name: 'Main Street',
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'Gauteng',
    postal_code: '2196'
  },
  gps_coordinates: {
    latitude: -26.1076,
    longitude: 28.0567,
    accuracy: 10,
    timestamp: new Date().toISOString()
  },
  user_role: 'tenant',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

mockStorage.properties.set(mockProperty.id, mockProperty)