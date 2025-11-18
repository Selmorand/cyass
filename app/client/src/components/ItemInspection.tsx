import { useState, useRef } from 'react'
import { CONDITION_COLORS } from '../types'
import type { ConditionState } from '../types'
import { storageService } from '../services/storage'
import { useNotification } from '../contexts/NotificationContext'

interface ItemInspectionProps {
  category: string
  description?: string
  reportId: string
  itemId: string
  value?: {
    condition: ConditionState
    notes?: string
    photos?: string[]
  }
  onChange: (value: { condition: ConditionState; notes?: string; photos?: string[] }) => void
}

const CONDITIONS: ConditionState[] = ['Good', 'Fair', 'Poor', 'Urgent Repair']

export default function ItemInspection({ 
  category, 
  description, 
  reportId,
  itemId,
  value, 
  onChange
}: ItemInspectionProps) {
  const [showNotes, setShowNotes] = useState(!!value?.notes)
  const [isProcessing, setIsProcessing] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const { showError, showSuccess } = useNotification()
  
  // Detect if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  const handleConditionChange = (condition: ConditionState) => {
    onChange({
      ...value,
      condition,
      notes: value?.notes,
      photos: value?.photos || []
    })
    
    // Show notes field if condition requires it
    if (condition !== 'Good') {
      setShowNotes(true)
    }
  }
  
  const handleNotesChange = (notes: string) => {
    onChange({
      ...value!,
      notes,
      photos: value?.photos || []
    })
  }
  
  /**
   * CRITICAL: Upload image to Supabase Storage with comprehensive error handling
   * ⚠️ DO NOT MODIFY without explicit user permission
   * 
   * PROTECTED FEATURES:
   * - Uploads to 'property-photos' bucket (working RLS policies)
   * - Comprehensive error logging for debugging
   * - Image compression before upload
   * - Organized storage path structure
   * 
   * NEVER REVERT to base64 encoding - PDF links require Supabase URLs
   */
  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('Starting photo upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        reportId,
        itemId
      })
      
      // Compress and upload to Supabase Storage
      const compressedFile = await storageService.compressImage(file)
      console.log('Image compressed:', {
        originalSize: file.size,
        compressedSize: compressedFile.size
      })
      
      const photoUrl = await storageService.uploadPhoto(compressedFile, reportId, itemId)
      console.log('Photo uploaded successfully:', photoUrl)
      
      return photoUrl
    } catch (error) {
      console.error('Detailed photo upload error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        reportId,
        itemId,
        fileName: file.name
      })
      throw error
    }
  }
  
  /**
   * CRITICAL: Mobile camera handler with dynamic DOM manipulation
   * ⚠️ DO NOT MODIFY without explicit user permission
   * 
   * PROTECTED FUNCTIONALITY:
   * - Forces mobile camera (not gallery) via capture="environment"
   * - Uses dynamic DOM element creation to bypass React limitations
   * - Mobile device detection prevents desktop issues
   * 
   * NEVER CHANGE: This specific approach is required for mobile camera access
   */
  const handleCameraClick = () => {
    // On mobile, try to force camera by removing and re-adding the input
    if (isMobile && cameraInputRef.current) {
      // Create a new input element with capture attribute
      const newInput = document.createElement('input')
      newInput.type = 'file'
      newInput.accept = 'image/*'
      newInput.capture = 'environment'
      newInput.style.display = 'none'
      
      newInput.onchange = async (e: any) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        setIsProcessing(true)
        try {
          const photoUrl = await uploadImage(file)
          const currentPhotos = value?.photos || []
          onChange({
            ...value!,
            photos: [...currentPhotos, photoUrl]
          })
        } catch (error) {
          console.error('Error processing photo:', error)
          showError('Failed to process photo. Please try again.')
        } finally {
          setIsProcessing(false)
          document.body.removeChild(newInput)
        }
      }
      
      document.body.appendChild(newInput)
      newInput.click()
    } else {
      // Desktop or fallback
      cameraInputRef.current?.click()
    }
  }
  
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsProcessing(true)
    try {
      const photoUrl = await uploadImage(file)
      const currentPhotos = value?.photos || []
      onChange({
        ...value!,
        photos: [...currentPhotos, photoUrl]
      })
    } catch (error) {
      console.error('Error processing photo:', error)
      showError('Failed to process photo. Please try again.')
    } finally {
      setIsProcessing(false)
      // Reset input to allow capturing same photo again if needed
      if (cameraInputRef.current) {
        cameraInputRef.current.value = ''
      }
    }
  }
  
  const removePhoto = (index: number) => {
    const newPhotos = (value?.photos || []).filter((_, i) => i !== index)
    onChange({
      ...value!,
      photos: newPhotos
    })
  }
  
  const needsComment = value?.condition && value.condition !== 'Good'
  const hasComment = !!value?.notes?.trim()
  const isValid = !needsComment || hasComment
  
  return (
    <div className={`card ${!isValid ? 'border-danger bg-danger bg-opacity-10' : 'border-light'} mb-3`}>
      <div className="card-body p-3">
        <div className="mb-3">
          <h4 className="fw-medium text-dark mb-1">{category}</h4>
          {description && (
            <p className="small text-muted mb-0">{description}</p>
          )}
        </div>
        
        {/* Hidden camera input - force camera on mobile */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          {...(isMobile ? { capture: "environment" } : {})}
          onChange={handleCameraCapture}
          className="d-none"
        />
        
        <div className="d-flex flex-wrap gap-2 mb-3">
          {CONDITIONS.map((condition) => (
            <button
              key={condition}
              onClick={() => handleConditionChange(condition)}
              className={`btn btn-sm fw-medium ${
                value?.condition === condition
                  ? 'text-white'
                  : 'btn-outline-secondary'
              }`}
              style={{
                backgroundColor: value?.condition === condition ? CONDITION_COLORS[condition] : undefined,
                borderColor: value?.condition === condition ? CONDITION_COLORS[condition] : undefined
              }}
            >
              {condition}
            </button>
          ))}
        </div>
        
        {needsComment && !hasComment && (
          <div className="alert alert-warning py-2 mb-3">
            <small className="mb-0">⚠️ Comment required for {value?.condition} condition</small>
          </div>
        )}
        
        {(showNotes || needsComment) && (
          <textarea
            value={value?.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={needsComment ? 'Comment required for this condition...' : 'Add notes (optional)...'}
            className={`form-control ${
              needsComment && !hasComment ? 'border-danger' : ''
            }`}
            rows={2}
          />
        )}
        
        {!showNotes && !needsComment && (
          <button
            onClick={() => setShowNotes(true)}
            className="btn btn-link p-0 small"
            style={{color: '#0c0e43'}}
          >
            + Add notes
          </button>
        )}
        
        {/* Camera section - moved to bottom after condition and notes */}
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="fw-medium mb-0 text-muted">📷 Add Photos</h6>
            <button
              onClick={handleCameraClick}
              disabled={isProcessing}
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            >
              <span>📷</span>
              <span>Take Photo ({value?.photos?.length || 0})</span>
            </button>
          </div>
          
          {/* Photo thumbnails */}
          {value?.photos && value.photos.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mt-2">
              {value.photos.map((photo, idx) => (
                <div key={idx} className="position-relative group">
                  <img
                    src={photo}
                    alt={`${category} photo ${idx + 1}`}
                    className="rounded"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      border: '2px solid #dee2e6',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Open full size in new tab
                      const newWindow = window.open()
                      if (newWindow) {
                        newWindow.document.write(`<img src="${photo}" style="max-width:100%; height:auto;" />`)
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removePhoto(idx)
                    }}
                    className="position-absolute top-0 end-0 bg-danger text-white rounded-circle border-0"
                    style={{
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
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
            <div className="text-center py-2 mt-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Processing photo...</span>
              </div>
              <small className="ms-2 text-muted">Processing photo...</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}