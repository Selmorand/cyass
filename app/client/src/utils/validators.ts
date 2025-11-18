import { z } from 'zod'
import { SA_PROVINCES } from './constants'
import type { InspectionItem, PropertyAddress, GPSCoordinates } from '../types'

export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const userRoleSchema = z.enum(['tenant', 'landlord', 'buyer', 'seller', 'agent'])

export const conditionStateSchema = z.enum(['Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A'])

export const roomTypeSchema = z.enum(['Standard', 'Bathroom', 'Kitchen', 'Patio', 'Outbuilding', 'Exterior'])

export const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: z.string().datetime()
})

export const propertyAddressSchema = z.object({
  street_number: z.string().optional(),
  street_name: z.string().min(1, 'Street name is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  city: z.string().min(1, 'City is required'),
  province: z.enum(SA_PROVINCES as any),
  postal_code: z.string()
    .regex(/^\d{4}$/, 'Postal code must be 4 digits')
})

export const createPropertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(100, 'Property name too long'),
  address: propertyAddressSchema,
  gps_coordinates: gpsCoordinatesSchema,
  user_role: userRoleSchema,
  description: z.string().max(500, 'Description too long').optional()
})

export const createReportSchema = z.object({
  property_id: z.string().uuid('Invalid property ID'),
  title: z.string().min(1, 'Report title is required').max(100, 'Title too long')
})

export const inspectionItemSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  condition: conditionStateSchema,
  notes: z.string().max(500, 'Notes too long').optional(),
  photos: z.array(z.string().url()).max(10, 'Maximum 10 photos per item')
})

export function validateItem(item: InspectionItem): string[] {
  const errors: string[] = []
  const needsComment = item.condition !== 'Good' && item.condition !== 'N/A'
  
  if (needsComment && !item.notes?.trim()) {
    errors.push('Comment required when condition is not Good or N/A')
  }
  
  if (item.photos.length === 0 && item.condition !== 'N/A') {
    errors.push('At least one photo is required unless condition is N/A')
  }
  
  return errors
}

export function validatePropertyAddress(address: Partial<PropertyAddress>): string[] {
  const result = propertyAddressSchema.safeParse(address)
  
  if (result.success) return []
  
  return result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`)
}

export function validateGPSAccuracy(coordinates: GPSCoordinates): {
  isAccurate: boolean
  accuracy: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown'
  message: string
} {
  if (!coordinates.accuracy) {
    return {
      isAccurate: false,
      accuracy: 'unknown',
      message: 'GPS accuracy not available'
    }
  }

  if (coordinates.accuracy <= 5) {
    return {
      isAccurate: true,
      accuracy: 'excellent',
      message: `Excellent GPS accuracy (±${coordinates.accuracy}m)`
    }
  }

  if (coordinates.accuracy <= 10) {
    return {
      isAccurate: true,
      accuracy: 'good',
      message: `Good GPS accuracy (±${coordinates.accuracy}m)`
    }
  }

  if (coordinates.accuracy <= 50) {
    return {
      isAccurate: false,
      accuracy: 'fair',
      message: `Fair GPS accuracy (±${coordinates.accuracy}m) - consider retrying`
    }
  }

  return {
    isAccurate: false,
    accuracy: 'poor',
    message: `Poor GPS accuracy (±${coordinates.accuracy}m) - retry required`
  }
}

export function validatePhotoFile(file: File): string[] {
  const errors: string[] = []
  
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    errors.push('File must be JPEG, PNG, or WebP format')
  }
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB')
  }
  
  return errors
}

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .slice(0, 500) // Limit length
}

export function validateReportCompleteness(rooms: any[]): {
  isComplete: boolean
  missingItems: string[]
} {
  const missingItems: string[] = []

  if (rooms.length === 0) {
    missingItems.push('At least one room is required')
  }

  rooms.forEach((room, roomIndex) => {
    if (!room.name?.trim()) {
      missingItems.push(`Room ${roomIndex + 1}: Name is required`)
    }

    if (!room.items || room.items.length === 0) {
      missingItems.push(`${room.name || `Room ${roomIndex + 1}`}: No inspection items`)
      return
    }

    room.items.forEach((item: InspectionItem, itemIndex: number) => {
      const itemErrors = validateItem(item)
      itemErrors.forEach(error => {
        missingItems.push(`${room.name} - Item ${itemIndex + 1}: ${error}`)
      })
    })
  })

  return {
    isComplete: missingItems.length === 0,
    missingItems
  }
}