import type { BaseEntity, GPSCoordinates, UserRole } from './common'

export type PropertyType = 
  | 'House' 
  | 'Townhouse' 
  | 'Flat'
  | 'Cluster'
  | 'Cottage'
  | 'Granny Flat'
  | 'Other'

export interface PropertyAddress {
  street_number?: string
  street_name: string
  suburb: string
  city: string
  province: string
  postal_code: string
}

export interface Property extends BaseEntity {
  name: string
  property_type: PropertyType
  unit_number?: string
  complex_name?: string
  estate_name?: string
  address: PropertyAddress
  gps_coordinates: GPSCoordinates
  user_role: UserRole
  description?: string
  is_active: boolean
}

export interface CreatePropertyInput {
  name: string
  property_type: PropertyType
  unit_number?: string
  complex_name?: string
  estate_name?: string
  address: PropertyAddress
  gps_coordinates: GPSCoordinates
  user_role: UserRole
  description?: string
}

export interface UpdatePropertyInput {
  name?: string
  property_type?: PropertyType
  unit_number?: string
  complex_name?: string
  estate_name?: string
  address?: Partial<PropertyAddress>
  gps_coordinates?: GPSCoordinates
  user_role?: UserRole
  description?: string
  is_active?: boolean
}