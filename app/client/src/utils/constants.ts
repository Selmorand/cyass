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
  { value: 'tenant', label: 'Tenant' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'agent', label: 'Agent' }
] as const

export const CONDITION_STATES = [
  { value: 'Good', label: 'Good', color: '#277020' },
  { value: 'Fair', label: 'Fair', color: '#f5a409' },
  { value: 'Poor', label: 'Poor', color: '#c62121' },
  { value: 'Urgent Repair', label: 'Urgent Repair', color: '#c62121' },
  { value: 'N/A', label: 'N/A', color: '#777777' }
] as const

export const ROOM_TYPES = [
  { value: 'Standard', label: 'Standard Room' },
  { value: 'Bathroom', label: 'Bathroom' },
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Patio', label: 'Patio/Balcony' },
  { value: 'Outbuilding', label: 'Outbuilding' },
  { value: 'Exterior', label: 'Exterior Areas' }
] as const

export const GPS_ACCURACY_THRESHOLDS = {
  EXCELLENT: 5,   // ≤ 5 meters
  GOOD: 10,       // 6-10 meters
  FAIR: 50,       // 11-50 meters
  POOR: 100       // 51-100 meters
} as const

export const PHOTO_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_PHOTOS_PER_ITEM: 10,
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  COMPRESSION_QUALITY: 0.8,
  MAX_DIMENSION: 1200
} as const

export const LEGAL_DISCLAIMER = `This document reflects the observations of the reporting party only. It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. CYAss provides tooling only and does not certify property condition or statutory compliance.`

export const PDF_CONFIG = {
  WATERMARK_TEXT: 'CYAss SOLO REPORT',
  PHOTOS_PER_ROW: 3,
  PAGE_MARGINS: {
    top: 30,
    bottom: 30,
    left: 30,
    right: 30
  }
} as const

export const PAYMENT_CONFIG = {
  PDF_GENERATION_FEE: 200, // R200
  CURRENCY: 'ZAR',
  MERCHANT_ID: import.meta.env.VITE_PAYFAST_MERCHANT_ID || '',
  MERCHANT_KEY: import.meta.env.VITE_PAYFAST_MERCHANT_KEY || '',
  SANDBOX: import.meta.env.MODE !== 'production'
} as const