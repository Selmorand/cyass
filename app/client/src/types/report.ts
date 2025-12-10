import type { BaseEntity, ConditionState, RoomType } from './common'

export interface InspectionCategory {
  id: string
  name: string
  description?: string
}

export interface InspectionItem {
  id: string
  category_id: string
  condition: ConditionState
  notes?: string
  photos: string[]
  created_at: string
}

export interface Room {
  id: string
  name: string
  type: RoomType
  items: InspectionItem[]
  video_url?: string          // Optional room walkthrough video
  video_duration?: number      // Duration in seconds (max 120)
  video_size?: number          // File size in bytes (max 50MB)
}

export interface Report extends BaseEntity {
  property_id: string
  title: string
  rooms: Room[]
  status: 'draft' | 'completed' | 'finalized' | 'paid'
  pdf_url?: string
  payment_reference?: string
  generated_at?: string
  finalized_at?: string
}

export interface CreateReportInput {
  property_id: string
  title: string
}

export interface UpdateReportInput {
  title?: string
  rooms?: Room[]
  status?: 'draft' | 'completed' | 'finalized' | 'paid'
  pdf_url?: string
  payment_reference?: string
  finalized_at?: string
}

export interface InspectionItemInput {
  category_id: string
  condition: ConditionState
  notes?: string
  photos?: File[]
}

export interface RoomTemplate {
  type: RoomType
  defaultCategories: InspectionCategory[]
}

export const DEFAULT_INSPECTION_CATEGORIES: Record<RoomType, InspectionCategory[]> = {
  Standard: [
    { id: 'walls', name: 'Walls', description: 'Wall condition, paint, cracks' },
    { id: 'windows', name: 'Windows', description: 'Window frames, glass, locks' },
    { id: 'floors', name: 'Carpets/Floors', description: 'Floor covering condition' },
    { id: 'doors', name: 'Doors', description: 'Door condition, handles, locks' },
    { id: 'ceiling', name: 'Ceiling', description: 'Ceiling condition, paint, cracks' },
    { id: 'lighting', name: 'Light Fittings', description: 'Light switches and fittings' },
    { id: 'power', name: 'Power Points', description: 'Electrical outlets condition' }
  ],
  Bathroom: [
    { id: 'walls', name: 'Walls', description: 'Wall tiles, paint, waterproofing' },
    { id: 'floors', name: 'Floors', description: 'Floor tiles, waterproofing' },
    { id: 'basin', name: 'Basin', description: 'Hand basin condition' },
    { id: 'toilet', name: 'Toilet', description: 'Toilet condition and function' },
    { id: 'shower', name: 'Shower/Bath', description: 'Shower or bath condition' },
    { id: 'taps', name: 'Taps/Plumbing', description: 'Water pressure, leaks' },
    { id: 'ventilation', name: 'Ventilation', description: 'Exhaust fan, windows' },
    { id: 'lighting', name: 'Light Fittings', description: 'Bathroom lighting' }
  ],
  Kitchen: [
    { id: 'walls', name: 'Walls', description: 'Wall tiles, backsplash, paint' },
    { id: 'windows', name: 'Windows', description: 'Window frames, glass, locks' },
    { id: 'floors', name: 'Floors', description: 'Floor covering condition' },
    { id: 'cabinets', name: 'Cabinets', description: 'Kitchen cabinets condition' },
    { id: 'counters', name: 'Countertops', description: 'Counter surface condition' },
    { id: 'sink', name: 'Sink', description: 'Kitchen sink condition' },
    { id: 'appliances', name: 'Appliances', description: 'Built-in appliances' },
    { id: 'plumbing', name: 'Plumbing', description: 'Water pressure, leaks' },
    { id: 'lighting', name: 'Light Fittings', description: 'Kitchen lighting' },
    { id: 'power', name: 'Electrical Points', description: 'Power outlets, switches condition' }
  ],
  Patio: [
    { id: 'surface', name: 'Surface', description: 'Patio surface condition' },
    { id: 'railings', name: 'Railings', description: 'Safety railings condition' },
    { id: 'roofing', name: 'Roofing/Cover', description: 'Overhead covering' },
    { id: 'drainage', name: 'Drainage', description: 'Water drainage systems' },
    { id: 'lighting', name: 'Lighting', description: 'Outdoor lighting fixtures' }
  ],
  Outbuilding: [
    { id: 'structure', name: 'Structure', description: 'Building structural integrity' },
    { id: 'roofing', name: 'Roofing', description: 'Roof condition, leaks' },
    { id: 'walls', name: 'Walls', description: 'External and internal walls' },
    { id: 'doors', name: 'Doors/Windows', description: 'Access points condition' },
    { id: 'flooring', name: 'Flooring', description: 'Floor surface condition' },
    { id: 'electrical', name: 'Electrical', description: 'Power points, lighting, wiring' },
    { id: 'other', name: 'Other', description: 'Any additional items or features' }
  ],
  Exterior: [
    { id: 'roof', name: 'Roof', description: 'Main roof condition' },
    { id: 'gutters', name: 'Gutters', description: 'Gutter system condition' },
    { id: 'walls', name: 'External Walls', description: 'Outside wall condition' },
    { id: 'garden', name: 'Garden/Lawn', description: 'Landscaping condition' },
    { id: 'driveway', name: 'Driveway', description: 'Driveway surface condition' },
    { id: 'fencing', name: 'Fencing', description: 'Boundary fencing condition' },
    { id: 'security', name: 'Security Features', description: 'Gates, alarms, etc.' }
  ],
  SpecialFeatures: [
    { id: 'solar', name: 'Solar Power System', description: 'Solar panels, inverters, batteries' },
    { id: 'generator', name: 'Backup Power', description: 'Generator, UPS systems, changeover switches' },
    { id: 'water', name: 'Water Systems', description: 'Borehole, JoJo tanks, pumps, filtration' },
    { id: 'irrigation', name: 'Irrigation System', description: 'Garden sprinklers, drip lines, controllers' },
    { id: 'pool', name: 'Pool & Equipment', description: 'Pool condition, pump, filter, heating' },
    { id: 'security_systems', name: 'Security Systems', description: 'Alarms, cameras, electric fence, beams' },
    { id: 'aircon', name: 'Air Conditioning', description: 'Central or split units, ducting' },
    { id: 'gas', name: 'Gas Installations', description: 'Gas stove connections, gas geyser, bottles' },
    { id: 'smart_home', name: 'Smart Home Features', description: 'Automation, smart devices, connectivity' },
    { id: 'other_special', name: 'Other Special Features', description: 'Any additional unique features' }
  ]
}