import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { SA_PROVINCES } from '../types'
import type { CreatePropertyInput, PropertyType } from '../types'

const PROPERTY_TYPES: PropertyType[] = [
  'House',
  'Townhouse',
  'Flat',
  'Cluster',
  'Cottage',
  'Granny Flat',
  'Other'
]

const propertySchema = z.object({
  property_type: z.enum(['House', 'Townhouse', 'Flat', 'Cluster', 'Cottage', 'Granny Flat', 'Other'] as const),
  unit_number: z.string().optional(),
  complex_name: z.string().optional(),
  estate_name: z.string().optional(),
  address: z.object({
    street_number: z.string().optional(),
    street_name: z.string().min(1, 'Street name is required'),
    suburb: z.string().min(1, 'Suburb is required'),
    city: z.string().min(1, 'City is required'),
    province: z.enum(SA_PROVINCES as readonly [string, ...string[]]),
    postal_code: z.string().regex(/^\d{4}$/, 'Postal code must be 4 digits')
  })
})

type PropertyFormData = z.infer<typeof propertySchema>

interface PropertyFormProps {
  onSubmit: (data: CreatePropertyInput) => Promise<void>
  submitting: boolean
  hasGPS: boolean
}

export default function PropertyForm({ onSubmit, submitting, hasGPS }: PropertyFormProps) {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      property_type: 'House' as PropertyType,
      unit_number: '',
      complex_name: '',
      estate_name: '',
      address: {
        street_number: '',
        street_name: '',
        suburb: '',
        city: '',
        province: 'Gauteng',
        postal_code: ''
      }
    }
  })

  const handleFormSubmit = async (data: PropertyFormData) => {
    // Generate a name from the address/unit details
    let generatedName = ''
    if (data.unit_number) {
      generatedName = `Unit ${data.unit_number}`
      if (data.complex_name) {
        generatedName += `, ${data.complex_name}`
      }
    } else if (data.address.street_number && data.address.street_name) {
      generatedName = `${data.address.street_number} ${data.address.street_name}`
    } else if (data.address.street_name) {
      generatedName = data.address.street_name
    } else {
      generatedName = `${data.property_type} in ${data.address.suburb}`
    }
    
    const propertyInput: CreatePropertyInput = {
      ...data,
      name: generatedName,
      user_role: user?.role || 'tenant',
      gps_coordinates: {
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString()
      }
    }
    await onSubmit(propertyInput)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Property Type */}
      <div className="mb-3">
        <label htmlFor="property_type" className="form-label fw-medium">
          Property Type *
        </label>
        <select
          id="property_type"
          {...register('property_type')}
          className="form-select"
        >
          {PROPERTY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.property_type && (
          <div className="invalid-feedback d-block">{errors.property_type.message}</div>
        )}
      </div>

      {/* Unit/Complex/Estate Details */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label htmlFor="unit_number" className="form-label">
            Unit Number
          </label>
          <input
            id="unit_number"
            type="text"
            {...register('unit_number')}
            className="form-control"
            placeholder="e.g., 12A, Unit 5"
          />
        </div>
        
        <div className="col-md-4">
          <label htmlFor="complex_name" className="form-label">
            Complex/Block Name
          </label>
          <input
            id="complex_name"
            type="text"
            {...register('complex_name')}
            className="form-control"
            placeholder="e.g., Sunset Gardens"
          />
        </div>
        
        <div className="col-md-4">
          <label htmlFor="estate_name" className="form-label">
            Estate Name
          </label>
          <input
            id="estate_name"
            type="text"
            {...register('estate_name')}
            className="form-control"
            placeholder="e.g., Silver Lakes"
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="border-top pt-4 mb-4">
        <h5 className="fw-medium mb-3">📍 Property Address</h5>
        
        <div className="row g-3">
          {/* Street Number */}
          <div className="col-md-6">
            <label htmlFor="street_number" className="form-label">
              Street Number
            </label>
            <input
              id="street_number"
              type="text"
              {...register('address.street_number')}
              className={`form-control ${errors.address?.street_number ? 'is-invalid' : ''}`}
              placeholder="123"
            />
            {errors.address?.street_number && (
              <div className="invalid-feedback">{errors.address.street_number.message}</div>
            )}
          </div>

          {/* Street Name */}
          <div className="col-md-6">
            <label htmlFor="street_name" className="form-label">
              Street Name *
            </label>
            <input
              id="street_name"
              type="text"
              {...register('address.street_name')}
              className={`form-control ${errors.address?.street_name ? 'is-invalid' : ''}`}
              placeholder="Main Street"
            />
            {errors.address?.street_name && (
              <div className="invalid-feedback">{errors.address.street_name.message}</div>
            )}
          </div>

          {/* Suburb */}
          <div className="col-md-6">
            <label htmlFor="suburb" className="form-label">
              Suburb *
            </label>
            <input
              id="suburb"
              type="text"
              {...register('address.suburb')}
              className={`form-control ${errors.address?.suburb ? 'is-invalid' : ''}`}
              placeholder="Rosebank"
            />
            {errors.address?.suburb && (
              <div className="invalid-feedback">{errors.address.suburb.message}</div>
            )}
          </div>

          {/* City */}
          <div className="col-md-6">
            <label htmlFor="city" className="form-label">
              City *
            </label>
            <input
              id="city"
              type="text"
              {...register('address.city')}
              className={`form-control ${errors.address?.city ? 'is-invalid' : ''}`}
              placeholder="Johannesburg"
            />
            {errors.address?.city && (
              <div className="invalid-feedback">{errors.address.city.message}</div>
            )}
          </div>

          {/* Province */}
          <div className="col-md-6">
            <label htmlFor="province" className="form-label">
              Province *
            </label>
            <select
              id="province"
              {...register('address.province')}
              className={`form-select ${errors.address?.province ? 'is-invalid' : ''}`}
            >
              {SA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.address?.province && (
              <div className="invalid-feedback">{errors.address.province.message}</div>
            )}
          </div>

          {/* Postal Code */}
          <div className="col-md-6">
            <label htmlFor="postal_code" className="form-label">
              Postal Code *
            </label>
            <input
              id="postal_code"
              type="text"
              {...register('address.postal_code')}
              className={`form-control ${errors.address?.postal_code ? 'is-invalid' : ''}`}
              placeholder="2196"
              maxLength={4}
            />
            {errors.address?.postal_code && (
              <div className="invalid-feedback">{errors.address.postal_code.message}</div>
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="d-flex justify-content-between align-items-center pt-4 border-top">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-outline-secondary"
        >
          Cancel
        </button>
        
        <div className="d-flex align-items-center gap-3">
          {!hasGPS && (
            <span className="text-danger small">📍 GPS required before saving</span>
          )}
          <button
            type="submit"
            disabled={submitting || !hasGPS}
            className="btn btn-primary d-flex align-items-center"
            style={{backgroundColor: '#0c0e43', borderColor: '#0c0e43'}}
          >
            {submitting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Creating...</span>
                </div>
                Creating...
              </>
            ) : (
              <>💾 Save Property</>
            )}
          </button>
        </div>
      </div>

    </form>
  )
}