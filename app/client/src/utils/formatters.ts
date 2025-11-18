import type { PropertyAddress, GPSCoordinates, UserRole, ConditionState } from '../types'

export function formatAddress(address: PropertyAddress): string {
  const parts = [
    address.street_number,
    address.street_name,
    address.suburb,
    address.city,
    address.province,
    address.postal_code
  ].filter(Boolean)
  
  return parts.join(', ')
}

export function formatShortAddress(address: PropertyAddress): string {
  return `${address.street_name}, ${address.suburb}`
}

export function formatGPSCoordinates(coordinates: GPSCoordinates): string {
  const lat = coordinates.latitude.toFixed(6)
  const lng = coordinates.longitude.toFixed(6)
  const accuracy = coordinates.accuracy ? ` (±${coordinates.accuracy}m)` : ''
  
  return `${lat}, ${lng}${accuracy}`
}

export function formatUserRole(role: UserRole): string {
  const roleMap = {
    tenant: 'Tenant',
    landlord: 'Landlord',
    buyer: 'Buyer', 
    seller: 'Seller',
    agent: 'Agent'
  }
  
  return roleMap[role]
}

export function formatConditionState(condition: ConditionState): string {
  return condition
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString)
  
  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(1)
  
  return `${size} ${sizes[i]}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatPhotoName(originalName: string, index: number): string {
  const extension = originalName.split('.').pop() || 'jpg'
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
  
  return `photo_${index + 1}_${timestamp}.${extension}`
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text
  
  return text.slice(0, maxLength - 3) + '...'
}

export function formatReportTitle(propertyName: string, userRole: UserRole): string {
  const roleFormatted = formatUserRole(userRole)
  const timestamp = new Date().toLocaleDateString('en-ZA')
  
  return `${propertyName} - ${roleFormatted} Report (${timestamp})`
}

export function generatePDFFilename(propertyName: string, userRole: UserRole): string {
  const sanitizedName = propertyName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 30)
  
  const role = userRole.toLowerCase()
  const timestamp = new Date().toISOString().slice(0, 10)
  
  return `cyass_${sanitizedName}_${role}_${timestamp}.pdf`
}

export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0]
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n')
}

export function formatLocationAccuracy(accuracy?: number): {
  text: string
  color: string
  icon: '🎯' | '📍' | '📌' | '❓'
} {
  if (!accuracy) {
    return {
      text: 'Unknown accuracy',
      color: '#777777',
      icon: '❓'
    }
  }
  
  if (accuracy <= 5) {
    return {
      text: `Excellent (±${accuracy}m)`,
      color: '#277020',
      icon: '🎯'
    }
  }
  
  if (accuracy <= 10) {
    return {
      text: `Good (±${accuracy}m)`,
      color: '#f5a409',
      icon: '📍'
    }
  }
  
  if (accuracy <= 50) {
    return {
      text: `Fair (±${accuracy}m)`,
      color: '#c62121',
      icon: '📌'
    }
  }
  
  return {
    text: `Poor (±${accuracy}m)`,
    color: '#c62121',
    icon: '📌'
  }
}