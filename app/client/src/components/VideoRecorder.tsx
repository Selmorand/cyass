import { useState, useRef, useEffect } from 'react'
import { storageService } from '../services/storage'
import { useNotification } from '../contexts/NotificationContext'

interface VideoRecorderProps {
  reportId: string
  roomId: string
  roomName: string
  onVideoUploaded: (videoUrl: string, duration: number, fileSize: number) => void
  existingVideoUrl?: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function VideoRecorder({
  reportId,
  roomId,
  roomName,
  onVideoUploaded,
  existingVideoUrl
}: VideoRecorderProps) {
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  const { showError, showSuccess, showWarning } = useNotification()

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  /**
   * Cleanup all media resources and memory
   */
  const cleanup = () => {
    try {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      console.log('VideoRecorder: Cleanup completed')
    } catch (error) {
      console.warn('VideoRecorder: Error during cleanup:', error)
    }
  }

  /**
   * Handle video capture - opens native camera app with its own preview
   * Same approach as photo capture
   */
  const handleVideoCaptureClick = () => {
    if (isMobile && videoInputRef.current) {
      // Create dynamic input for mobile (forces camera, not gallery)
      const newInput = document.createElement('input')
      newInput.type = 'file'
      newInput.accept = 'video/*'
      newInput.capture = 'environment' // Rear camera
      newInput.style.display = 'none'

      newInput.onchange = async (e: any) => {
        const file = e.target.files?.[0]
        if (!file) {
          cleanupInputElement(newInput)
          return
        }

        handleVideoSelected(file)
        cleanupInputElement(newInput)
      }

      document.body.appendChild(newInput)
      newInput.click()
    } else {
      // Desktop or fallback
      videoInputRef.current?.click()
    }
  }

  const cleanupInputElement = (input: HTMLInputElement) => {
    try {
      input.value = ''
      input.onchange = null
      if (input.parentNode) {
        input.parentNode.removeChild(input)
      }
    } catch (error) {
      console.warn('Error cleaning up input element:', error)
    }
  }

  const handleVideoSelected = async (file: File) => {
    try {
      // Clean up previous video if any
      cleanup()

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        showError(`Video file too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`)
        return
      }

      // Validate it's a video
      if (!file.type.startsWith('video/')) {
        showError('Please select a video file')
        return
      }

      console.log('Video selected:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      })

      setVideoFile(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setIsPreviewing(true)

    } catch (error) {
      console.error('Error handling video:', error)
      showError('Failed to process video')
    }
  }

  const handleVideoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      return
    }

    handleVideoSelected(file)

    // Clear input for next use
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setVideoDuration(Math.floor(video.duration))

    // Check duration limit (2 minutes = 120 seconds)
    if (video.duration > 120) {
      showWarning(`Video is ${formatTime(Math.floor(video.duration))} long. Recommended max is 2 minutes for faster uploads.`)
    }
  }

  const uploadVideo = async () => {
    if (!videoFile) return

    try {
      setIsUploading(true)

      // Upload video
      const videoUrl = await storageService.uploadVideo(videoFile, reportId, roomId)

      // Callback with video details
      onVideoUploaded(videoUrl, videoDuration, videoFile.size)

      showSuccess('Room walkthrough video uploaded successfully!')

      // Cleanup
      cleanup()
      setVideoFile(null)
      setIsPreviewing(false)
      setVideoDuration(0)

    } catch (error) {
      console.error('Failed to upload video:', error)
      showError(error instanceof Error ? error.message : 'Failed to upload video')
    } finally {
      setIsUploading(false)
    }
  }

  const discardVideo = () => {
    cleanup()
    setVideoFile(null)
    setIsPreviewing(false)
    setVideoDuration(0)
  }

  const deleteExistingVideo = () => {
    if (confirm('Delete the existing room walkthrough video?')) {
      onVideoUploaded('', 0, 0) // Empty values to delete
      showSuccess('Video removed')
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body p-3">
        <h5 className="card-title fw-medium text-dark mb-3">
          📹 Room Walkthrough Video (Optional)
        </h5>

        <p className="small text-muted mb-3">
          Record a video walkthrough of {roomName}. Your device camera app will open with its own preview.
        </p>

        {/* Hidden file input */}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleVideoCapture}
          style={{ display: 'none' }}
        />

        {/* Existing Video */}
        {existingVideoUrl && !isPreviewing && (
          <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
            <span className="small">✅ Video recorded for this room</span>
            <div>
              <a
                href={existingVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-primary me-2"
              >
                View
              </a>
              <button
                onClick={deleteExistingVideo}
                className="btn btn-sm btn-outline-danger"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Record Button */}
        {!isPreviewing && !existingVideoUrl && (
          <button
            onClick={handleVideoCaptureClick}
            className="btn btn-primary w-100"
            disabled={isUploading}
          >
            <span className="me-2">🎥</span>
            Record Video
          </button>
        )}

        {/* Preview & Upload */}
        {isPreviewing && videoFile && (
          <div>
            <div className="mb-3">
              <video
                ref={videoPreviewRef}
                src={previewUrl || undefined}
                controls
                className="w-100 rounded"
                style={{ maxHeight: '300px', backgroundColor: '#000' }}
                onLoadedMetadata={handleLoadedMetadata}
              />
            </div>

            <div className="d-flex align-items-center justify-content-between mb-3 small text-muted">
              <span>Duration: {formatTime(videoDuration)}</span>
              <span>Size: {(videoFile.size / 1024 / 1024).toFixed(1)}MB</span>
            </div>

            <div className="d-grid gap-2">
              <button
                onClick={uploadVideo}
                className="btn btn-success"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="me-2">✓</span>
                    Save Video
                  </>
                )}
              </button>

              <button
                onClick={discardVideo}
                className="btn btn-outline-secondary"
                disabled={isUploading}
              >
                Discard & Re-record
              </button>
            </div>
          </div>
        )}

        {/* Info */}
        {!isPreviewing && !existingVideoUrl && (
          <div className="alert alert-light mt-3 mb-0 small">
            <strong>Tips:</strong>
            <ul className="mb-0 mt-1 ps-3">
              <li>Your camera app will open with its own preview</li>
              <li>Hold phone steady and move slowly</li>
              <li>Show all areas of the room</li>
              <li>Keep recording under 2 minutes for faster upload</li>
              <li>Good lighting helps video quality</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
