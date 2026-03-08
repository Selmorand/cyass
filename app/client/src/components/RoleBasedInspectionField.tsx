import { useState, useRef, useEffect } from 'react'
import { CONDITION_COLORS } from '../types'
import type { ConditionState } from '../types'
import type { InspectionInput } from '../types/role-inspections'
import { storageService, thumbnailCache } from '../services/storage'
import { useNotification } from '../contexts/NotificationContext'
import { queueUpload, processQueue, getPendingCount, onUploadComplete } from '../services/upload-queue'

interface RoleBasedInspectionFieldProps {
  input: InspectionInput
  value: any
  onChange: (value: any) => void
  reportId: string
  itemId: string
  /** Other field values in the same category - for conditional logic */
  siblingValues?: Record<string, any>
}

/**
 * RoleBasedInspectionField
 *
 * Renders the appropriate input control based on the input type from role-inspections.ts
 * Supports: text, textarea, dropdown, checkbox, number, photo-multi, video
 */
export default function RoleBasedInspectionField({
  input,
  value,
  onChange,
  reportId,
  itemId,
  siblingValues = {}
}: RoleBasedInspectionFieldProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showField, setShowField] = useState(true)
  const [pendingUploads, setPendingUploads] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showError, showSuccess, showWarning } = useNotification()

  // Keep a ref to the latest value/onChange so async callbacks never use stale data
  const valueRef = useRef(value)
  const onChangeRef = useRef(onChange)
  useEffect(() => { valueRef.current = value }, [value])
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Detect if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Process upload queue on mount
  useEffect(() => {
    getPendingCount().then(setPendingUploads)
    processQueue()

    const unsubscribe = onUploadComplete((completedItemId, photoUrl) => {
      if (completedItemId === `${itemId}_${input.id}`) {
        const currentPhotos = Array.isArray(valueRef.current) ? valueRef.current : []
        const pendingIndex = currentPhotos.findIndex((p: string) => p.startsWith('pending:'))
        if (pendingIndex >= 0) {
          const updated = [...currentPhotos]
          updated[pendingIndex] = photoUrl
          onChangeRef.current(updated)
        } else {
          onChangeRef.current([...currentPhotos, photoUrl])
        }
        getPendingCount().then(setPendingUploads)
      }
    })

    return unsubscribe
  }, [itemId, input.id])

  // Check if this field should be conditionally hidden
  // e.g., solar_condition should only show if solar_present is true
  const shouldShowField = () => {
    // Pattern: if field ends with _condition or _photos and there's a matching _present field
    if (input.id.endsWith('_condition') || input.id.endsWith('_photos')) {
      const baseId = input.id.replace(/_condition$|_photos$/, '')
      const presentFieldId = `${baseId}_present`
      if (siblingValues[presentFieldId] !== undefined) {
        return siblingValues[presentFieldId] === true
      }
    }
    return true
  }

  if (!shouldShowField()) {
    return null
  }

  // Check if condition-based field needs a comment (Fair/Poor/Urgent Repair require notes)
  const isConditionField = input.type === 'dropdown' && input.options?.includes('Good')
  const needsNotes = isConditionField && value && value !== 'Good' && value !== 'N/A'

  /**
   * Upload image to storage
   */
  const uploadImage = async (file: File): Promise<string> => {
    const compressedFile = await storageService.compressImage(file)
    const thumbnail = await storageService.generateThumbnail(compressedFile)
    const compositeItemId = `${itemId}_${input.id}`

    try {
      const photoUrl = await storageService.uploadPhoto(compressedFile, reportId, compositeItemId)
      if (thumbnail) {
        thumbnailCache.set(photoUrl, thumbnail)
      }
      return photoUrl
    } catch (uploadError) {
      console.warn('Upload failed, queueing for retry:', uploadError)
      await queueUpload(compressedFile, reportId, compositeItemId, thumbnail)
      setPendingUploads(prev => prev + 1)
      showWarning('Photo saved offline — will upload when connected')

      const pendingId = `pending:${Date.now()}`
      if (thumbnail) {
        thumbnailCache.set(pendingId, thumbnail)
      }
      return pendingId
    }
  }

  /**
   * Handle camera/file input click
   */
  const handlePhotoClick = () => {
    if (isMobile && fileInputRef.current) {
      // Create dynamic input for mobile camera
      const newInput = document.createElement('input')
      newInput.type = 'file'
      newInput.accept = 'image/*'
      newInput.capture = 'environment'
      newInput.style.display = 'none'

      newInput.onchange = async (e: any) => {
        const file = e.target.files?.[0]
        if (!file) {
          document.body.removeChild(newInput)
          return
        }

        setIsProcessing(true)
        try {
          const photoUrl = await uploadImage(file)
          const currentPhotos = Array.isArray(valueRef.current) ? valueRef.current : []
          onChangeRef.current([...currentPhotos, photoUrl])
          if (!photoUrl.startsWith('pending:')) {
            showSuccess('Photo added')
          }
        } catch (error) {
          showError('Failed to upload photo')
        } finally {
          setIsProcessing(false)
          document.body.removeChild(newInput)
        }
      }

      document.body.appendChild(newInput)
      newInput.click()
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      const photoUrl = await uploadImage(file)
      const currentPhotos = Array.isArray(valueRef.current) ? valueRef.current : []
      onChangeRef.current([...currentPhotos, photoUrl])
      if (!photoUrl.startsWith('pending:')) {
        showSuccess('Photo added')
      }
    } catch (error) {
      showError('Failed to upload photo')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = (index: number) => {
    const photos = Array.isArray(value) ? value : []
    onChange(photos.filter((_, i) => i !== index))
  }

  // Render based on input type
  const renderInput = () => {
    switch (input.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={input.placeholder}
            maxLength={input.maxLength}
            className="form-control"
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={input.placeholder}
            maxLength={input.maxLength}
            className="form-control"
            rows={3}
          />
        )

      case 'dropdown':
        // Special handling for condition dropdowns
        if (input.options?.includes('Good')) {
          return (
            <div className="d-flex flex-wrap gap-2">
              {input.options.map((option) => {
                const isCondition = ['Good', 'Fair', 'Poor', 'Urgent Repair', 'N/A'].includes(option)
                const color = isCondition ? CONDITION_COLORS[option as ConditionState] : undefined
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`btn btn-sm fw-medium ${
                      value === option ? 'text-white' : 'btn-outline-secondary'
                    }`}
                    style={{
                      backgroundColor: value === option ? color : undefined,
                      borderColor: value === option ? color : undefined
                    }}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )
        }
        // Regular dropdown
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select...</option>
            {input.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="form-check">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              className="form-check-input"
              id={input.id}
            />
            <label className="form-check-label" htmlFor={input.id}>
              Yes
            </label>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={input.placeholder}
            min={input.min}
            max={input.max}
            className="form-control"
            style={{ maxWidth: '200px' }}
          />
        )

      case 'photo-multi':
        const photos = Array.isArray(value) ? value : []
        return (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              {...(isMobile ? { capture: "environment" } : {})}
              onChange={handleFileChange}
              className="d-none"
            />

            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={isProcessing}
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
            >
              <span>📷</span>
              <span>{isProcessing ? 'Uploading...' : `Add Photo (${photos.length})`}</span>
            </button>

            {photos.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {photos.map((photo: string, idx: number) => (
                  <div key={idx} className="position-relative">
                    <img
                      src={thumbnailCache.get(photo) || photo}
                      alt={`Photo ${idx + 1}`}
                      loading="lazy"
                      className="rounded"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        border: '2px solid #dee2e6',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(photo, '_blank')}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="position-absolute top-0 end-0 bg-danger text-white rounded-circle border-0"
                      style={{
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        lineHeight: '1',
                        padding: '0',
                        margin: '2px'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isProcessing && (
              <div className="mt-2">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
                <small className="ms-2 text-muted">Processing...</small>
              </div>
            )}
          </div>
        )

      case 'video':
        // Video is handled at room level by VideoRecorder component
        return (
          <div className="text-muted small">
            Video recording is available at the room level above
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-control"
          />
        )
    }
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-medium">
        {input.label}
      </label>

      {input.description && (
        <p className="small text-muted mb-2">{input.description}</p>
      )}

      {renderInput()}

      {/* Warning: notes required for Fair/Poor/Urgent Repair conditions */}
      {needsNotes && (
        <div className="alert alert-warning py-2 mt-2 mb-0">
          <small>⚠️ Please add notes explaining the {value} condition</small>
        </div>
      )}
    </div>
  )
}
