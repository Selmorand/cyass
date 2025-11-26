export type UserRole = 'tenant' | 'landlord' | 'buyer' | 'seller' | 'agent' | 'contractor'

export type ConditionState = 'Good' | 'Fair' | 'Poor' | 'Urgent Repair' | 'N/A'

export type RoomType = 'Standard' | 'Bathroom' | 'Kitchen' | 'Patio' | 'Outbuilding' | 'Exterior' | 'SpecialFeatures'

export const CONDITION_COLORS = {
  Good: '#277020',
  Fair: '#f5a409', 
  Poor: '#c62121',
  'Urgent Repair': '#c62121',
  'N/A': '#777777'
} as const

export const SA_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
] as const

export const USER_ROLES = [
  { value: 'tenant' as const, label: 'Tenant' },
  { value: 'landlord' as const, label: 'Landlord' },
  { value: 'buyer' as const, label: 'Buyer' },
  { value: 'seller' as const, label: 'Seller' },
  { value: 'agent' as const, label: 'Real Estate Agent' },
  { value: 'contractor' as const, label: 'Contractor' }
] as const

export const CONDITION_STATES = [
  { value: 'Good' as const, label: 'Good', color: CONDITION_COLORS.Good },
  { value: 'Fair' as const, label: 'Fair', color: CONDITION_COLORS.Fair },
  { value: 'Poor' as const, label: 'Poor', color: CONDITION_COLORS.Poor },
  { value: 'Urgent Repair' as const, label: 'Urgent Repair', color: CONDITION_COLORS['Urgent Repair'] },
  { value: 'N/A' as const, label: 'Not Applicable', color: CONDITION_COLORS['N/A'] }
] as const

export interface GPSCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp: string
}

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  user_id: string
}