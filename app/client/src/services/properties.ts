import { supabase } from './supabase'
import type { Property, CreatePropertyInput, UpdatePropertyInput, GPSCoordinates, PropertyAddress } from '../types'
import { logActivity } from './activity'

export const propertiesService = {
  async createProperty(input: CreatePropertyInput): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('properties')
      .insert({
        user_id: user.id,
        name: input.name,
        property_type: input.property_type,
        unit_number: input.unit_number || null,
        complex_name: input.complex_name || null,
        estate_name: input.estate_name || null,
        street_number: input.address.street_number || null,
        street_name: input.address.street_name,
        suburb: input.address.suburb,
        city: input.address.city,
        province: input.address.province,
        postal_code: input.address.postal_code,
        latitude: input.gps_coordinates.latitude,
        longitude: input.gps_coordinates.longitude,
        gps_accuracy: input.gps_coordinates.accuracy || null,
        gps_timestamp: input.gps_coordinates.timestamp,
        user_role: input.user_role,
        description: null
      })
      .select()
      .single()

    if (error) throw error

    // Log property creation activity
    logActivity('property_created', {
      property_id: data.id,
      name: input.name,
      property_type: input.property_type,
      gps_accuracy: input.gps_coordinates.accuracy
    })

    return this.mapDatabaseRowToProperty(data)
  },

  async getProperties(): Promise<Property[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Phase 5: Select only essential fields for faster loading
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, property_type, unit_number, complex_name, estate_name, street_name, suburb, city, province, created_at, updated_at, user_id, street_number, postal_code, latitude, longitude, gps_accuracy, gps_timestamp, user_role, description, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(50) // Limit for performance

    if (error) throw error

    return data.map(this.mapDatabaseRowToProperty)
  },

  async getProperty(id: string): Promise<Property | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('properties')
      .select()
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapDatabaseRowToProperty(data)
  },

  async getPublicProperty(id: string): Promise<Property | null> {
    // Public property access - no user authentication required
    const { data, error } = await supabase
      .from('properties')
      .select()
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapDatabaseRowToProperty(data)
  },

  async updateProperty(id: string, input: UpdatePropertyInput): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (input.name !== undefined) updateData.name = input.name
    if (input.user_role !== undefined) updateData.user_role = input.user_role
    if (input.description !== undefined) updateData.description = input.description
    if (input.is_active !== undefined) updateData.is_active = input.is_active

    if (input.address) {
      if (input.address.street_number !== undefined) updateData.street_number = input.address.street_number
      if (input.address.street_name !== undefined) updateData.street_name = input.address.street_name
      if (input.address.suburb !== undefined) updateData.suburb = input.address.suburb
      if (input.address.city !== undefined) updateData.city = input.address.city
      if (input.address.province !== undefined) updateData.province = input.address.province
      if (input.address.postal_code !== undefined) updateData.postal_code = input.address.postal_code
    }

    if (input.gps_coordinates) {
      updateData.latitude = input.gps_coordinates.latitude
      updateData.longitude = input.gps_coordinates.longitude
      updateData.gps_accuracy = input.gps_coordinates.accuracy || null
      updateData.gps_timestamp = input.gps_coordinates.timestamp
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return this.mapDatabaseRowToProperty(data)
  },

  async deleteProperty(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('properties')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
  },

  mapDatabaseRowToProperty(row: any): Property {
    const address: PropertyAddress = {
      street_number: row.street_number || undefined,
      street_name: row.street_name,
      suburb: row.suburb,
      city: row.city,
      province: row.province,
      postal_code: row.postal_code
    }

    const gps_coordinates: GPSCoordinates = {
      latitude: row.latitude,
      longitude: row.longitude,
      accuracy: row.gps_accuracy || undefined,
      timestamp: row.gps_timestamp
    }

    return {
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_id: row.user_id,
      name: row.name,
      property_type: row.property_type || 'House',
      unit_number: row.unit_number || undefined,
      complex_name: row.complex_name || undefined,
      estate_name: row.estate_name || undefined,
      address,
      gps_coordinates,
      user_role: row.user_role,
      description: row.description || undefined,
      is_active: row.is_active
    }
  }
}

export const createProperty = (input: CreatePropertyInput) => propertiesService.createProperty(input)
export const getProperties = () => propertiesService.getProperties()
export const getProperty = (id: string) => propertiesService.getProperty(id)
export const getPublicProperty = (id: string) => propertiesService.getPublicProperty(id)
export const updateProperty = (id: string, input: UpdatePropertyInput) => propertiesService.updateProperty(id, input)
export const deleteProperty = (id: string) => propertiesService.deleteProperty(id)